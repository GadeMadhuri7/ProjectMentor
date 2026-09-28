from __future__ import annotations

import json
import logging
import math
from functools import lru_cache
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from app.config import (
    EMBEDDING_API_BASE_URL,
    EMBEDDING_API_KEY,
    EMBEDDING_MODEL,
    EMBEDDING_PROVIDER,
    LOCAL_EMBEDDING_MODEL,
)
from app.services.project_analyzer import MAX_SOURCE_CHUNK_CONTENT_BYTES, MAX_SOURCE_CHUNKS


EMBEDDING_BATCH_SIZE = 32
EMBEDDING_REQUEST_TIMEOUT_SECONDS = 30
MAX_EMBEDDING_RESPONSE_BYTES = 4 * 1024 * 1024
MAX_PROVIDER_ERROR_BODY_BYTES = 2048

logger = logging.getLogger(__name__)


class EmbeddingGenerationError(Exception):
    pass


def _provider_error_summary(message: str) -> str:
    normalized = message.lower()
    if any(marker in normalized for marker in ('rate limit', 'tpm', 'rpm', 'quota')):
        return 'provider rate or token quota rejected the request'
    if any(marker in normalized for marker in ('unauthorized', 'authentication', 'api key', 'credential')):
        return 'provider rejected authentication'
    if any(marker in normalized for marker in ('context length', 'token limit', 'too many tokens', 'input length')):
        return 'provider input exceeded a model limit'
    if any(marker in normalized for marker in ('model not found', 'unsupported model', 'invalid model')):
        return 'provider rejected or could not find the configured model'
    if any(marker in normalized for marker in ('not found', '404')):
        return 'provider endpoint or model was not found'
    if any(marker in normalized for marker in ('overloaded', 'temporarily unavailable', 'service unavailable')):
        return 'provider is temporarily unavailable'
    return 'provider rejected the request; response details omitted'


def _exception_summary(error: Exception) -> str:
    if isinstance(error, TimeoutError):
        return 'provider request timed out'
    if isinstance(error, URLError):
        return 'provider network or TLS connection failed'
    if isinstance(error, json.JSONDecodeError):
        return 'provider returned invalid JSON'
    if isinstance(error, (KeyError, IndexError, TypeError)):
        return 'provider response had an unexpected format'
    return 'provider request failed; exception details omitted'


class OpenAICompatibleEmbeddingProvider:
    name = 'openai-compatible'

    def __init__(self, model: str, api_key: str, base_url: str):
        parsed_url = urlsplit(base_url)
        if (
            parsed_url.scheme != 'https'
            or not parsed_url.hostname
            or parsed_url.username
            or parsed_url.password
            or parsed_url.query
            or parsed_url.fragment
        ):
            raise EmbeddingGenerationError('Embedding provider endpoint must be a valid HTTPS URL.')
        self.model = model
        self.api_key = api_key
        self.endpoint = f'{base_url.rstrip("/")}/embeddings'

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        request_body = json.dumps({'model': self.model, 'input': texts}).encode('utf-8')
        request = Request(
            self.endpoint,
            data=request_body,
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )
        try:
            with urlopen(request, timeout=EMBEDDING_REQUEST_TIMEOUT_SECONDS) as response:
                response_body = response.read(MAX_EMBEDDING_RESPONSE_BYTES + 1)
            if len(response_body) > MAX_EMBEDDING_RESPONSE_BYTES:
                raise EmbeddingGenerationError('Embedding provider response exceeded the allowed size.')
            payload = json.loads(response_body)
            data = payload['data']
            if not isinstance(data, list) or len(data) != len(texts):
                raise EmbeddingGenerationError('Embedding provider returned an invalid response.')
            vectors: list[list[float] | None] = [None] * len(texts)
            for item in data:
                index = item['index']
                vector = item['embedding']
                if isinstance(index, bool) or not isinstance(index, int) or not 0 <= index < len(texts):
                    raise EmbeddingGenerationError('Embedding provider returned an invalid response.')
                vectors[index] = _validated_vector(vector)
            if any(vector is None for vector in vectors):
                raise EmbeddingGenerationError('Embedding provider returned an invalid response.')
            return [vector for vector in vectors if vector is not None]
        except HTTPError as error:
            try:
                error_body = error.read(MAX_PROVIDER_ERROR_BODY_BYTES).decode('utf-8', errors='replace')
            except Exception:
                error_body = ''
            summary = _provider_error_summary(error_body)
            logger.warning('Embedding provider HTTP error status=%s: %s', error.code, summary)
            raise EmbeddingGenerationError('Embedding provider request failed.') from None
        except EmbeddingGenerationError as error:
            logger.warning(
                'Embedding provider response failure type=%s: %s',
                type(error).__name__,
                _provider_error_summary(str(error)),
            )
            raise
        except Exception as error:
            logger.warning(
                'Embedding provider failure type=%s: %s',
                type(error).__name__,
                _exception_summary(error),
            )
            raise EmbeddingGenerationError('Embedding provider request failed.') from None


@lru_cache(maxsize=1)
def _load_local_sentence_transformer(model_name: str):
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(model_name, device='cpu')


