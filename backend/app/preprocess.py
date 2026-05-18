import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

def _ensure_nltk():
    resources = [
        ("tokenizers/punkt_tab", "punkt_tab"),
        ("tokenizers/punkt", "punkt"),
        ("corpora/stopwords", "stopwords"),
        ("corpora/wordnet", "wordnet"),
        ("corpora/omw-1.4", "omw-1.4"),
    ]
    for path, pkg in resources:
        try:
            nltk.data.find(path)
        except LookupError:
            nltk.download(pkg, quiet=True)

_ensure_nltk()

_lemmatizer = WordNetLemmatizer()
_stop_words = set(stopwords.words("english"))


def clean_text(text: str) -> str:
    """Full preprocessing pipeline for TF-IDF sklearn models."""
    text = re.sub(r"\s+", " ", text, flags=re.I)
    text = re.sub(r"\W", " ", str(text))
    text = re.sub(r"\s+[a-zA-Z]\s+", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = text.lower().strip()

    words = word_tokenize(text)
    words = [_lemmatizer.lemmatize(w) for w in words]
    words = [w for w in words if w not in _stop_words and len(w) > 3]

    return " ".join(words)


def clean_text_lite(text: str) -> str:
    """Light cleaning that preserves word boundaries — used by LIME for perturbation."""
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text.lower()


def clean_text_fast(text: str) -> str:
    """
    Fast cleaning for LIME perturbations.
    Skips word_tokenize and lemmatization — ~10x faster than clean_text.
    Accepts slightly lower explanation quality for much better throughput.
    """
    text = re.sub(r"\W", " ", str(text))
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = text.lower().strip()
    words = text.split()
    words = [w for w in words if w not in _stop_words and len(w) > 3]
    return " ".join(words)


def clean_text_for_lstm(text: str) -> list[str]:
    """Returns token list for LSTM tokenizer."""
    return clean_text(text).split()
