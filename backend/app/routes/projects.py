import tempfile
import zipfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, ProjectAnalysis
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
async def analyze_uploaded_project(
    file: UploadFile = File(...),
    project_id: int = Form(...),
    db: Session = Depends(get_db),
):
    if not file.filename or Path(file.filename).suffix.lower() != '.zip':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Upload a ZIP archive.')

    archive_path: Path | None = None
    try:
        try:
            project = db.get(Project, project_id)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='The project could not be loaded.',
            ) from None
        if project is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found.')

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
            analysis_data = analyze_project(project_root, Path(file.filename).stem)
        try:
            analysis = db.get(ProjectAnalysis, project_id)
            if analysis is None:
                analysis = ProjectAnalysis(project_id=project_id, analysis_data=analysis_data)
                db.add(analysis)
            else:
                analysis.analysis_data = analysis_data
            db.commit()
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Project analysis could not be saved.',
            ) from None
        return analysis_data
    except HTTPException:
        raise
    except (OSError, ValueError, zipfile.BadZipFile):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='The archive could not be safely analyzed.')
    finally:
        await file.close()
        if archive_path:
            archive_path.unlink(missing_ok=True)


@router.get('/{project_id}/analysis')
def get_project_analysis(project_id: int, db: Session = Depends(get_db)):
    try:
        analysis = db.get(ProjectAnalysis, project_id)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Project analysis could not be retrieved.',
        ) from None
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project analysis not found.')
    return analysis.analysis_data


def _find_project_root(extracted_path: Path) -> Path:
    entries = list(extracted_path.iterdir())
    directories = [entry for entry in entries if entry.is_dir()]
    files = [entry for entry in entries if entry.is_file()]
    if len(directories) == 1 and not files:
        return directories[0]
    return extracted_path