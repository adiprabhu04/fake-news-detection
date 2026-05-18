import logging
import time
from functools import wraps

logger = logging.getLogger(__name__)


def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        ms = round((time.perf_counter() - start) * 1000, 1)
        logger.info(f"{func.__name__} → {ms}ms")
        return result
    return wrapper


def sanitize_model_name(name: str) -> str:
    return name.lower().replace(" ", "_").replace("-", "_")


def truncate(text: str, max_len: int = 10_000) -> str:
    return text[:max_len] if len(text) > max_len else text
