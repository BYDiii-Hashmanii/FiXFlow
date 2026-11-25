from functools import cached_property
from pathlib import Path
from secrets import token_urlsafe

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    PROJECT_NAME: str = "FixFlow API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_PATH: Path = BASE_DIR / "fixflow.db"
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    STATIC_URL: str = "/uploads"
    DEV_MODE: bool = False
    SEED_DEMO: bool = False
    DEMO_PASSWORD: SecretStr | None = None
    SECRET_KEY: SecretStr | None = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, ge=1, le=1440)
    CORS_ORIGINS: list[str] = ["http://localhost:4200", "http://127.0.0.1:4200"]
    YOLO_MODEL_PATH: Path = (
        BASE_DIR / "app/model_handle/fixFlow_Model_cv/FixFlow_Training_Final_model/"
        "FixFlow_YOLO11s_v2/weights/best.pt"
    )
    OLLAMA_MODEL_NAME: str = "fixflow"
    PRELOAD_IMAGE_MODEL: bool = True
    IMAGE_TIMEOUT_SECONDS: float = Field(default=45, gt=0, le=60)
    DETECTION_CONFIDENCE_THRESHOLD: float = Field(default=0.5, gt=0, le=1)
    CHAT_TIMEOUT_SECONDS: float = Field(default=15, gt=0, le=60)
    GUIDANCE_TIMEOUT_SECONDS: float = Field(default=45, gt=0, le=120)

    @property
    def DATABASE_URL(self) -> str:
        return f"sqlite:///{self.DATABASE_PATH.resolve().as_posix()}"

    @cached_property
    def jwt_secret(self) -> str:
        value = self.SECRET_KEY.get_secret_value() if self.SECRET_KEY else ""
        if len(value.encode()) >= 32:
            return value
        if self.DEV_MODE and not value:
            return token_urlsafe(48)
        raise RuntimeError("Set SECRET_KEY to at least 32 bytes, or enable DEV_MODE for a temporary local key.")


settings = Settings()
