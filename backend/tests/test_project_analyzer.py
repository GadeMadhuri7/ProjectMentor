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
from app.services.project_analyzer import analyze_project, extract_zip_safely


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
                'project_inventory',
            },
        )
        self.assertEqual(result['project_inventory']['source_files'], ['source/main.py'])
        self.assertIn('project_inventory', persisted.analysis_data)

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


if __name__ == '__main__':
    unittest.main()