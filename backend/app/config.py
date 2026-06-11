import os
import uuid
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or f"postgresql://{os.getenv('DB_USER', 'nepaltrek_user')}:{os.getenv('DB_PASSWORD', 'nepaltrek_pass')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'nepaltrek_db')}"
APP_NAME = os.getenv("APP_NAME", "Nepal Trek AI")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "nepal-trek-ai-secret-key-2024")

SERVER_RESTART_ID = uuid.uuid4().hex[:12]
