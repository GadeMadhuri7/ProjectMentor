import tempfile
import zipfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project
from app.schemas import ProjectCreate, ProjectResponse
from app.services.project_analyzer import analyze_project, extract_zip_safely


router = APIRouter(prefix='/projects', tags=['projects'])
MAX_UPLOAD_BYTES = 50 * 1024 * 1024


@router.get('', response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    statement = select(Project).order_by(Project.created_at.desc())
    return db.scalars(statement).all()


@router.post('', response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**project_data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.post('/analyze')
async def analyze_uploaded_project(file: UploadFile = File(...)):
    if not file.filename or Path(file.filename).suffix.lower() != '.zip':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Upload a ZIP archive.')

    archive_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as temporary_archive:
            archive_path = Path(temporary_archive.name)
            total_size = 0
            while chunk := await file.read(1024 * 1024):
                total_size += len(chunk)
                if total_size > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail='Archive exceeds the 50 MB upload limit.',
                    )
                temporary_archive.write(chunk)

        if not zipfile.is_zipfile(archive_path):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='The uploaded file is not a valid ZIP archive.')

        with tempfile.TemporaryDirectory(prefix='projectmentor-analysis-') as temporary_directory:
            extracted_path = Path(temporary_directory)
            extract_zip_safely(archive_path, extracted_path)
            project_root = _find_project_root(extracted_path)
            return analyze_project(project_root, Path(file.filename).stem)
    except HTTPException:
        raise
    except (OSError, ValueError, zipfile.BadZipFile):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='The archive could not be safely analyzed.')
    finally:
        await file.close()
        if archive_path:
            archive_path.unlink(missing_ok=True)


def _find_project_root(extracted_path: Path) -> Path:
    entries = list(extracted_path.iterdir())
    directories = [entry for entry in entries if entry.is_dir()]
    files = [entry for entry in entries if entry.is_file()]
    if len(directories) == 1 and not files:
        return directories[0]
    return extracted_path