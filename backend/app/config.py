"""Centralised runtime configuration loaded from environment / .env file."""
import os
from pathlib import Path

# Load .env if present (no-op if python-dotenv isn't installed)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

ALLOWED_ORIGINS: list[str] = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
).split(",")

ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

# Number of LIME perturbation samples (lower = faster, higher = more accurate)
LIME_NUM_SAMPLES: int = int(os.getenv("LIME_NUM_SAMPLES", "300"))

# Max tokens shown in explanation
LIME_NUM_FEATURES: int = int(os.getenv("LIME_NUM_FEATURES", "12"))

MODELS_DIR: Path = Path(__file__).parent.parent / "models"
