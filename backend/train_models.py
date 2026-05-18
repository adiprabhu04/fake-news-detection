"""
Train and save all ML models for TruthLens.

Usage:
    python train_models.py [--data-dir ./data]

Expects:
    <data-dir>/Fake.csv
    <data-dir>/True.csv

Download from: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset
"""
import argparse
import logging
import pickle
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

sys.path.insert(0, str(Path(__file__).parent))
from app.preprocess import clean_text, clean_text_for_lstm  # noqa: E402


def load_dataset(data_dir: Path) -> pd.DataFrame:
    fake = pd.read_csv(data_dir / "Fake.csv")
    real = pd.read_csv(data_dir / "True.csv")
    fake["label"] = 0
    real["label"] = 1
    df = pd.concat([fake, real], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    df.drop_duplicates(subset=["text"], inplace=True)
    log.info(f"Dataset: {len(df):,} samples ({df.label.sum():,} real, {(df.label==0).sum():,} fake)")
    return df


def train_sklearn(df: pd.DataFrame) -> None:
    log.info("Preprocessing text for sklearn models...")
    X = [clean_text(t) for t in df["text"]]
    y = df["label"].tolist()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    log.info("Fitting TF-IDF vectorizer...")
    vec = TfidfVectorizer(max_features=50_000, ngram_range=(1, 2), min_df=2, sublinear_tf=True)
    X_tr = vec.fit_transform(X_train)
    X_te = vec.transform(X_test)

    _save_pkl(vec, "tfidf_vectorizer.pkl")

    _train_and_save(
        LogisticRegression(max_iter=1000, C=1.0, solver="saga", random_state=42),
        X_tr, X_test=X_te, y_train=y_train, y_test=y_test,
        name="logistic_regression",
    )
    _train_and_save(
        MultinomialNB(alpha=0.1),
        X_tr, X_test=X_te, y_train=y_train, y_test=y_test,
        name="naive_bayes",
    )
    _train_and_save(
        RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=42),
        X_tr, X_test=X_te, y_train=y_train, y_test=y_test,
        name="random_forest",
    )


def _train_and_save(model, X_train, X_test, y_train, y_test, name: str) -> None:
    log.info(f"Training {name}...")
    model.fit(X_train, y_train)
    report = classification_report(y_test, model.predict(X_test), target_names=["Fake", "Real"])
    log.info(f"\n{name}:\n{report}")
    _save_pkl(model, f"{name}.pkl")


def _save_pkl(obj, filename: str) -> None:
    path = MODELS_DIR / filename
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    log.info(f"Saved → {path}")


def train_lstm(df: pd.DataFrame) -> None:
    try:
        import tensorflow as tf
        from tensorflow.keras.callbacks import EarlyStopping
        from tensorflow.keras.layers import (
            Dense, Dropout, Embedding, GlobalMaxPooling1D, Input, LSTM,
        )
        from tensorflow.keras.models import Model
        from tensorflow.keras.optimizers import Adam
        from tensorflow.keras.preprocessing.sequence import pad_sequences
        from tensorflow.keras.preprocessing.text import Tokenizer
    except ImportError:
        log.warning("TensorFlow not installed — skipping LSTM training.")
        return

    log.info("Preprocessing text for LSTM...")
    X_tokens = [clean_text_for_lstm(t) for t in df["text"]]
    y = df["label"].tolist()

    X_tr_tok, X_te_tok, y_train, y_test = train_test_split(
        X_tokens, y, test_size=0.2, random_state=42
    )

    tokenizer = Tokenizer()
    tokenizer.fit_on_texts(X_tr_tok)
    vocab_size = len(tokenizer.word_index)
    log.info(f"Vocabulary size: {vocab_size:,}")

    maxlen = 150
    X_tr = pad_sequences(tokenizer.texts_to_sequences(X_tr_tok), maxlen=maxlen)
    X_te = pad_sequences(tokenizer.texts_to_sequences(X_te_tok), maxlen=maxlen)

    y_tr_cat = tf.keras.utils.to_categorical(y_train)
    y_te_cat = tf.keras.utils.to_categorical(y_test)

    inp = Input(shape=(maxlen,))
    x = Embedding(vocab_size + 1, 100)(inp)
    x = Dropout(0.5)(x)
    x = LSTM(150, return_sequences=True)(x)
    x = Dropout(0.5)(x)
    x = GlobalMaxPooling1D()(x)
    x = Dense(64, activation="relu")(x)
    x = Dropout(0.5)(x)
    out = Dense(2, activation="softmax")(x)

    model = Model(inp, out)
    model.compile(
        optimizer=Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.summary()

    model.fit(
        X_tr, y_tr_cat,
        epochs=15,
        batch_size=32,
        validation_data=(X_te, y_te_cat),
        callbacks=[EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True)],
    )

    model.save(str(MODELS_DIR / "lstm_model.keras"))
    _save_pkl(tokenizer, "lstm_tokenizer.pkl")
    log.info("LSTM saved.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default="./data", type=Path)
    parser.add_argument("--skip-lstm", action="store_true")
    args = parser.parse_args()

    if not (args.data_dir / "Fake.csv").exists():
        log.error(f"Fake.csv not found in {args.data_dir}. Download the dataset first.")
        sys.exit(1)

    df = load_dataset(args.data_dir)
    train_sklearn(df)
    if not args.skip_lstm:
        train_lstm(df)
    log.info("All models saved to backend/models/")


if __name__ == "__main__":
    main()
