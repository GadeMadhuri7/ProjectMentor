from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Project(Base):
    __tablename__ = 'projects'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
    analysis: Mapped['ProjectAnalysis | None'] = relationship(
        back_populates='project',
        cascade='all, delete-orphan',
        uselist=False,
    )


class ProjectAnalysis(Base):
    __tablename__ = 'project_analyses'

    project_id: Mapped[int] = mapped_column(
        ForeignKey('projects.id', ondelete='CASCADE'),
        primary_key=True,
    )
    analysis_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    project: Mapped[Project] = relationship(back_populates='analysis')


class ProjectChunkEmbedding(Base):
    __tablename__ = 'project_chunk_embeddings'

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    source_path: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    start_line: Mapped[int] = mapped_column(Integer, nullable=False)
    end_line: Mapped[int] = mapped_column(Integer, nullable=False)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    model: Mapped[str] = mapped_column(String(255), nullable=False)
    dimension: Mapped[int] = mapped_column(Integer, nullable=False)
    vector: Mapped[list] = mapped_column(JSON, nullable=False)