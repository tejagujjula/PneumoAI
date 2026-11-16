from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import router as api_router
from backend.app.config import (
    CORS_ORIGINS,
    DEVICE,
    MODEL_ARCHITECTURE,
    PREDICTION_THRESHOLD,
    PROJECT_DISCLAIMER,
)
from backend.app.services.model import get_model_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pneumoai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes and verifies the model at backend startup."""
    logger.info("Initializing PneumoAI Backend...")
    logger.info(f"Using device: {DEVICE}")
    try:
        service = get_model_service()
        logger.info(f"PneumoAI model ready: {MODEL_ARCHITECTURE} on {service.device}")
    except Exception as e:
        logger.error(f"Error during model initialization: {e}")
        raise e
    yield
    logger.info("Shutting down PneumoAI Backend...")


app = FastAPI(
    title="PneumoAI – Pneumonia Detection & Explainability API",
    description=(
        "FastAPI backend for chest X-ray pneumonia screening using pre-trained "
        "EfficientNetV2-S with Grad-CAM visual interpretability.\n\n"
        f"**Disclaimer**: {PROJECT_DISCLAIMER}"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for React frontend (Vite/CRA)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes under /api
app.include_router(api_router, prefix="/api", tags=["Inference & Diagnostics"])


# Also alias /health at top-level for convenience
@app.get("/health", tags=["Health"], summary="Root Health Check")
async def root_health():
    """Top-level health check endpoint."""
    service = get_model_service()
    return {
        "status": "healthy",
        "model_loaded": service.is_loaded,
        "device": str(DEVICE),
        "prediction_threshold": PREDICTION_THRESHOLD,
        "disclaimer": PROJECT_DISCLAIMER,
    }


@app.get("/", tags=["Root"], summary="API Root Overview")
async def root_overview():
    """Welcome endpoint providing project metadata and links to docs."""
    return {
        "project": "PneumoAI – Pneumonia Detection from Chest X-Ray Images",
        "architecture": MODEL_ARCHITECTURE,
        "threshold": PREDICTION_THRESHOLD,
        "documentation": "/docs",
        "health": "/health",
        "disclaimer": PROJECT_DISCLAIMER,
    }


# Exception handling for clean JSON error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "detail": exc.detail,
            "disclaimer": PROJECT_DISCLAIMER,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": "An internal server error occurred while processing the request.",
            "disclaimer": PROJECT_DISCLAIMER,
        },
    )
