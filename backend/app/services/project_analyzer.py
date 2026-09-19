from __future__ import annotations

import json
import os
import zipfile
from pathlib import Path
from pathlib import PurePosixPath
from typing import Iterable


IGNORED_DIRECTORIES = {
    '.git', '.idea', '.next', '.venv', '.vscode', '__pycache__',
    'build', 'coverage', 'dist', 'env', 'node_modules', 'target', 'venv',
}
IGNORED_EXTENSIONS = {
    '.dll', '.exe', '.gif', '.ico', '.jpg', '.jpeg', '.mp3', '.mp4',
    '.png', '.webp', '.zip',
}
LANGUAGE_EXTENSIONS = {
    '.c': 'C', '.cc': 'C++', '.cpp': 'C++', '.cs': 'C#', '.css': 'CSS',
    '.go': 'Go', '.html': 'HTML', '.java': 'Java', '.js': 'JavaScript',
    '.json': 'JSON', '.jsx': 'JavaScript', '.py': 'Python', '.rs': 'Rust',
    '.sql': 'SQL', '.ts': 'TypeScript', '.tsx': 'TypeScript',
    '.yml': 'YAML', '.yaml': 'YAML',
}
IMPORTANT_NAMES = {
    'README.md', 'Dockerfile', 'docker-compose.yml', '.env.example',
    'package.json', 'requirements.txt', 'pyproject.toml', 'Pipfile',
    'pom.xml', 'build.gradle', 'build.gradle.kts', 'tsconfig.json',
    'manage.py', 'main.py', 'app.py',
}
MAX_FILES = 5000
MAX_MANIFEST_BYTES = 512 * 1024
MAX_STRUCTURE_ITEMS = 1000
MAX_ARCHIVE_MEMBERS = 5000
MAX_ARCHIVE_BYTES = 100 * 1024 * 1024


def should_ignore(path: Path, root: Path) -> bool:
    relative_parts = path.relative_to(root).parts
    checked_parts = relative_parts[:-1] if path.is_file() else relative_parts
    if any(part in IGNORED_DIRECTORIES for part in checked_parts):
        return True
    return path.suffix.lower() in IGNORED_EXTENSIONS


def extract_zip_safely(archive_path: Path, destination: Path) -> None:
    with zipfile.ZipFile(archive_path) as archive:
        members = archive.infolist()
        if len(members) > MAX_ARCHIVE_MEMBERS:
            raise ValueError('Archive contains too many entries.')
        total_size = 0
        destination = destination.resolve()
        for member in members:
            member_path = PurePosixPath(member.filename)
            if member_path.is_absolute() or '..' in member_path.parts:
                raise ValueError('Archive contains an unsafe path.')
            unix_mode = (member.external_attr >> 16) & 0o170000
            if unix_mode == 0o120000:
                raise ValueError('Archive contains an unsupported symbolic link.')
            total_size += member.file_size
            if total_size > MAX_ARCHIVE_BYTES:
                raise ValueError('Archive expands beyond the allowed size.')
            target = (destination / Path(*member_path.parts)).resolve()
            if not target.is_relative_to(destination):
                raise ValueError('Archive contains an unsafe path.')
        archive.extractall(destination)


def discover_files(root: Path) -> tuple[list[dict], list[str]]:
    files: list[dict] = []
    warnings: list[str] = []
    root = root.resolve()

    for current, directories, filenames in os.walk(root, followlinks=False):
        current_path = Path(current)
        directories[:] = [directory for directory in directories if directory not in IGNORED_DIRECTORIES]
        for filename in filenames:
            path = current_path / filename
            if path.is_symlink() or should_ignore(path, root):
                continue
            try:
                relative_path = path.relative_to(root)
                size = path.stat().st_size
            except OSError:
                warnings.append(f'Unreadable file skipped: {path.name}')
                continue
            files.append({'path': relative_path.as_posix(), 'extension': path.suffix.lower(), 'size': size})
            if len(files) >= MAX_FILES:
                warnings.append(f'File limit reached; analysis is capped at {MAX_FILES} files.')
                return files, warnings

    return files, warnings


def detect_language(path: str) -> str | None:
    return LANGUAGE_EXTENSIONS.get(Path(path).suffix.lower())


def _read_manifest(root: Path, relative_path: str) -> str:
    path = root / relative_path
    try:
        with path.open('r', encoding='utf-8', errors='ignore') as manifest:
            return manifest.read(MAX_MANIFEST_BYTES)
    except OSError:
        return ''


def _has_dependency(text: str, name: str) -> bool:
    return name.lower() in text.lower()


def detect_technologies(root: Path, files: Iterable[dict]) -> list[str]:
    paths = {item['path'] for item in files}
    technologies: list[str] = []

    python_manifests = [path for path in ('requirements.txt', 'pyproject.toml', 'Pipfile') if path in paths]
    python_text = '\n'.join(_read_manifest(root, path) for path in python_manifests)
    for dependency, label in (
        ('fastapi', 'FastAPI'), ('django', 'Django'), ('flask', 'Flask'),
        ('sqlalchemy', 'SQLAlchemy'), ('pandas', 'pandas'), ('numpy', 'numpy'),
    ):
        if _has_dependency(python_text, dependency):
            technologies.append(label)

    package_text = _read_manifest(root, 'package.json') if 'package.json' in paths else ''
    if package_text:
        try:
            package = json.loads(package_text)
            dependencies = {**package.get('dependencies', {}), **package.get('devDependencies', {})}
            for dependency, label in (
                ('react', 'React'), ('vite', 'Vite'), ('next', 'Next.js'),
                ('express', 'Express'),
            ):
                if dependency in dependencies:
                    technologies.append(label)
            technologies.append('Node.js')
        except (TypeError, json.JSONDecodeError):
            pass

    java_text = '\n'.join(_read_manifest(root, path) for path in ('pom.xml', 'build.gradle', 'build.gradle.kts') if path in paths)
    if _has_dependency(java_text, 'spring'):
        technologies.append('Spring')
    if _has_dependency(java_text, 'spring-boot'):
        technologies.append('Spring Boot')

    return list(dict.fromkeys(technologies))


def find_important_files(files: Iterable[dict]) -> list[str]:
    return [item['path'] for item in files if Path(item['path']).name in IMPORTANT_NAMES or Path(item['path']).name.startswith('vite.config.')]


def build_project_structure(root: Path, files: list[dict]) -> dict:
    directories = sorted({str(Path(item['path']).parent).replace('\\', '/') for item in files if str(Path(item['path']).parent) != '.'})
    return {
        'root': root.name,
        'directories': directories[:MAX_STRUCTURE_ITEMS],
        'files': files[:MAX_STRUCTURE_ITEMS],
    }


def analyze_project(root: Path, project_name: str | None = None) -> dict:
    root = root.resolve()
    files, warnings = discover_files(root)
    language_counts: dict[str, int] = {}
    for item in files:
        language = detect_language(item['path'])
        if language:
            language_counts[language] = language_counts.get(language, 0) + 1
    languages = [
        {'name': name, 'file_count': count}
        for name, count in sorted(language_counts.items(), key=lambda entry: (-entry[1], entry[0]))
    ]
    directories = {str(Path(item['path']).parent) for item in files if str(Path(item['path']).parent) != '.'}
    return {
        'project_name': project_name or root.name,
        'total_files': len(files),
        'total_directories': len(directories),
        'languages': languages,
        'technologies': detect_technologies(root, files),
        'important_files': find_important_files(files),
        'structure': build_project_structure(root, files),
        'analysis_warnings': warnings,
    }