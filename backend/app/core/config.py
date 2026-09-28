import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Determine root directory where .env is located
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "IncidentMemory API"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database Settings
    DATABASE_URL: str = "sqlite:///./incident_memory.db"

    # Hindsight Memory System Settings
    HINDSIGHT_API_URL: str = "http://localhost:8888"
    HINDSIGHT_BANK_ID: str = "incident-memory-bank"
    HINDSIGHT_API_KEY: str = ""

    # LLM Provider Configuration
    LLM_PROVIDER: str = "groq"
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    LLM_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
