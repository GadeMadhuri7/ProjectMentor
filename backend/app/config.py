import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent.parent / '.env')


DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'mysql+pymysql://projectmentor:change-me@127.0.0.1:3306/projectmentor',
)
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')