"""
SocialHub – App Configuration (loaded from .env)
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM:  str = "HS256"
    TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 h

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./socialhub.db"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Limits
    MAX_FILE_SIZE_MB:        int = 500
    MAX_DOWNLOADS_PER_HOUR:  int = 20


@lru_cache
def get_settings() -> Settings:
    return Settings()
