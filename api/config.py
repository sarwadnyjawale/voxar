"""
VOXAR API Server Configuration.
Loads settings from environment variables with sensible defaults.

Environment variables:
    VOXAR_HOST              Server host (default: 0.0.0.0)
    VOXAR_PORT              Server port (default: 8000)
    VOXAR_DEBUG             Enable debug mode (default: false)
    VOXAR_API_KEYS          Comma-separated API keys
    VOXAR_RATE_LIMIT        Requests per minute per key (default: 10)
    VOXAR_MAX_TEXT_LENGTH    Max chars per request (default: 5000)
    VOXAR_MAX_QUEUE_SIZE    Max pending jobs (default: 20)
    VOXAR_OUTPUT_DIR        Output directory for generated audio
    VOXAR_VOICES_DIR        Voice catalog directory
    VOXAR_CORS_ORIGINS      Comma-separated CORS origins
"""

import os


class Settings:
    """Server configuration with environment variable overrides."""

    def __init__(self):
        # Server
        self.HOST = os.getenv("VOXAR_HOST", "0.0.0.0")
        self.PORT = int(os.getenv("VOXAR_PORT", "8000"))
        self.DEBUG = os.getenv("VOXAR_DEBUG", "false").lower() in ("true", "1", "yes")

        # API Keys
        keys_str = os.getenv("VOXAR_API_KEYS", "voxar-dev-key-001")
        self.API_KEYS = [k.strip() for k in keys_str.split(",") if k.strip()]

        # Rate limiting
        self.RATE_LIMIT_PER_MINUTE = int(os.getenv("VOXAR_RATE_LIMIT", "10"))
        self.RATE_LIMIT_BURST = int(os.getenv("VOXAR_RATE_LIMIT_BURST", "5"))

        # Generation limits
        self.MAX_TEXT_LENGTH = int(os.getenv("VOXAR_MAX_TEXT_LENGTH", "5000"))
        self.MAX_SYNC_TEXT_LENGTH = int(os.getenv("VOXAR_MAX_SYNC_TEXT_LENGTH", "1000"))
        self.MAX_QUEUE_SIZE = int(os.getenv("VOXAR_MAX_QUEUE_SIZE", "20"))
        self.JOB_TIMEOUT_SECONDS = int(os.getenv("VOXAR_JOB_TIMEOUT", "120"))
        self.JOB_RESULT_TTL_SECONDS = int(os.getenv("VOXAR_JOB_TTL", "3600"))

        # User Voice Cloning
        self.MAX_USER_VOICES = int(os.getenv("VOXAR_MAX_USER_VOICES", "10"))
        self.MAX_UPLOAD_SIZE_MB = int(os.getenv("VOXAR_MAX_UPLOAD_SIZE_MB", "15"))
        self.USER_VOICES_DIR = os.getenv("VOXAR_USER_VOICES_DIR", "voices/user_voices")

        # Speech-to-Text (Whisper)
        self.WHISPER_MODEL_SIZE = os.getenv("VOXAR_WHISPER_MODEL", "large-v3")
        self.WHISPER_COMPUTE_TYPE = os.getenv("VOXAR_WHISPER_COMPUTE", "int8")
        self.HF_TOKEN = os.getenv("HF_TOKEN", "")  # For pyannote diarization
        self.MAX_AUDIO_UPLOAD_DURATION = int(os.getenv("VOXAR_MAX_AUDIO_DURATION", "7200"))
        self.MAX_AUDIO_UPLOAD_SIZE_MB = int(os.getenv("VOXAR_MAX_AUDIO_UPLOAD_MB", "100"))
        self.MAX_SYNC_AUDIO_DURATION = int(os.getenv("VOXAR_MAX_SYNC_AUDIO", "60"))

        # Engine
        self.DEFAULT_MODE = os.getenv("VOXAR_DEFAULT_MODE", "flash")
        self.DEFAULT_LANGUAGE = os.getenv("VOXAR_DEFAULT_LANGUAGE", "en")
        self.DEFAULT_SPEED = float(os.getenv("VOXAR_DEFAULT_SPEED", "1.0"))
        self.OUTPUT_DIR = os.getenv("VOXAR_OUTPUT_DIR", "output/api")
        self.VOICES_DIR = os.getenv("VOXAR_VOICES_DIR", "voices")

        # CORS
        origins_str = os.getenv("VOXAR_CORS_ORIGINS", "*")
        self.CORS_ORIGINS = [o.strip() for o in origins_str.split(",") if o.strip()]

        # Valid modes (from engine configs)
        self.VALID_MODES = {"flash", "cinematic", "longform", "multilingual"}

        # Speed range
        self.MIN_SPEED = 0.5
        self.MAX_SPEED = 2.0

    def to_dict(self):
        """Return settings as dict (excludes API keys for security)."""
        return {
            "host": self.HOST,
            "port": self.PORT,
            "debug": self.DEBUG,
            "rate_limit_per_minute": self.RATE_LIMIT_PER_MINUTE,
            "max_text_length": self.MAX_TEXT_LENGTH,
            "max_queue_size": self.MAX_QUEUE_SIZE,
            "max_user_voices": self.MAX_USER_VOICES,
            "max_upload_size_mb": self.MAX_UPLOAD_SIZE_MB,
            "user_voices_dir": self.USER_VOICES_DIR,
            "whisper_model_size": self.WHISPER_MODEL_SIZE,
            "whisper_compute_type": self.WHISPER_COMPUTE_TYPE,
            "hf_token_set": bool(self.HF_TOKEN),
            "max_audio_upload_duration": self.MAX_AUDIO_UPLOAD_DURATION,
            "max_audio_upload_size_mb": self.MAX_AUDIO_UPLOAD_SIZE_MB,
            "max_sync_audio_duration": self.MAX_SYNC_AUDIO_DURATION,
            "job_timeout_seconds": self.JOB_TIMEOUT_SECONDS,
            "output_dir": self.OUTPUT_DIR,
            "voices_dir": self.VOICES_DIR,
            "valid_modes": sorted(self.VALID_MODES),
        }