class LocalSentenceTransformerEmbeddingProvider:
    name = 'local'

    def __init__(self, model: str):
        self.model = model

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            model = _load_local_sentence_transformer(self.model)
            vectors = model.encode(
                texts,
                batch_size=EMBEDDING_BATCH_SIZE,
                convert_to_numpy=True,
                normalize_embeddings=False,
                show_progress_bar=False,
            )
            result = [
                _validated_vector(vector.tolist())
                for vector in vectors
            ]
            if len(result) != len(texts):
                raise EmbeddingGenerationError('Local embedding model returned an invalid response.')
            return result
        except EmbeddingGenerationError:
            raise
        except Exception as error:
            logger.warning(
                'Local embedding failure type=%s: %s',
                type(error).__name__,
                'model loading or inference failed; details omitted',
            )
            raise EmbeddingGenerationError('Local embedding generation failed.') from None


def _validated_vector(vector: object) -> list[float]:
    if not isinstance(vector, list) or not vector:
        raise EmbeddingGenerationError('Embedding provider returned an invalid vector.')
    if any(
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
        for value in vector
    ):
        raise EmbeddingGenerationError('Embedding provider returned an invalid vector.')
    return [float(value) for value in vector]


def generate_embedding(text: str) -> list[float]:
    if not isinstance(text, str) or not text.strip():
        raise EmbeddingGenerationError('Embedding input must not be empty.')
    provider = create_embedding_provider()
    try:
        vectors = provider.embed_batch([text])
        if not isinstance(vectors, list) or len(vectors) != 1:
            raise EmbeddingGenerationError('Embedding provider returned an invalid response.')
        return _validated_vector(vectors[0])
    except EmbeddingGenerationError:
        raise
    except Exception:
        raise EmbeddingGenerationError('Embedding provider request failed.') from None


def create_embedding_provider() -> OpenAICompatibleEmbeddingProvider | LocalSentenceTransformerEmbeddingProvider:
    if EMBEDDING_PROVIDER == 'local':
        if not LOCAL_EMBEDDING_MODEL:
            raise EmbeddingGenerationError('Local embedding model is not configured.')
        return LocalSentenceTransformerEmbeddingProvider(LOCAL_EMBEDDING_MODEL)

    if EMBEDDING_PROVIDER != 'openai-compatible' or not EMBEDDING_MODEL or not EMBEDDING_API_KEY:
        raise EmbeddingGenerationError('Embedding provider is not configured.')
    return OpenAICompatibleEmbeddingProvider(
        EMBEDDING_MODEL,
        EMBEDDING_API_KEY,
        EMBEDDING_API_BASE_URL,
    )


def _eligible_chunks(chunks: list[dict]) -> list[dict]:
    if len(chunks) > MAX_SOURCE_CHUNKS:
        raise EmbeddingGenerationError('Source chunk count exceeds the embedding limit.')
    eligible = []
    for chunk in chunks:
        if not isinstance(chunk, dict):
            continue
        path = chunk.get('path')
        chunk_index = chunk.get('chunk_index')
        start_line = chunk.get('start_line')
        end_line = chunk.get('end_line')
        content = chunk.get('content')
        if (
            not isinstance(path, str)
            or not path
            or isinstance(chunk_index, bool)
            or not isinstance(chunk_index, int)
            or chunk_index < 0
            or isinstance(start_line, bool)
            or not isinstance(start_line, int)
            or start_line < 1
            or isinstance(end_line, bool)
            or not isinstance(end_line, int)
            or end_line < start_line
            or not isinstance(content, str)
            or not content.strip()
        ):
            continue
        eligible.append(chunk)
    eligible.sort(key=lambda item: (item['path'], item['chunk_index']))

    total_content_bytes = 0
    for chunk in eligible:
        if len(chunk['content']) > MAX_SOURCE_CHUNK_CONTENT_BYTES:
            raise EmbeddingGenerationError('Source chunk content exceeds the embedding limit.')
        total_content_bytes += len(chunk['content'].encode('utf-8'))
        if total_content_bytes > MAX_SOURCE_CHUNK_CONTENT_BYTES:
            raise EmbeddingGenerationError('Source chunk content exceeds the embedding limit.')
    return eligible


def generate_embeddings(chunks: list[dict], provider=None) -> list[dict]:
    eligible = _eligible_chunks(chunks)
    if not eligible:
        return []

    embedding_provider = provider or create_embedding_provider()
    results: list[dict] = []
    try:
        for batch_start in range(0, len(eligible), EMBEDDING_BATCH_SIZE):
            batch = eligible[batch_start:batch_start + EMBEDDING_BATCH_SIZE]
            vectors = embedding_provider.embed_batch([chunk['content'] for chunk in batch])
            if not isinstance(vectors, list) or len(vectors) != len(batch):
                raise EmbeddingGenerationError('Embedding provider returned an invalid response.')
            for chunk, raw_vector in zip(batch, vectors):
                vector = _validated_vector(raw_vector)
                results.append({
                    'path': chunk['path'],
                    'chunk_index': chunk['chunk_index'],
                    'start_line': chunk['start_line'],
                    'end_line': chunk['end_line'],
                    'provider': embedding_provider.name,
                    'model': embedding_provider.model,
                    'dimension': len(vector),
                    'vector': vector,
                })
    except EmbeddingGenerationError:
        raise
    except Exception:
        raise EmbeddingGenerationError('Embedding provider request failed.') from None
    return results