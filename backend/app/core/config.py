from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MeetExtract AI"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    LOG_LEVEL: str = "INFO"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Backend
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    BACKEND_RELOAD: bool = True

    # Database
    DATABASE_URL: str

    # AI Provider
    AI_PROVIDER: str = ""
    AI_MODEL: str = ""
    AI_API_KEY: str = ""
    AI_API_BASE_URL: str = ""
    AI_REQUEST_TIMEOUT: int = 60
    AI_MAX_RETRIES: int = 3

    # Transcript Processing
    MAX_UPLOAD_SIZE_BYTES: int = 10485760
    MAX_TRANSCRIPT_LENGTH: int = 100000
    SUPPORTED_FILE_EXTENSIONS: str = ".txt,.pdf,.docx"

    # Storage
    STORAGE_PROVIDER: str = "local"
    STORAGE_BUCKET: str = "meetextract"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Authentication
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200

    # Evaluation
    EVALUATION_ENABLED: bool = True
    EVALUATION_DATASET_PATH: str = "data/evaluation"

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()
