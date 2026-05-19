# TruthLens — Explainable Misinformation Detection

A production-grade, full-stack AI platform for misinformation analysis with real-time explainability. The model classifies articles as likely real or likely fake and explains *which specific words* drove the prediction using LIME attribution.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![TensorFlow](https://img.shields.io/badge/ML-TensorFlow-FF6F00?style=flat-square&logo=tensorflow)](https://tensorflow.org)

---

## Screenshots

| Landing Page | Article Analyzer |
|---|---|
| *(add screenshot)* | *(add screenshot)* |

---

## Features

- **Multi-model classification** — switch between 4 ML models per request (Random Forest, Logistic Regression, Naive Bayes, LSTM)
- **LIME explainability** — per-word importance scores showing which terms pushed the prediction toward Fake or Real
- **SHAP attribution** — global + local feature attribution for sklearn models
- **Word highlighting** — color-coded article text with hover tooltips showing exact attribution scores
- **Context signals** — heuristic credibility indicators (sensational language, trusted domain, emotional intensity)
- **URL scraping** — paste any article link; content is extracted and analyzed automatically
- **Confidence ring** — animated SVG confidence indicator with probability score
- **Analysis history** — last 20 analyses persisted to localStorage with click-to-restore
- **Staged loading** — terminal-style loading messages during analysis
- **Dark premium UI** — Linear/Vercel/Raycast-inspired design system

---

## Architecture

```
fake-news-detection/
│
├── backend/                     # Python · FastAPI
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan, endpoints
│   │   ├── model.py             # Model loading, prediction (sklearn + LSTM)
│   │   ├── preprocess.py        # Text cleaning (NLTK, TF-IDF pipeline)
│   │   ├── explainability.py    # LIME + SHAP wrappers, word highlight mapping
│   │   ├── scraper.py           # BeautifulSoup article scraper
│   │   ├── config.py            # Env var config (python-dotenv)
│   │   └── utils.py             # Helpers
│   ├── models/                  # Saved .pkl / .keras files (gitignored)
│   ├── train_models.py          # One-time training script
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
└── frontend/                    # TypeScript · Next.js 15 · Tailwind CSS
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx           # Root layout, fonts, global metadata
    │   │   ├── template.tsx         # Route transition wrapper (Framer Motion)
    │   │   ├── page.tsx             # Home page (Hero, Bento, Stats, TechStack)
    │   │   ├── error.tsx            # Global error boundary
    │   │   ├── not-found.tsx        # Custom 404 page
    │   │   ├── globals.css          # Design tokens, component classes
    │   │   └── analyze/
    │   │       ├── page.tsx         # /analyze route (server component + metadata)
    │   │       └── AnalyzerShell.tsx  # Client shell for dynamic import
    │   ├── components/
    │   │   ├── layout/Navbar.tsx
    │   │   ├── home/                # HeroSection, BentoGrid, StatsSection, …
    │   │   ├── analyzer/
    │   │   │   ├── AnalyzerClient.tsx   # Main interactive analyzer
    │   │   │   ├── PredictionCard.tsx   # Verdict + SVG confidence ring
    │   │   │   ├── ExplainabilityPanel.tsx  # LIME bars, word highlights
    │   │   │   ├── ContextSignals.tsx   # Heuristic credibility indicators
    │   │   │   └── AnalysisHistory.tsx  # localStorage history list
    │   │   └── ui/
    │   │       ├── ModelSelector.tsx
    │   │       ├── SkeletonLoader.tsx
    │   │       ├── Toast.tsx
    │   │       └── TerminalDemo.tsx
    │   ├── hooks/
    │   │   └── useToast.ts
    │   └── lib/
    │       ├── api.ts               # Axios client
    │       ├── types.ts             # Shared TypeScript types
    │       └── utils.ts             # cn() helper
    ├── package.json
    ├── tailwind.config.ts
    ├── next.config.ts
    ├── .env.example
    └── vercel.json
```

---

## ML Models

| Model | Type | Accuracy | Explainability |
|---|---|---|---|
| Random Forest | Classical ML | ~97% | LIME + SHAP |
| Logistic Regression | Classical ML | ~95% | LIME + SHAP |
| Naive Bayes | Classical ML | ~94% | LIME |
| LSTM | Deep Learning | ~98% | LIME |

Training data: [ISOT Fake News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset) — 44,919 labeled articles.

---

## API Reference

### `GET /health`
Returns service health and loaded model count.
```json
{ "status": "ok", "models_loaded": 4, "models": ["random_forest", ...] }
```

### `GET /models`
Lists available model IDs.

### `POST /predict`
```json
{ "text": "Article content…", "model": "random_forest" }
```
```json
{ "prediction": "Fake", "confidence": 0.973, "model_used": "random_forest" }
```

### `POST /explain`
```json
{ "text": "...", "model": "random_forest", "method": "lime", "num_features": 12 }
```
Returns `word_importance`, `fake_indicators`, `real_indicators`, `highlighted_text`, `summary`.

### `POST /analyze-url`
```json
{ "url": "https://example.com/article", "model": "random_forest" }
```
Scrapes the URL and returns prediction + article metadata in one call.

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- [ISOT Fake News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset) (`Fake.csv` + `True.csv`)

### 1. Train Models

```bash
# Place Fake.csv and True.csv in data/
mkdir data

cd backend
pip install -r requirements.txt

# Download required NLTK data
python -c "import nltk; [nltk.download(x) for x in ['punkt_tab','stopwords','wordnet','omw-1.4']]"

# Train all models (add --skip-lstm to skip TensorFlow dependency)
python train_models.py --data-dir ../data
```

Trained model files are saved to `backend/models/`.

### 2. Start the Backend

```bash
cd backend
cp .env.example .env          # edit ALLOWED_ORIGINS if needed
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Start the Frontend

```bash
cd frontend
npm install
cp .env.example .env          # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

App: http://localhost:3000

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (no trailing slash) |
| `NEXT_PUBLIC_APP_URL` | No | Public canonical URL — used for OpenGraph metadata |

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |
| `PORT` | No | Server port (default: 8000; Render injects this automatically) |
| `ENVIRONMENT` | No | `development` or `production` (hides /docs in production) |
| `LOG_LEVEL` | No | Python logging level (default: `INFO`) |
| `LIME_NUM_SAMPLES` | No | LIME perturbation count — lower is faster (default: 300) |
| `LIME_NUM_FEATURES` | No | Max features in LIME explanation (default: 12) |

---

## Deployment

### Backend → Render

1. Push repository to GitHub
2. Create a new Render **Web Service**, connect the repo
3. **Root directory**: `backend`
4. **Build command**: `pip install -r requirements.txt`
5. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `ALLOWED_ORIGINS=https://your-app.vercel.app`
7. Add environment variable: `ENVIRONMENT=production`

> **Note on model files**: Render's free tier does not persist disk between deploys. Either commit the trained model `.pkl` files to the repository, use Render Persistent Disk, or load models from an S3-compatible bucket on startup.

### Frontend → Vercel

1. Connect the repository on [vercel.com](https://vercel.com)
2. **Framework preset**: Next.js (auto-detected via `vercel.json`)
3. **Root directory**: `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
5. Add environment variable: `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
6. Deploy

### Connecting Frontend ↔ Backend

After both services are live:

1. Copy the Render backend URL (e.g. `https://truthlens-api.onrender.com`)
2. Set `NEXT_PUBLIC_API_URL` in Vercel to that URL
3. Copy the Vercel frontend URL (e.g. `https://truthlens.vercel.app`)
4. Set `ALLOWED_ORIGINS` in Render to that URL
5. Redeploy both services

---

## Explainability

### LIME

LIME (Local Interpretable Model-agnostic Explanations) perturbs the input by randomly masking words, runs each variant through the classifier, and fits a linear model to the changes in output probability. Words whose removal most shifts the prediction receive the highest importance scores.

- Positive score → pushes toward **Fake**
- Negative score → pushes toward **Real**
- Works with all four models (model-agnostic)
- ~300 perturbations per call, ~3–5 seconds

### SHAP

Available for Logistic Regression and Random Forest:
- `LinearExplainer` for Logistic Regression — exact attribution
- `TreeExplainer` for Random Forest — efficient tree-based SHAP

SHAP values satisfy local accuracy, missingness, and consistency properties.

---

## Performance

| Operation | Latency |
|---|---|
| sklearn prediction | < 100 ms |
| LSTM prediction | ~200 ms |
| LIME explanation | 3–5 s (300 perturbations) |
| URL scraping | 1–5 s (network-dependent) |

---

## Future Improvements

- [ ] DistilBERT / RoBERTa fine-tuned classifier
- [ ] Model comparison view (run all models in parallel, side-by-side)
- [ ] Global SHAP summary plots (beeswarm, waterfall)
- [ ] User feedback loop for active learning
- [ ] Multilingual detection
- [ ] Citation and source graph analysis
- [ ] Browser extension for inline credibility signals
- [ ] Batch analysis API endpoint

---

## Disclaimer

TruthLens provides ML-based predictions and heuristic signals. Results should not be treated as definitive factual verification. Always cross-reference with primary sources.

---

Built by [Aditya Prabhudessai](https://github.com/adiprabhu04)
