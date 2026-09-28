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
DOCUMENTATION_EXTENSIONS = {'.md', '.markdown', '.rst', '.adoc', '.txt'}
CONFIG_EXTENSIONS = {'.cfg', '.conf', '.ini', '.json', '.toml', '.xml', '.yaml', '.yml'}
CONFIG_NAMES = {
    '.env', '.env.example', 'dockerfile', 'docker-compose.yml', 'package.json',
    'pipfile', 'pyproject.toml', 'requirements.txt', 'tsconfig.json',
}
TEST_DIRECTORY_NAMES = {'test', 'tests', '__tests__', 'spec', 'specs'}
TEST_NAME_MARKERS = ('test_', '_test.', '.test.', '.spec.')
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
MAX_SOURCE_FILES_INSPECTED = 100
MAX_SOURCE_FILE_BYTES = 128 * 1024
MAX_SOURCE_CONTENT_BYTES = 512 * 1024
MAX_SOURCE_CONTENT_PER_FILE_BYTES = 32 * 1024
SOURCE_CHUNK_LINES = 100
SOURCE_CHUNK_OVERLAP_LINES = 10
MAX_SOURCE_CHUNKS = 500
MAX_SOURCE_CHUNK_CONTENT_BYTES = 512 * 1024
SOURCE_TEXT_EXTENSIONS = frozenset(LANGUAGE_EXTENSIONS) | DOCUMENTATION_EXTENSIONS


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


def discover_files(root: Path) -> tuple[list[dict], list[str], list[str]]:
    files: list[dict] = []
    warnings: list[str] = []
    ignored_files: list[str] = []
    root = root.resolve()

    def record_ignored(path: str) -> None:
        if len(ignored_files) < MAX_STRUCTURE_ITEMS:
            ignored_files.append(path)

    for current, directories, filenames in os.walk(root, followlinks=False):
        current_path = Path(current)
        ignored_directories = [directory for directory in directories if directory in IGNORED_DIRECTORIES]
        for directory in ignored_directories:
            relative_path = (current_path / directory).relative_to(root).as_posix()
            record_ignored(f'{relative_path}/*')
        directories[:] = [directory for directory in directories if directory not in IGNORED_DIRECTORIES]
        for filename in filenames:
            path = current_path / filename
            if path.is_symlink() or should_ignore(path, root):
                record_ignored(path.relative_to(root).as_posix())
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
                return files, warnings, ignored_files

    return files, warnings, ignored_files


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


def _is_test_file(path: str) -> bool:
    path_object = Path(path)
    lower_path = path.lower().replace('\\', '/')
    return any(part.lower() in TEST_DIRECTORY_NAMES for part in path_object.parts[:-1]) or path_object.name.lower().startswith('test_') or any(marker in lower_path for marker in TEST_NAME_MARKERS)


def _is_documentation_file(path: str) -> bool:
    path_object = Path(path)
    return path_object.suffix.lower() in DOCUMENTATION_EXTENSIONS or path_object.name.lower() in {'readme', 'readme.txt'} or any(part.lower() in {'docs', 'doc', 'documentation'} for part in path_object.parts[:-1])


def _is_config_file(path: str) -> bool:
    path_object = Path(path)
    name = path_object.name.lower()
    return name in CONFIG_NAMES or name.startswith('vite.config.') or name.startswith('webpack.config.') or path_object.suffix.lower() in CONFIG_EXTENSIONS


def build_project_inventory(files: Iterable[dict], ignored_files: Iterable[str]) -> dict:
    inventory = {
        'source_files': [],
        'config_files': [],
        'documentation_files': [],
        'test_files': [],
        'ignored_files': list(ignored_files),
    }
    for item in files:
        path = item['path']
        if _is_test_file(path):
            category = 'test_files'
        elif _is_config_file(path):
            category = 'config_files'
        elif _is_documentation_file(path):
            category = 'documentation_files'
        elif detect_language(path):
            category = 'source_files'
        else:
            continue
        if len(inventory[category]) < MAX_STRUCTURE_ITEMS:
            inventory[category].append(path)
    return inventory


def build_project_structure(root: Path, files: list[dict]) -> dict:
    directories = sorted({str(Path(item['path']).parent).replace('\\', '/') for item in files if str(Path(item['path']).parent) != '.'})
    return {
        'root': root.name,
        'directories': directories[:MAX_STRUCTURE_ITEMS],
        'files': files[:MAX_STRUCTURE_ITEMS],
    }


