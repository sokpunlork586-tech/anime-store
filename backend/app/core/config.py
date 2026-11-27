from pathlib import Path
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json

ROOT_ENV = Path(__file__).resolve().parents[3] / ".env"
BACKEND_ENV = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Anime Store API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database (loaded from .env)
    DATABASE_URL: str = "sqlite+aiosqlite:///./anime_store.db"

    # Security
    SECRET_KEY: str = "anime_store_super_secure_production_secret_key_change_me_987654321"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str):
            return json.loads(v)
        return v

    # Initial Admin Seed
    FIRST_ADMIN_EMAIL: str = "admin@animestore.com"
    FIRST_ADMIN_PASSWORD: str = "Admin123456!"
    FIRST_ADMIN_NAME: str = "Admin"

    # Telegram Notification (Optional)
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None
    TELEGRAM_ENABLED: bool = True

    # Firebase Verification (Optional)
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_API_KEY: Optional[str] = None
    VITE_FIREBASE_PROJECT_ID: Optional[str] = None
    VITE_FIREBASE_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=(str(ROOT_ENV), str(BACKEND_ENV), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
