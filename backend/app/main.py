import logging
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import ALLOWED_ORIGINS, LOG_LEVEL, ENVIRONMENT, PORT
from .model import load_models, predict, get_available_models
from .explainability import get_lime_explanation, get_shap_explanation
from .scraper import scrape_article

logging.basicConfig(level=LOG_LEVEL, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("─" * 50)
    logger.info("TruthLens API starting up")
    logger.info("Environment : %s", ENVIRONMENT)
    logger.info("Port        : %s", PORT)
    logger.info("CORS origins: %s", ALLOWED_ORIGINS)
    logger.info("Loading ML models…")
    load_models()
    available = get_available_models()
    logger.info("Models ready: %s", available if available else "NONE — check models/ directory")
    logger.info("─" * 50)
    yield
    logger.info("TruthLens API shutting down")


app = FastAPI(
    title="TruthLens API",
    description="Explainable AI platform for misinformation analysis",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if ENVIRONMENT != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=50, description="Article text (min 50 chars)")
    model: str = Field("random_forest", description="Model ID to use")


class ExplainRequest(BaseModel):
    text: str = Field(..., min_length=50)
    model: str = Field("random_forest")
    method: Literal["lime", "shap"] = "lime"
    num_features: int = Field(12, ge=3, le=20)
    num_samples: int = Field(300, ge=100, le=1000)


class AnalyzeUrlRequest(BaseModel):
    url: str = Field(..., min_length=10)
    model: str = Field("random_forest")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "name": "TruthLens API",
        "version": "2.0.0",
        "status": "ok",
        "environment": ENVIRONMENT,
        "available_models": get_available_models(),
    }


@app.get("/health")
def health():
    models = get_available_models()
    return {
        "status": "ok" if models else "degraded",
        "models_loaded": len(models),
        "models": models,
    }


@app.get("/models")
def list_models():
    return {"models": get_available_models()}


@app.post("/predict")
def predict_endpoint(req: PredictRequest):
    try:
        return predict(req.text, req.model)
    except RuntimeError as exc:
        raise HTTPException(503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(400, detail=str(exc))
    except Exception:
        logger.exception("Prediction error")
        raise HTTPException(500, detail="Internal prediction error")


@app.post("/explain")
def explain_endpoint(req: ExplainRequest):
    try:
        if req.method == "shap" and req.model not in ("lstm", "naive_bayes"):
            lime_result = get_lime_explanation(req.text, req.model, req.num_features, req.num_samples)
            shap_result = get_shap_explanation(req.text, req.model)
            return {**lime_result, "shap": shap_result}
        return get_lime_explanation(req.text, req.model, req.num_features, req.num_samples)
    except ValueError as exc:
        raise HTTPException(400, detail=str(exc))
    except Exception:
        logger.exception("Explanation error")
        raise HTTPException(500, detail="Explanation failed — model may not be loaded")


@app.post("/analyze-url")
def analyze_url_endpoint(req: AnalyzeUrlRequest):
    try:
        article = scrape_article(req.url)
    except ValueError as exc:
        raise HTTPException(400, detail=str(exc))
    except Exception:
        logger.exception("Unexpected scrape error | url=%s", req.url)
        raise HTTPException(500, detail="Something went wrong while analyzing the URL.")

    try:
        result = predict(article["text"], req.model)
    except RuntimeError as exc:
        raise HTTPException(503, detail=str(exc))
    except Exception:
        logger.exception("Prediction error after scrape | url=%s", req.url)
        raise HTTPException(500, detail="Article was fetched but prediction failed.")

    return {**result, "article": article}
