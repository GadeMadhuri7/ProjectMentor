import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent.parent / '.env')


DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'mysql+pymysql://projectmentor:change-me@127.0.0.1:3306/projectmentor',
)
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')
EMBEDDING_PROVIDER = os.getenv('EMBEDDING_PROVIDER', '').strip().lower()
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', '').strip()
LOCAL_EMBEDDING_MODEL = os.getenv(
    'LOCAL_EMBEDDING_MODEL',
    'BAAI/bge-small-en-v1.5',
).strip()
EMBEDDING_API_KEY = os.getenv('EMBEDDING_API_KEY', '')
EMBEDDING_API_BASE_URL = os.getenv(
    'EMBEDDING_API_BASE_URL',
    'https://api.openai.com/v1',
).rstrip('/')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_MODEL = os.getenv('GROQ_MODEL', '').strip()
GROQ_API_BASE_URL = os.getenv(
    'GROQ_API_BASE_URL',
    'https://api.groq.com/openai/v1',
).rstrip('/')