import pickle
import logging
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

# Resolve to an absolute path regardless of working directory or symlinks.
# __file__ = .../backend/app/model.py
# .resolve().parent.parent = .../backend
# / "models" = .../backend/models
MODELS_DIR: Path = Path(__file__).resolve().parent.parent / "models"

_store: dict[str, Any] = {}


def load_models() -> None:
    logger.info("MODELS_DIR resolved to: %s", MODELS_DIR)
    logger.info("MODELS_DIR exists: %s", MODELS_DIR.exists())

    if MODELS_DIR.exists():
        contents = [p.name for p in MODELS_DIR.iterdir()]
        logger.info("MODELS_DIR contents: %s", contents)
    else:
        logger.error(
            "MODELS_DIR does not exist at %s — no models can be loaded. "
            "Ensure the models/ directory is committed and pushed to GitHub.",
            MODELS_DIR,
        )

    _load_pickle("tfidf_vectorizer", "tfidf_vectorizer.pkl", key="_vec")
    _load_pickle("logistic_regression", "logistic_regression.pkl")
    _load_pickle("naive_bayes",         "naive_bayes.pkl")
    _load_pickle("random_forest",       "random_forest.pkl")
    _load_lstm()

    loaded = get_available_models()
    if loaded:
        logger.info("Models ready: %s", [m["id"] for m in loaded])
    else:
        logger.warning(
            "No models loaded. Run `python train_models.py` and commit the "
            "resulting .pkl files to backend/models/."
        )


def _load_pickle(label: str, filename: str, key: str | None = None) -> None:
    path = MODELS_DIR / filename
    store_key = key or label
    logger.info("Loading %s from %s …", label, path)
    if not path.exists():
        logger.warning("  NOT FOUND: %s", path)
        return
    try:
        with open(path, "rb") as f:
            _store[store_key] = pickle.load(f)
        logger.info("  OK: %s (%d bytes)", label, path.stat().st_size)
    except Exception as exc:
        logger.error("  FAILED to load %s: %s", label, exc)


def _load_lstm() -> None:
    lstm_path = MODELS_DIR / "lstm_model.keras"
    tok_path  = MODELS_DIR / "lstm_tokenizer.pkl"
    logger.info("Loading lstm from %s …", lstm_path)

    try:
        import tensorflow as tf  # noqa: F401
    except ImportError:
        logger.warning("  SKIP: TensorFlow not installed — LSTM unavailable.")
        return

    if not lstm_path.exists():
        logger.warning("  NOT FOUND: %s", lstm_path)
        return
    if not tok_path.exists():
        logger.warning("  NOT FOUND (tokenizer): %s", tok_path)
        return

    try:
        _store["lstm"] = tf.keras.models.load_model(str(lstm_path))
        with open(tok_path, "rb") as f:
            _store["lstm_tokenizer"] = pickle.load(f)
        logger.info(
            "  OK: lstm (%d bytes)", lstm_path.stat().st_size
        )
    except Exception as exc:
        logger.error("  FAILED to load lstm: %s", exc)


def get_available_models() -> list[dict]:
    mapping = {
        "logistic_regression": ("Logistic Regression", "classical"),
        "naive_bayes":         ("Naive Bayes",          "classical"),
        "random_forest":       ("Random Forest",        "classical"),
        "lstm":                ("LSTM",                 "deep_learning"),
    }
    return [
        {"id": k, "name": name, "type": t}
        for k, (name, t) in mapping.items()
        if k in _store
    ]


def predict(text: str, model_name: str = "random_forest") -> dict:
    from .utils import sanitize_model_name
    name = sanitize_model_name(model_name)
    if name == "lstm":
        return _predict_lstm(text)
    return _predict_sklearn(text, name)


def _predict_sklearn(text: str, model_name: str) -> dict:
    from .preprocess import clean_text

    if "_vec" not in _store:
        raise RuntimeError("TF-IDF vectorizer not loaded. Run train_models.py first.")

    available = [k for k in ("logistic_regression", "naive_bayes", "random_forest") if k in _store]
    if not available:
        raise RuntimeError("No sklearn models loaded. Run train_models.py first.")

    if model_name not in _store:
        model_name = available[0]
        logger.warning("Requested model not found; falling back to %s.", model_name)

    cleaned = clean_text(text)
    X = _store["_vec"].transform([cleaned])
    model = _store[model_name]

    pred = int(model.predict(X)[0])
    proba = model.predict_proba(X)[0]

    display_names = {
        "logistic_regression": "Logistic Regression",
        "naive_bayes":         "Naive Bayes",
        "random_forest":       "Random Forest",
    }

    return {
        "prediction": "Real" if pred == 1 else "Fake",
        "confidence": round(float(max(proba)), 4),
        "model_used": display_names.get(model_name, model_name),
    }


def _predict_lstm(text: str) -> dict:
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    from .preprocess import clean_text_for_lstm

    if "lstm" not in _store or "lstm_tokenizer" not in _store:
        raise ValueError("LSTM model not loaded.")

    tokenizer = _store["lstm_tokenizer"]
    model = _store["lstm"]

    tokens = clean_text_for_lstm(text)
    seq = tokenizer.texts_to_sequences([tokens])
    padded = pad_sequences(seq, maxlen=150)

    probs = model.predict(padded, verbose=0)[0]
    pred = int(np.argmax(probs))

    return {
        "prediction": "Real" if pred == 1 else "Fake",
        "confidence": round(float(max(probs)), 4),
        "model_used": "LSTM",
    }


def get_vectorizer():
    return _store.get("_vec")


def get_model(name: str):
    return _store.get(name)
