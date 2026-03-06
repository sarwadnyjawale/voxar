"""
VOXAR AI TTS Server
Run: python run_server.py

Environment variables:
    VOXAR_HOST          Server host (default: 0.0.0.0)
    VOXAR_PORT          Server port (default: 8000)
    VOXAR_DEBUG         Enable debug/reload mode (default: false)
    VOXAR_API_KEYS      Comma-separated API keys (default: voxar-dev-key-001)

Example:
    python run_server.py
    curl -H "X-API-Key: voxar-dev-key-001" http://localhost:8000/api/v1/health
"""
import sys
import os

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.config import Settings


def main():
    settings = Settings()

    print("=" * 60)
    print("  VOXAR AI TTS SERVER")
    print("=" * 60)
    print(f"  Host:    {settings.HOST}")
    print(f"  Port:    {settings.PORT}")
    print(f"  Debug:   {settings.DEBUG}")
    print(f"  Docs:    http://localhost:{settings.PORT}/docs")
    print("=" * 60)

    import uvicorn
    uvicorn.run(
        "api.app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )


if __name__ == "__main__":
    main()
