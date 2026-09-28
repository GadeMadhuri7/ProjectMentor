import json
import asyncio
from io import BytesIO
import tempfile
import unittest
import zipfile
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.database import Base
from app.models import Project, ProjectAnalysis
from app.routes.projects import analyze_uploaded_project, get_project_analysis
from app.services.project_analyzer import (
    MAX_SOURCE_CONTENT_BYTES,
    MAX_SOURCE_CONTENT_PER_FILE_BYTES,
    MAX_SOURCE_CHUNKS,
    MAX_SOURCE_CHUNK_CONTENT_BYTES,
    MAX_SOURCE_FILES_INSPECTED,
    MAX_SOURCE_FILE_BYTES,
    SOURCE_CHUNK_LINES,
    SOURCE_CHUNK_OVERLAP_LINES,
    analyze_project,
    chunk_source_files,
    extract_zip_safely,
)


class ProjectAnalyzerTests(unittest.TestCase):
    def test_discovers_files_ignores_generated_directories_and_detects_metadata(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / 'src').mkdir()
            (root / 'node_modules').mkdir()
            (root / 'src' / 'main.py').write_text('print("static only")', encoding='utf-8')
            (root / 'src' / 'app.js').write_text('export default {}', encoding='utf-8')
            (root / 'node_modules' / 'ignored.js').write_text('', encoding='utf-8')
            (root / 'ignored.png').write_bytes(b'not inspected')
            (root / 'requirements.txt').write_text('fastapi\nSQLAlchemy\n', encoding='utf-8')
            (root / 'package.json').write_text(json.dumps({'dependencies': {'react': '^19.0.0', 'vite': '^8.0.0'}}), encoding='utf-8')
            (root / 'README.md').write_text('# Example', encoding='utf-8')

            result = analyze_project(root, 'example')

            paths = {item['path'] for item in result['structure']['files']}
            self.assertEqual(result['project_name'], 'example')
            self.assertEqual(result['total_files'], 5)
            self.assertNotIn('node_modules/ignored.js', paths)
            languages = {item['name']: item['file_count'] for item in result['languages']}
            self.assertEqual(languages['JavaScript'], 1)
            self.assertEqual(languages['Python'], 1)
            self.assertEqual(set(result['technologies']), {'FastAPI', 'SQLAlchemy', 'React', 'Vite', 'Node.js'})
            self.assertIn('README.md', result['important_files'])

            self.assertEqual(set(result['project_inventory']['source_files']), {'src/app.js', 'src/main.py'})
            self.assertEqual(result['project_inventory']['config_files'], ['package.json', 'requirements.txt'])
            self.assertEqual(result['project_inventory']['documentation_files'], ['README.md'])
            self.assertEqual(result['project_inventory']['test_files'], [])
            self.assertIn('node_modules/*', result['project_inventory']['ignored_files'])
            self.assertIn('ignored.png', result['project_inventory']['ignored_files'])

            for field in (
                'project_name', 'total_files', 'total_directories', 'languages',
                'technologies', 'important_files', 'structure', 'analysis_warnings',
                'project_inventory', 'source_files', 'source_chunks',
            ):
                self.assertIn(field, result)

    def test_categorizes_tests_and_nested_project_context_files(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / 'tests').mkdir()
            (root / 'docs').mkdir()
            (root / 'config').mkdir()
            (root / 'tests' / 'test_analyzer.py').write_text('', encoding='utf-8')
            (root / 'src').mkdir()
            (root / 'src' / 'widget.test.js').write_text('', encoding='utf-8')
            (root / 'docs' / 'guide.md').write_text('', encoding='utf-8')
            (root / 'config' / 'settings.toml').write_text('', encoding='utf-8')

            result = analyze_project(root, 'categorized')

            self.assertEqual(set(result['project_inventory']['test_files']), {'tests/test_analyzer.py', 'src/widget.test.js'})
            self.assertEqual(result['project_inventory']['documentation_files'], ['docs/guide.md'])
            self.assertEqual(result['project_inventory']['config_files'], ['config/settings.toml'])
            self.assertEqual(result['project_inventory']['source_files'], [])

    def test_rejects_zip_path_traversal(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            archive_path = root / 'unsafe.zip'
            destination = root / 'extracted'
            destination.mkdir()
            with zipfile.ZipFile(archive_path, 'w') as archive:
                archive.writestr('../../outside.txt', 'unsafe')

            with self.assertRaises(ValueError):
                extract_zip_safely(archive_path, destination)
            self.assertFalse((root.parent / 'outside.txt').exists())

    def test_upload_endpoint_analyzes_safe_zip(self):
        archive = BytesIO()
        with zipfile.ZipFile(archive, 'w') as zip_file:
            zip_file.writestr('demo/requirements.txt', 'fastapi\n')
            zip_file.writestr('demo/main.py', 'print("not executed")')
        archive.seek(0)

        engine = create_engine('sqlite:///:memory:')
        Base.metadata.create_all(engine)
        with Session(engine) as db:
            project = Project(name='demo')
            db.add(project)
            db.commit()
            db.refresh(project)
            result = asyncio.run(analyze_uploaded_project(
                UploadFile(archive, filename='demo.zip'), project.id, db,
            ))

        self.assertEqual(result['project_name'], 'demo')
        self.assertEqual(result['total_files'], 2)
        self.assertEqual(result['technologies'], ['FastAPI'])
        self.assertIn('project_inventory', result)


class ProjectAnalysisPersistenceTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite:///:memory:')
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.project = Project(name='primary project')
        self.other_project = Project(name='other project')
        self.db.add_all([self.project, self.other_project])
        self.db.commit()
        self.db.refresh(self.project)
        self.db.refresh(self.other_project)

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def _analyze_archive(self, project_id, entries, filename='source.zip'):
        archive = BytesIO()
        with zipfile.ZipFile(archive, 'w') as zip_file:
            for path, content in entries.items():
                zip_file.writestr(path, content)
        archive.seek(0)
        return asyncio.run(analyze_uploaded_project(
            UploadFile(archive, filename=filename), project_id, self.db,
        ))

    def test_persists_and_retrieves_analysis_for_the_requested_project(self):
        result = self._analyze_archive(
            self.project.id,
            {'source/main.py': 'print("static only")', 'README.md': '# Project'},
        )

        persisted = self.db.get(ProjectAnalysis, self.project.id)
        self.assertIsNotNone(persisted)
        self.assertEqual(persisted.analysis_data, result)
        self.assertIsNone(self.db.get(ProjectAnalysis, self.other_project.id))
        self.assertEqual(get_project_analysis(self.project.id, self.db), result)
        self.assertEqual(
            set(result),
            {
                'project_name', 'total_files', 'total_directories', 'languages',
                'technologies', 'important_files', 'structure', 'analysis_warnings',
                'project_inventory', 'source_files', 'source_chunks',
            },
        )
        self.assertEqual(result['project_inventory']['source_files'], ['source/main.py'])
        self.assertIn('project_inventory', persisted.analysis_data)
        self.assertEqual(persisted.analysis_data['source_chunks'], result['source_chunks'])

    def test_reanalysis_replaces_the_current_record(self):
        first_result = self._analyze_archive(
            self.project.id,
            {'src/first.py': 'print(1)'},
        )
        second_result = self._analyze_archive(
            self.project.id,
            {'src/second.py': 'print(2)', 'README.md': '# Updated'},
        )

        records = self.db.query(ProjectAnalysis).filter_by(project_id=self.project.id).all()
        self.assertEqual(len(records), 1)
        self.assertNotEqual(first_result, second_result)
        self.assertEqual(records[0].analysis_data, second_result)
        self.assertEqual(get_project_analysis(self.project.id, self.db), second_result)

    def test_analysis_requires_an_existing_project(self):
        with self.assertRaises(HTTPException) as error:
            self._analyze_archive(9999, {'main.py': ''})

        self.assertEqual(error.exception.status_code, 404)


class SourceInspectionTests(unittest.TestCase):
    def test_inspects_supported_source_files_with_metadata_and_content(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / 'main.py').write_text('first line\nsecond line\n', encoding='utf-8')
            (root / 'app.tsx').write_text('const view = <div />\n', encoding='utf-8')
            (root / 'notes.md').write_text('# Notes\n', encoding='utf-8')
            (root / 'image.png').write_bytes(b'\x89PNG\x00')
            (root / 'archive.xyz').write_text('not a supported source file', encoding='utf-8')

            result = analyze_project(root)
            inspected = {item['path']: item for item in result['source_files']}

            self.assertEqual(set(inspected), {'app.tsx', 'main.py', 'notes.md'})
            self.assertEqual(inspected['main.py']['language'], 'Python')
            self.assertEqual(inspected['main.py']['size_bytes'], (root / 'main.py').stat().st_size)
            self.assertEqual(inspected['main.py']['line_count'], 2)
            self.assertEqual(inspected['main.py']['content'], (root / 'main.py').read_bytes().decode('utf-8'))
            self.assertEqual(inspected['notes.md']['language'], None)
            self.assertIn('project_inventory', result)

    def test_marks_binary_invalid_encoding_and_oversized_files_without_content(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / 'binary.py').write_bytes(b'print(1)\x01')
            (root / 'invalid.js').write_bytes(b'\xff\xfe')
            large_content = b'x' * (MAX_SOURCE_FILE_BYTES + 1)
            (root / 'large.py').write_bytes(large_content)

            result = analyze_project(root)
            inspected = {item['path']: item for item in result['source_files']}

            self.assertEqual(inspected['binary.py']['status'], 'binary')
            self.assertEqual(inspected['invalid.js']['status'], 'invalid_encoding')
            self.assertEqual(inspected['large.py']['status'], 'too_large')
            self.assertEqual(inspected['large.py']['size_bytes'], len(large_content))
            self.assertIsNone(inspected['large.py']['content'])
            self.assertIsNone(inspected['large.py']['line_count'])

    def test_ignored_directories_are_not_inspected(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            ignored_directory = root / 'node_modules'
            ignored_directory.mkdir()
            (ignored_directory / 'dependency.py').write_text('ignored', encoding='utf-8')
            (root / 'kept.py').write_text('kept', encoding='utf-8')

            result = analyze_project(root)

            self.assertEqual([item['path'] for item in result['source_files']], ['kept.py'])

    def test_file_count_and_returned_content_are_bounded_deterministically(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            for index in reversed(range(MAX_SOURCE_FILES_INSPECTED + 5)):
                (root / f'{index:03}.py').write_text('x\n', encoding='utf-8')

            result = analyze_project(root)

            inspected = result['source_files']
            self.assertEqual(len(inspected), MAX_SOURCE_FILES_INSPECTED)
            self.assertEqual(inspected[0]['path'], '000.py')
            self.assertEqual(inspected[-1]['path'], f'{MAX_SOURCE_FILES_INSPECTED - 1:03}.py')
            self.assertTrue(any('5 source files were not inspected' in warning for warning in result['analysis_warnings']))

        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            for index in range(20):
                (root / f'{index:02}.py').write_text(
                    'x' * (MAX_SOURCE_CONTENT_PER_FILE_BYTES + 1), encoding='utf-8',
                )

            result = analyze_project(root)
            content_bytes = sum(
                len(item['content'].encode('utf-8'))
                for item in result['source_files']
                if item['content'] is not None
            )

            self.assertLessEqual(content_bytes, MAX_SOURCE_CONTENT_BYTES)
            self.assertTrue(any(item['status'] == 'content_truncated' for item in result['source_files']))
            self.assertTrue(any(item['status'] == 'content_limit' for item in result['source_files']))


class SourceChunkingTests(unittest.TestCase):
    def test_short_file_produces_one_chunk_with_line_metadata(self):
        chunks, warnings = chunk_source_files([{
            'path': 'src/short.py',
            'language': 'Python',
            'status': 'inspected',
            'content': 'one\ntwo\n',
        }])

        self.assertEqual(warnings, [])
        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0]['chunk_index'], 0)
        self.assertEqual(chunks[0]['start_line'], 1)
        self.assertEqual(chunks[0]['end_line'], 2)
        self.assertEqual(chunks[0]['content'], 'one\ntwo\n')

    def test_long_file_chunks_with_line_overlap_and_deterministic_order(self):
        source_files = [
            {
                'path': 'z.py',
                'language': 'Python',
                'status': 'inspected',
                'content': ''.join(f'z{line:03}\n' for line in range(1, 3)),
            },
            {
                'path': 'a.py',
                'language': 'Python',
                'status': 'inspected',
                'content': ''.join(f'line{line:03}\n' for line in range(1, 206)),
            },
        ]

        chunks, warnings = chunk_source_files(source_files)
        repeated_chunks, repeated_warnings = chunk_source_files(list(reversed(source_files)))
        file_chunks = [chunk for chunk in chunks if chunk['path'] == 'a.py']

        self.assertEqual(warnings, [])
        self.assertEqual(repeated_warnings, [])
        self.assertEqual(chunks, repeated_chunks)
        self.assertEqual([chunk['path'] for chunk in chunks[:3]], ['a.py', 'a.py', 'a.py'])
        self.assertEqual(
            [(chunk['chunk_index'], chunk['start_line'], chunk['end_line']) for chunk in file_chunks],
            [(0, 1, 100), (1, 91, 190), (2, 181, 205)],
        )
        self.assertEqual(SOURCE_CHUNK_OVERLAP_LINES, 10)
        self.assertEqual(
            file_chunks[0]['content'].splitlines()[-SOURCE_CHUNK_OVERLAP_LINES:],
            file_chunks[1]['content'].splitlines()[:SOURCE_CHUNK_OVERLAP_LINES],
        )
        self.assertEqual(SOURCE_CHUNK_LINES, 100)

    def test_empty_and_non_inspected_files_produce_no_chunks(self):
        source_files = [
            {'path': 'empty.py', 'language': 'Python', 'status': 'inspected', 'content': ''},
            {'path': 'binary.py', 'language': 'Python', 'status': 'binary', 'content': None},
            {'path': 'invalid.py', 'language': 'Python', 'status': 'invalid_encoding', 'content': None},
            {'path': 'large.py', 'language': 'Python', 'status': 'too_large', 'content': None},
            {'path': 'unreadable.py', 'language': 'Python', 'status': 'unreadable', 'content': None},
            {'path': 'partial.py', 'language': 'Python', 'status': 'content_truncated', 'content': 'partial'},
        ]

        chunks, warnings = chunk_source_files(source_files)

        self.assertEqual(chunks, [])
        self.assertEqual(warnings, [])

    def test_global_chunk_count_is_bounded_with_warning(self):
        source_files = [
            {
                'path': f'{name}.py',
                'language': 'Python',
                'status': 'inspected',
                'content': '\n' * MAX_SOURCE_CONTENT_PER_FILE_BYTES,
            }
            for name in ('a', 'b')
        ]

        chunks, warnings = chunk_source_files(source_files)

        self.assertEqual(len(chunks), MAX_SOURCE_CHUNKS)
        self.assertEqual(len(warnings), 1)
        self.assertIn('capped at', warnings[0])

    def test_total_chunk_content_is_bounded_with_warning(self):
        content = ('x' * 176 + '\n') * 180
        source_files = [
            {
                'path': f'{index:02}.py',
                'language': 'Python',
                'status': 'inspected',
                'content': content,
            }
            for index in range(16)
        ]

        chunks, warnings = chunk_source_files(source_files)
        total_content_bytes = sum(len(chunk['content'].encode('utf-8')) for chunk in chunks)

        self.assertLessEqual(total_content_bytes, MAX_SOURCE_CHUNK_CONTENT_BYTES)
        self.assertEqual(len(warnings), 1)
        self.assertIn('response limit', warnings[0])


if __name__ == '__main__':
    unittest.main()