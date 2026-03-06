"""
VOXAR API Key Authentication Middleware.
Validates X-API-Key header or api_key query parameter against configured keys.

Public endpoints (no auth required):
  - GET /api/v1/health
  - GET /docs, /openapi.json, /redoc
"""

import json
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("VoxarAuth")

# Paths that don't require authentication
PUBLIC_PATHS = {
    "/api/v1/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/",
}


class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Simple API key authentication middleware.

    Checks for API key in:
    1. X-API-Key header
    2. api_key query parameter

    Keys are validated against the list in Settings.API_KEYS.
    """

    def __init__(self, app, api_keys):
        """
        Args:
            app: ASGI application
            api_keys: list of valid API key strings
        """
        super().__init__(app)
        self._api_keys = set(api_keys)
        logger.info(f"API key auth enabled ({len(api_keys)} keys configured)")

    async def dispatch(self, request: Request, call_next):
        path = request.url.path.rstrip("/") or "/"

        # Skip auth for public endpoints
        if path in PUBLIC_PATHS or path.startswith("/audio"):
            return await call_next(request)

        # Extract API key
        api_key = request.headers.get("X-API-Key")
        if not api_key:
            api_key = request.query_params.get("api_key")

        if not api_key:
            logger.warning(f"Missing API key: {request.method} {path}")
            return JSONResponse(
                status_code=401,
                content={
                    "error": "missing_api_key",
                    "message": "API key required. Provide via X-API-Key header or api_key query parameter.",
                },
            )

        if api_key not in self._api_keys:
            logger.warning(f"Invalid API key: {request.method} {path}")
            return JSONResponse(
                status_code=401,
                content={
                    "error": "invalid_api_key",
                    "message": "Invalid API key.",
                },
            )

        # Store validated key in request state for downstream use
        request.state.api_key = api_key
        return await call_next(request)
