from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_ORIGIN
from app.database import Base, engine
from app.routes.projects import router as projects_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title='ProjectMentor API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(projects_router, prefix='/api')


@app.get('/api/health')
def health_check():
    return {'status': 'ok', 'service': 'ProjectMentor API'}