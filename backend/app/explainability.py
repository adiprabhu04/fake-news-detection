import logging
from typing import Any

import numpy as np
from lime.lime_text import LimeTextExplainer

logger = logging.getLogger(__name__)

_lime = LimeTextExplainer(class_names=["Fake", "Real"])


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_lime_explanation(
    text: str,
    model_name: str,
    num_features: int = 12,
    num_samples: int = 300,
) -> dict[str, Any]:
    from .utils import sanitize_model_name

    name = sanitize_model_name(model_name)
    predict_fn = _make_predict_fn(name)
    text_for_lime = _lime_input(text, name)

    exp = _lime.explain_instance(
        text_for_lime,
        predict_fn,
        num_features=num_features,
        num_samples=num_samples,
    )

    raw = exp.as_list()  # [(word, score), ...]
    word_importance = [
        {"word": w, "score": round(s, 4), "direction": "fake" if s > 0 else "real"}
        for w, s in raw
    ]
    fake_indicators = sorted(
        [d for d in word_importance if d["direction"] == "fake"],
        key=lambda x: x["score"], reverse=True,
    )
    real_indicators = sorted(
        [{**d, "score": round(abs(d["score"]), 4)} for d in word_importance if d["direction"] == "real"],
        key=lambda x: x["score"], reverse=True,
    )

    summary = _generate_summary(word_importance, exp)

    return {
        "word_importance": word_importance,
        "fake_indicators": fake_indicators,
        "real_indicators": real_indicators,
        "highlighted_text": _highlight(text_for_lime, raw),
        "summary": summary,
        "method": "lime",
    }


def get_shap_explanation(text: str, model_name: str) -> dict[str, Any]:
    """SHAP feature attribution for classical sklearn models."""
    import shap
    from .model import get_model, get_vectorizer
    from .preprocess import clean_text
    from .utils import sanitize_model_name

    name = sanitize_model_name(model_name)
    model = get_model(name)
    vec = get_vectorizer()

    if model is None or vec is None:
        raise ValueError(f"Model '{name}' or vectorizer not available.")

    cleaned = clean_text(text)
    X = vec.transform([cleaned])
    feature_names = vec.get_feature_names_out()

    try:
        if "forest" in name:
            explainer = shap.TreeExplainer(model)
            sv = explainer.shap_values(X)
            # Binary RF: sv = [array_class0, array_class1]
            if isinstance(sv, list) and len(sv) >= 2:
                values = sv[1][0]
                base = float(explainer.expected_value[1]) if hasattr(explainer.expected_value, "__len__") else float(explainer.expected_value)
            else:
                values = np.array(sv).flatten()[:len(feature_names)]
                base = 0.0

        elif "logistic" in name:
            # Use Independent masker for cleaner API compatibility
            masker = shap.maskers.Independent(X, max_samples=1)
            explainer = shap.LinearExplainer(model, masker)
            sv = explainer.shap_values(X)
            # Binary LR: sv is (n_samples, n_features)
            values = sv[0] if sv.ndim == 2 else sv
            base = (
                float(explainer.expected_value[0])
                if hasattr(explainer.expected_value, "__len__")
                else float(explainer.expected_value)
            )
        else:
            raise ValueError(f"SHAP not implemented for '{name}'.")

    except Exception as exc:
        logger.warning(f"SHAP computation failed for {name}: {exc}")
        raise ValueError(f"SHAP unavailable for this model: {exc}") from exc

    nonzero = X.nonzero()[1]
    features = sorted(
        [
            {
                "feature": feature_names[i],
                "shap_value": round(float(values[i]), 4),
                "direction": "fake" if values[i] > 0 else "real",
            }
            for i in nonzero
        ],
        key=lambda x: abs(x["shap_value"]),
        reverse=True,
    )

    return {"top_features": features[:15], "base_value": round(base, 4)}


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _lime_input(text: str, model_name: str) -> str:
    """LSTM gets raw text; sklearn gets lightly cleaned text."""
    if model_name == "lstm":
        return text
    from .preprocess import clean_text_lite
    return clean_text_lite(text)


def _make_predict_fn(model_name: str):
    if model_name == "lstm":
        return _lstm_predict_fn()
    return _sklearn_predict_fn(model_name)


def _sklearn_predict_fn(model_name: str):
    """
    Uses clean_text_fast (no lemmatization) for LIME perturbations.
    ~10x faster than full clean_text, still produces meaningful explanations
    because LIME's perturbation mechanism only needs consistent preprocessing.
    """
    from .model import get_model, get_vectorizer
    from .preprocess import clean_text_fast

    model = get_model(model_name)
    vec = get_vectorizer()

    if model is None or vec is None:
        raise ValueError(f"Model '{model_name}' not available.")

    def predict_fn(texts: list[str]) -> np.ndarray:
        cleaned = [clean_text_fast(t) for t in texts]
        X = vec.transform(cleaned)
        return model.predict_proba(X)

    return predict_fn


def _lstm_predict_fn():
    from .model import get_model

    model = get_model("lstm")
    tokenizer = get_model("lstm_tokenizer")

    if model is None or tokenizer is None:
        raise ValueError("LSTM model not available.")

    def predict_fn(texts: list[str]) -> np.ndarray:
        try:
            from tensorflow.keras.preprocessing.sequence import pad_sequences
        except ImportError:
            from keras.preprocessing.sequence import pad_sequences

        seqs = tokenizer.texts_to_sequences(texts)
        padded = pad_sequences(seqs, maxlen=150)
        preds = model.predict(padded, verbose=0)
        if preds.shape[-1] == 2:
            return preds
        return np.column_stack([1 - preds, preds])

    return predict_fn


def _highlight(text: str, word_scores: list[tuple]) -> list[dict]:
    """Map LIME word scores back onto individual tokens in the text."""
    score_map = {w.lower(): s for w, s in word_scores}
    result = []
    for word in text.split():
        key = word.lower().strip(".,!?;:\"'()")
        score = score_map.get(key, 0.0)
        result.append({
            "word": word,
            "score": round(score, 4),
            "direction": "fake" if score > 0 else "real" if score < 0 else "neutral",
        })
    return result


def _generate_summary(word_importance: list[dict], exp) -> str:
    """Generate a human-readable one-liner from the LIME explanation."""
    fake_words = [w for w in word_importance if w["direction"] == "fake"]
    real_words = [w for w in word_importance if w["direction"] == "real"]

    top_fake = [f'"{w["word"]}"' for w in fake_words[:2]]
    top_real = [f'"{w["word"]}"' for w in real_words[:2]]

    parts = []
    if top_fake:
        parts.append(f"Fake signals: {', '.join(top_fake)}")
    if top_real:
        parts.append(f"Real signals: {', '.join(top_real)}")

    if not parts:
        return "No strong word-level signals detected."

    return ". ".join(parts) + "."
