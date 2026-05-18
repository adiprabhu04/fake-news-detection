import logging
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import ALLOWED_ORIGINS, LOG_LEVEL
from .model import load_models, predict, get_available_models
from .explainability import get_lime_explanation, get_shap_explanation
from .scraper import scrape_article

logging.basicConfig(level=LOG_LEVEL, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading models...")
    load_models()
    logger.info("Ready.")
    yield


app = FastAPI(
    title="TruthLens API",
    description="Explainable AI platform for misinformation analysis",
    version="1.0.0",
    lifespan=lifespan,
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
        "version": "1.0.0",
        "status": "ok",
        "available_models": get_available_models(),
    }


@app.get("/health")
def health():
    models = get_available_models()
    return {"status": "ok" if models else "degraded", "models_loaded": len(models)}


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
    except Exception as exc:
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
    except Exception as exc:
        logger.exception("Explanation error")
        raise HTTPException(500, detail="Explanation failed — model may not be loaded")


@app.post("/analyze-url")
def analyze_url_endpoint(req: AnalyzeUrlRequest):
    try:
        article = scrape_article(req.url)
    except ValueError as exc:
        raise HTTPException(400, detail=str(exc))

    try:
        result = predict(article["text"], req.model)
    except RuntimeError as exc:
        raise HTTPException(503, detail=str(exc))

    return {**result, "article": article}
