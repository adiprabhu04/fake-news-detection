# TruthLens — Explainable AI Misinformation Detection

A production-grade, full-stack AI platform for fake news detection with real-time explainability.
Not just a prediction — see *which words* drove each verdict, powered by LIME and SHAP.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TensorFlow](https://img.shields.io/badge/ML-TensorFlow-FF6F00?style=flat-square&logo=tensorflow)](https://tensorflow.org)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)

---

## Screenshots

| Landing Page | Article Analyzer |
|---|---|
| *(see screenshots/)* | *(see screenshots/)* |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TruthLens                               │
│                                                                 │
│   ┌─────────────────┐          ┌──────────────────────────┐    │
│   │  React + Vite   │  REST    │     FastAPI Backend       │    │
│   │  Tailwind CSS   │ ──────▶  │  ┌────────────────────┐  │    │
│   │  Recharts       │          │  │  model.py (4 models)│  │    │
│   │  React Router   │          │  │  preprocess.py      │  │    │
│   └─────────────────┘          │  │  explainability.py  │  │    │
│         ▲                      │  │  scraper.py         │  │    │
│   Vercel│                      │  └────────────────────┘  │    │
│         │                      │   Render (Docker)         │    │
│         └──────────────────────┘                           │    │
└─────────────────────────────────────────────────────────────────┘
```

### Models

| Model | Type | Accuracy | Explainability |
|---|---|---|---|
| Logistic Regression | Classical ML | ~95% | LIME + SHAP |
| Naive Bayes | Classical ML | ~94% | LIME |
| Random Forest | Classical ML | ~96% | LIME + SHAP |
| LSTM | Deep Learning | ~98% | LIME |

---

## Features

- **Multi-model classification** — switch between 4 ML models per request
- **LIME explainability** — word-level importance scores for every prediction
- **SHAP values** — global + local feature attribution for sklearn models
- **Word highlighting** — color-coded article text showing fake/real signal words
- **URL scraping** — paste any article link; content is fetched and analyzed automatically
- **Confidence scoring** — calibrated probability output, not just a binary label
- **REST API** — clean JSON endpoints, ready for integration or extension
- **Dark mode UI** — Linear/Vercel-inspired design system

---

## Project Structure

```
fake-news-detection/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan model loading
│   │   ├── model.py             # Model loading, prediction (sklearn + LSTM)
│   │   ├── preprocess.py        # clean_text / clean_text_fast / clean_text_lite
│   │   ├── explainability.py    # LIME + SHAP wrappers, word highlight mapping
│   │   ├── scraper.py           # BeautifulSoup URL scraper with fallback chain
│   │   ├── config.py            # Centralized env var config (python-dotenv)
│   │   └── utils.py             # timer decorator, sanitize_model_name, truncate
│   │
│   ├── models/                  # Saved .pkl / .keras files (gitignored)
│   ├── train_models.py          # One-time training script (--data-dir, --skip-lstm)
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page with terminal demo
│   │   │   └── Analyzer.jsx          # Main analysis interface
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PredictionCard.jsx    # Verdict + animated confidence bar
│   │   │   ├── ExplainabilityPanel.jsx  # LIME chart, word highlights, summary
│   │   │   ├── ModelSelector.jsx
│   │   │   ├── SkeletonLoader.jsx    # Loading skeletons
│   │   │   ├── AnalysisHistory.jsx   # Last 8 analyses, click to restore
│   │   │   └── Toast.jsx             # Toast notification container
│   │   ├── hooks/
│   │   │   └── useToast.js           # Toast state management hook
│   │   ├── lib/api.js                # Axios API client
│   │   └── index.css                 # Design system (Tailwind + custom classes)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── .env.example
│   └── vercel.json
│
├── notebooks/
│   └── final-project.ipynb      # Original research notebook
│
└── screenshots/
```

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- The [ISOT Fake News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset) (`Fake.csv` + `True.csv`)

### 1. Train the Models

```bash
# Download dataset from Kaggle and place CSVs in data/
mkdir data
# put Fake.csv and True.csv there

cd backend
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; [nltk.download(x) for x in ['punkt_tab','stopwords','wordnet','omw-1.4']]"

# Train all models (~5–10 min, --skip-lstm for faster run)
python train_models.py --data-dir ../data
```

### 2. Start the Backend

```bash
cd backend
cp .env.example .env          # edit ALLOWED_ORIGINS if needed
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Start the Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

---

## API Reference

### `GET /`
Health check and available models list.

### `GET /models`
Returns currently loaded model IDs and metadata.

### `POST /predict`
```json
{ "text": "...", "model": "random_forest" }
```
Response:
```json
{ "prediction": "Fake", "confidence": 0.97, "model_used": "Random Forest" }
```

### `POST /explain`
```json
{ "text": "...", "model": "random_forest", "method": "lime", "num_features": 10 }
```
Response includes `word_importance`, `fake_indicators`, `real_indicators`, `highlighted_text`.
Set `method: "shap"` for sklearn models to also get SHAP values.

### `POST /analyze-url`
```json
{ "url": "https://...", "model": "random_forest" }
```
Scrapes the URL, runs prediction and explainability in one call.

---

## Deployment

### Backend → Render

1. Push to GitHub
2. Create a new Render **Web Service**, connect the repo
3. Set **Root Directory**: `backend`
4. **Build command**: `pip install -r requirements.txt`
5. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add env var: `ALLOWED_ORIGINS=https://your-app.vercel.app`

> **Note**: Render's free tier doesn't persist disk. Upload pre-trained model `.pkl` files via Render Disk or use a cloud storage bucket and load on startup.

### Frontend → Vercel

1. Connect the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy — `vercel.json` handles SPA routing automatically

---

## Explainability Deep-Dive

### LIME (Local Interpretable Model-agnostic Explanations)

LIME works by perturbing the input text (randomly masking words), running each perturbation through the model, and fitting a simple linear model to the changes in output. This reveals which words are most influential for a specific prediction.

- Works for all 4 models (model-agnostic)
- 500 perturbations per explanation (~1–3 seconds)
- Returns per-word importance scores in [-1, +1]
  - Positive score → pushes toward **Fake**
  - Negative score → pushes toward **Real**

### SHAP (SHapley Additive exPlanations)

Available for Logistic Regression and Random Forest via dedicated explainers:
- `LinearExplainer` for Logistic Regression — exact attribution
- `TreeExplainer` for Random Forest — efficient tree-based SHAP

SHAP values satisfy desirable properties like local accuracy, missingness, and consistency — making them the gold standard for feature attribution.

---

## Future Enhancements

- [ ] BERT / DistilBERT fine-tuned classifier
- [ ] Global SHAP summary plots (beeswarm, bar)
- [ ] Model comparison view (run all models in parallel)
- [ ] User feedback loop for active learning
- [ ] Multilingual detection support
- [ ] Citation graph analysis for source credibility
- [ ] Browser extension for inline fact-checking

---

## Performance Notes

- **LIME inference**: ~3–5 seconds per explanation (300 perturbations, `clean_text_fast` for predict_fn)
- **Sklearn prediction**: <100ms
- **LSTM prediction**: ~200ms (first call may be slower due to TF warm-up)
- **URL scraping**: 1–5s depending on target server

---

## Author

Built by [Aditya Prabhudessai](https://github.com/adiprabhu04)

---

*TruthLens — Explainable AI for misinformation research. Not a production fact-checker — a demonstration of end-to-end ML engineering with interpretability.*