def inspect_source_files(root: Path, files: list[dict]) -> tuple[list[dict], int, int]:
    candidates = sorted(
        (item for item in files if item['extension'] in SOURCE_TEXT_EXTENSIONS),
        key=lambda item: item['path'],
    )
    selected = candidates[:MAX_SOURCE_FILES_INSPECTED]
    inspected: list[dict] = []
    returned_content_bytes = 0

    for item in selected:
        path = root / item['path']
        record = {
            'path': item['path'],
            'language': detect_language(item['path']),
            'size_bytes': item['size'],
            'line_count': None,
            'content': None,
            'status': 'inspected',
        }
        try:
            with path.open('rb') as source_file:
                raw_content = source_file.read(MAX_SOURCE_FILE_BYTES + 1)
        except OSError:
            record['status'] = 'unreadable'
            inspected.append(record)
            continue

        if len(raw_content) > MAX_SOURCE_FILE_BYTES:
            record['status'] = 'too_large'
            inspected.append(record)
            continue
        if b'\x00' in raw_content:
            record['status'] = 'binary'
            inspected.append(record)
            continue
        try:
            content = raw_content.decode('utf-8')
        except UnicodeDecodeError:
            record['status'] = 'invalid_encoding'
            inspected.append(record)
            continue
        if any(ord(character) < 32 and character not in '\t\n\r\f' for character in content):
            record['status'] = 'binary'
            inspected.append(record)
            continue

        record['line_count'] = len(content.splitlines())
        if returned_content_bytes >= MAX_SOURCE_CONTENT_BYTES:
            record['status'] = 'content_limit'
        else:
            content_bytes = content.encode('utf-8')
            remaining_total = MAX_SOURCE_CONTENT_BYTES - returned_content_bytes
            content_limit = min(MAX_SOURCE_CONTENT_PER_FILE_BYTES, remaining_total)
            if len(content_bytes) > content_limit:
                content = content_bytes[:content_limit].decode('utf-8', errors='ignore')
                record['status'] = 'content_truncated'
            returned_content_bytes += len(content.encode('utf-8'))
            record['content'] = content
        inspected.append(record)

    return inspected, len(candidates), returned_content_bytes


def chunk_source_files(source_files: list[dict]) -> tuple[list[dict], list[str]]:
    chunks: list[dict] = []
    warnings: list[str] = []
    total_content_bytes = 0

    for source_file in sorted(source_files, key=lambda item: item['path']):
        content = source_file.get('content')
        if source_file.get('status') != 'inspected' or not isinstance(content, str) or not content:
            continue

        lines = content.splitlines(keepends=True)
        if not lines:
            continue

        start = 0
        chunk_index = 0
        while start < len(lines):
            end = min(start + SOURCE_CHUNK_LINES, len(lines))
            chunk_content = ''.join(lines[start:end])
            chunk_bytes = len(chunk_content.encode('utf-8'))
            if len(chunks) >= MAX_SOURCE_CHUNKS:
                warnings.append(
                    f'Source chunk generation is capped at {MAX_SOURCE_CHUNKS} chunks; '
                    'remaining chunks were omitted.'
                )
                return chunks, warnings
            if total_content_bytes + chunk_bytes > MAX_SOURCE_CHUNK_CONTENT_BYTES:
                warnings.append(
                    'Source chunk content reached the response limit; remaining chunks were omitted.'
                )
                return chunks, warnings

            chunks.append({
                'path': source_file['path'],
                'language': source_file.get('language'),
                'chunk_index': chunk_index,
                'start_line': start + 1,
                'end_line': end,
                'content': chunk_content,
            })
            total_content_bytes += chunk_bytes
            if end == len(lines):
                break
            start = end - SOURCE_CHUNK_OVERLAP_LINES
            chunk_index += 1

    return chunks, warnings


def analyze_project(root: Path, project_name: str | None = None) -> dict:
    root = root.resolve()
    files, warnings, ignored_files = discover_files(root)
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
    source_files, source_file_count, _ = inspect_source_files(root, files)
    if source_file_count > len(source_files):
        warnings.append(
            f'Source inspection is capped at {MAX_SOURCE_FILES_INSPECTED} files; '
            f'{source_file_count - len(source_files)} source files were not inspected.'
        )
    source_chunks, chunk_warnings = chunk_source_files(source_files)
    warnings.extend(chunk_warnings)
    return {
        'project_name': project_name or root.name,
        'total_files': len(files),
        'total_directories': len(directories),
        'languages': languages,
        'technologies': detect_technologies(root, files),
        'important_files': find_important_files(files),
        'structure': build_project_structure(root, files),
        'project_inventory': build_project_inventory(files, ignored_files),
        'source_files': source_files,
        'source_chunks': source_chunks,
        'analysis_warnings': warnings,
    }