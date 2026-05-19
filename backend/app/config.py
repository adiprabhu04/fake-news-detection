"""Centralised runtime configuration loaded from environment / .env file."""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

ALLOWED_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    ).split(",")
    if o.strip()
]

ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
PORT: int = int(os.getenv("PORT", "8000"))

LIME_NUM_SAMPLES: int = int(os.getenv("LIME_NUM_SAMPLES", "300"))
LIME_NUM_FEATURES: int = int(os.getenv("LIME_NUM_FEATURES", "12"))

MODELS_DIR: Path = Path(__file__).resolve().parent.parent / "models"
