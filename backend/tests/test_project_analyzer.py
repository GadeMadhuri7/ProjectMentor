import json
import asyncio
from io import BytesIO
import tempfile
import unittest
import zipfile
from pathlib import Path

from fastapi import UploadFile

from app.routes.projects import analyze_uploaded_project
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

        result = asyncio.run(analyze_uploaded_project(UploadFile(archive, filename='demo.zip')))

        self.assertEqual(result['project_name'], 'demo')
        self.assertEqual(result['total_files'], 2)
        self.assertEqual(result['technologies'], ['FastAPI'])


if __name__ == '__main__':
    unittest.main()