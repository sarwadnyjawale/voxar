"""
VOXAR AI TTS/STT API Server v1.2
FastAPI application factory with lifespan management.

Startup:  Loads XTTS model, creates EngineRouter, initializes GPU job queue.
Shutdown: Drains queue, unloads models, cleans up temp files.

Run via: python run_server.py
"""

import os
import sys
import time
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.config import Settings
from api.gpu_queue import GPUJobQueue
from api.middleware.api_key import APIKeyMiddleware
from api.middleware.rate_limit import RateLimiter
from api.routes import health, voices, generate, jobs
from api.routes import user_voices
from api.routes import transcribe

logger = logging.getLogger("VoxarAPI")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles engine initialization on startup and cleanup on shutdown.
    """
    settings = app.state.settings
    start_time = time.time()

    logger.info("=" * 60)
    logger.info("  VOXAR AI TTS SERVER - STARTING")
    logger.info("=" * 60)

    # ── STARTUP ──

    # 1. Initialize TTS engine (loads XTTS model - takes ~20s)
    logger.info("Loading TTS engine...")
    from engine.tts_engine import VoxarTTSEngine
    from engine.engine_router import EngineRouter
    from engine.voice_manager import VoiceManager

    xtts_engine = VoxarTTSEngine(output_dir=settings.OUTPUT_DIR)
    engine = EngineRouter(
        xtts_engine=xtts_engine,
        se_cache_dir=os.path.join(settings.VOICES_DIR, "se_cache"),
        whisper_model_size=settings.WHISPER_MODEL_SIZE,
        whisper_compute_type=settings.WHISPER_COMPUTE_TYPE,
        hf_token=settings.HF_TOKEN,
    )
    app.state.engine = engine

    # 2. Initialize voice manager
    voice_manager = VoiceManager(voices_dir=settings.VOICES_DIR)
    app.state.voice_manager = voice_manager
    logger.info(f"Voice catalog: {len(voice_manager.list_voices())} voices loaded")

    # 2b. Initialize user voice manager
    from engine.user_voice_manager import UserVoiceManager
    user_voice_manager = UserVoiceManager(base_dir=settings.USER_VOICES_DIR)
    app.state.user_voice_manager = user_voice_manager
    logger.info(
        f"User voice manager ready: base_dir={settings.USER_VOICES_DIR}"
    )

    # 3. Initialize GPU job queue
    queue = GPUJobQueue(
        engine=engine,
        voice_manager=voice_manager,
        settings=settings,
        user_voice_manager=user_voice_manager,
    )
    app.state.queue = queue
    await queue.start()

    # 4. Initialize rate limiter
    rate_limiter = RateLimiter(
        requests_per_minute=settings.RATE_LIMIT_PER_MINUTE,
        burst=settings.RATE_LIMIT_BURST,
    )
    app.state.rate_limiter = rate_limiter

    # 5. Store metadata
    app.state.start_time = start_time

    startup_time = time.time() - start_time
    logger.info("=" * 60)
    logger.info(f"  VOXAR SERVER READY in {startup_time:.1f}s")
    logger.info(f"  http://{settings.HOST}:{settings.PORT}/docs")
    logger.info("=" * 60)

    yield  # ── SERVER RUNS ──

    # ── SHUTDOWN ──
    logger.info("VOXAR server shutting down...")

    # Stop queue worker
    await queue.stop()

    # Unload engine models
    try:
        if engine.is_model_loaded:
            engine.xtts.unload_model()
            logger.info("XTTS model unloaded")
    except Exception as e:
        logger.error(f"Error unloading engine: {e}")

    logger.info("VOXAR server stopped")


def create_app():
    """Create and configure the FastAPI application."""
    settings = Settings()

    app = FastAPI(
        title="VOXAR AI TTS/STT API",
        description="GPU-powered AI Text-to-Speech and Speech-to-Text API for Indian languages",
        version="1.2.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Store settings early (needed by lifespan)
    app.state.settings = settings

    # ── Middleware ──

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API Key Authentication
    app.add_middleware(APIKeyMiddleware, api_keys=settings.API_KEYS)

    # ── Routes ──
    app.include_router(health.router, prefix="/api/v1")
    app.include_router(voices.router, prefix="/api/v1")
    app.include_router(generate.router, prefix="/api/v1")
    app.include_router(jobs.router, prefix="/api/v1")
    app.include_router(user_voices.router, prefix="/api/v1")
    app.include_router(transcribe.router, prefix="/api/v1")

    # ── Static Files ──
    # Serve generated audio files
    output_path = Path(settings.OUTPUT_DIR)
    output_path.mkdir(parents=True, exist_ok=True)
    app.mount("/audio", StaticFiles(directory=str(output_path)), name="audio")

    # Serve voice preview clips
    preview_path = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) / "voices" / "previews"
    preview_path.mkdir(parents=True, exist_ok=True)
    app.mount("/previews", StaticFiles(directory=str(preview_path)), name="previews")

    # Root endpoint
    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "name": "VOXAR AI TTS/STT API",
            "version": "1.2.0",
            "docs": "/docs",
            "health": "/api/v1/health",
        }

    return app


# Create the app instance (used by uvicorn)
app = create_app()
