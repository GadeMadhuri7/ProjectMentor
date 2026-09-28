from __future__ import annotations

import math

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, ProjectAnalysis, ProjectChunkEmbedding
from app.services.embedding_service import generate_embedding


MAX_RETRIEVAL_TOP_K = 20


class ProjectNotFoundError(Exception):
    pass


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if len(left) != len(right) or not left:
        return 0.0
    if any(
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
        for value in (*left, *right)
    ):
        return 0.0

    dot_product = sum(left_value * right_value for left_value, right_value in zip(left, right))
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    similarity = dot_product / (left_norm * right_norm)
    return similarity if math.isfinite(similarity) else 0.0


def retrieve_project_chunks(
    db: Session,
    project_id: int,
    question: str,
    top_k: int,
) -> list[dict]:
    if not question.strip():
        raise ValueError('Question must not be empty.')
    if isinstance(top_k, bool) or not isinstance(top_k, int) or not 1 <= top_k <= MAX_RETRIEVAL_TOP_K:
        raise ValueError(f'top_k must be between 1 and {MAX_RETRIEVAL_TOP_K}.')

    project = db.get(Project, project_id)
    if project is None:
        raise ProjectNotFoundError()

    embedding_rows = db.scalars(
        select(ProjectChunkEmbedding)
        .where(ProjectChunkEmbedding.project_id == project_id)
    ).all()
    if not embedding_rows:
        return []

    analysis = db.get(ProjectAnalysis, project_id)
    if analysis is None or not isinstance(analysis.analysis_data, dict):
        return []
    source_chunks = analysis.analysis_data.get('source_chunks')
    if not isinstance(source_chunks, list):
        return []

    question_vector = generate_embedding(question)
    chunk_by_key = {
        (chunk.get('path'), chunk.get('chunk_index'), chunk.get('start_line'), chunk.get('end_line')): chunk
        for chunk in source_chunks
        if isinstance(chunk, dict)
    }
    results = []
    for embedding in embedding_rows:
        key = (
            embedding.source_path,
            embedding.chunk_index,
            embedding.start_line,
            embedding.end_line,
        )
        chunk = chunk_by_key.get(key)
        if not isinstance(chunk, dict):
            continue
        content = chunk.get('content')
        if not isinstance(content, str) or not content:
            continue
        if not isinstance(embedding.vector, list) or embedding.dimension != len(embedding.vector):
            continue

        results.append({
            'path': embedding.source_path,
            'chunk_index': embedding.chunk_index,
            'start_line': embedding.start_line,
            'end_line': embedding.end_line,
            'content': content,
            'similarity': cosine_similarity(question_vector, embedding.vector),
        })

    results.sort(key=lambda result: (
        -result['similarity'],
        result['path'],
        result['chunk_index'],
    ))
    return results[:top_k]