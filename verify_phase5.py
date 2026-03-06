"""
Verify Phase 5: FastAPI AI Server & GPU Job Queue.
Run from project root: python verify_phase5.py
"""
import ast
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

passed = 0
failed = 0


def check(label, condition, note=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS  {label}")
    else:
        failed += 1
        msg = f"  FAIL  {label}"
        if note:
            msg += f" -- {note}"
        print(msg)


print("=" * 60)
print("  VOXAR PHASE 5 VERIFICATION")
print("  FastAPI AI Server & GPU Job Queue")
print("=" * 60)

# ----------------------------------------------
# 1. FILE EXISTENCE (15 files)
# ----------------------------------------------
print("\n-- 1. File Existence --")

phase5_files = [
    "api/__init__.py",
    "api/config.py",
    "api/gpu_queue.py",
    "api/middleware/__init__.py",
    "api/middleware/api_key.py",
    "api/middleware/rate_limit.py",
    "api/dependencies.py",
    "api/routes/__init__.py",
    "api/routes/health.py",
    "api/routes/voices.py",
    "api/routes/generate.py",
    "api/routes/jobs.py",
    "api/app.py",
    "run_server.py",
]

for f in phase5_files:
    check(f"exists: {f}", os.path.exists(f))

# ----------------------------------------------
# 2. SYNTAX VALIDATION (all files parse cleanly)
# ----------------------------------------------
print("\n-- 2. Syntax Validation --")

for f in phase5_files:
    try:
        with open(f, "r", encoding="utf-8") as fh:
            ast.parse(fh.read())
        check(f"syntax OK: {f}", True)
    except SyntaxError as e:
        check(f"syntax OK: {f}", False, str(e))

# ----------------------------------------------
# 3. CONFIG (api/config.py)
# ----------------------------------------------
print("\n-- 3. Config Module --")

from api.config import Settings

settings = Settings()
check("Settings class importable", True)
check("HOST has default", settings.HOST == "0.0.0.0")
check("PORT has default", settings.PORT == 8000)
check("DEBUG defaults to False", settings.DEBUG is False)
check("API_KEYS has default key", "voxar-dev-key-001" in settings.API_KEYS)
check("RATE_LIMIT_PER_MINUTE is int", isinstance(settings.RATE_LIMIT_PER_MINUTE, int))
check("MAX_TEXT_LENGTH is 5000", settings.MAX_TEXT_LENGTH == 5000)
check("MAX_SYNC_TEXT_LENGTH is 1000", settings.MAX_SYNC_TEXT_LENGTH == 1000)
check("MAX_QUEUE_SIZE is 20", settings.MAX_QUEUE_SIZE == 20)
check("JOB_TIMEOUT_SECONDS is 120", settings.JOB_TIMEOUT_SECONDS == 120)
check("JOB_RESULT_TTL_SECONDS is 3600", settings.JOB_RESULT_TTL_SECONDS == 3600)
check("VALID_MODES has 4 modes", len(settings.VALID_MODES) == 4)
check("flash in VALID_MODES", "flash" in settings.VALID_MODES)
check("cinematic in VALID_MODES", "cinematic" in settings.VALID_MODES)
check("longform in VALID_MODES", "longform" in settings.VALID_MODES)
check("multilingual in VALID_MODES", "multilingual" in settings.VALID_MODES)
check("OUTPUT_DIR has default", settings.OUTPUT_DIR == "output/api")
check("VOICES_DIR has default", settings.VOICES_DIR == "voices")
check("CORS_ORIGINS has default", "*" in settings.CORS_ORIGINS)
check("to_dict() works", isinstance(settings.to_dict(), dict))
check("to_dict() excludes API_KEYS", "api_keys" not in settings.to_dict())

# ----------------------------------------------
# 4. GPU JOB QUEUE (api/gpu_queue.py)
# ----------------------------------------------
print("\n-- 4. GPU Job Queue --")

from api.gpu_queue import GPUJobQueue, JobResult

check("GPUJobQueue importable", True)
check("JobResult importable", True)

# Check JobResult fields
jr = JobResult(job_id="test_001", text="Hello", voice_id="v001")
check("JobResult.job_id works", jr.job_id == "test_001")
check("JobResult.status defaults to queued", jr.status == "queued")
check("JobResult.text stored", jr.text == "Hello")
check("JobResult.voice_id stored", jr.voice_id == "v001")
check("JobResult.language defaults to en", jr.language == "en")
check("JobResult.mode defaults to flash", jr.mode == "flash")
check("JobResult.speed defaults to 1.0", jr.speed == 1.0)
check("JobResult.output_format defaults to mp3", jr.output_format == "mp3")
check("JobResult.audio_path defaults to None", jr.audio_path is None)
check("JobResult.error defaults to None", jr.error is None)

# Check to_dict
d = jr.to_dict()
check("to_dict() returns dict", isinstance(d, dict))
check("to_dict() has job_id", d.get("job_id") == "test_001")
check("to_dict() has status", d.get("status") == "queued")
check("to_dict() has text_preview", "text_preview" in d)

# Check GPUJobQueue has required methods
check("GPUJobQueue has start()", hasattr(GPUJobQueue, "start"))
check("GPUJobQueue has stop()", hasattr(GPUJobQueue, "stop"))
check("GPUJobQueue has submit()", hasattr(GPUJobQueue, "submit"))
check("GPUJobQueue has get_job()", hasattr(GPUJobQueue, "get_job"))
check("GPUJobQueue has get_queue_position()", hasattr(GPUJobQueue, "get_queue_position"))
check("GPUJobQueue has get_queue_stats()", hasattr(GPUJobQueue, "get_queue_stats"))
check("GPUJobQueue has _worker()", hasattr(GPUJobQueue, "_worker"))
check("GPUJobQueue has _process_job()", hasattr(GPUJobQueue, "_process_job"))
check("GPUJobQueue has _cleanup_expired()", hasattr(GPUJobQueue, "_cleanup_expired"))

# Check gpu_queue.py source for asyncio.to_thread (offloads GPU work)
with open("api/gpu_queue.py", "r", encoding="utf-8") as f:
    queue_src = f.read()
check("uses asyncio.to_thread()", "asyncio.to_thread" in queue_src)
check("uses asyncio.Queue", "asyncio.Queue" in queue_src)
check("imports VoxarPipeline", "VoxarPipeline" in queue_src)
check("imports VoxarExporter", "VoxarExporter" in queue_src)
check("thread lock for jobs dict", "threading.Lock" in queue_src)

# ----------------------------------------------
# 5. MIDDLEWARE - API KEY (api/middleware/api_key.py)
# ----------------------------------------------
print("\n-- 5. API Key Middleware --")

from api.middleware.api_key import APIKeyMiddleware, PUBLIC_PATHS

check("APIKeyMiddleware importable", True)
check("PUBLIC_PATHS has /api/v1/health", "/api/v1/health" in PUBLIC_PATHS)
check("PUBLIC_PATHS has /docs", "/docs" in PUBLIC_PATHS)
check("PUBLIC_PATHS has /redoc", "/redoc" in PUBLIC_PATHS)
check("PUBLIC_PATHS has /openapi.json", "/openapi.json" in PUBLIC_PATHS)
check("PUBLIC_PATHS has /", "/" in PUBLIC_PATHS)
check("inherits BaseHTTPMiddleware", "BaseHTTPMiddleware" in str(APIKeyMiddleware.__bases__))

with open("api/middleware/api_key.py", "r", encoding="utf-8") as f:
    auth_src = f.read()
check("checks X-API-Key header", "X-API-Key" in auth_src)
check("checks api_key query param", 'api_key' in auth_src)
check("returns 401 for missing key", "401" in auth_src)
check("stores key in request.state", "request.state.api_key" in auth_src)
check("skips /audio paths", "/audio" in auth_src)

# ----------------------------------------------
# 6. MIDDLEWARE - RATE LIMITER (api/middleware/rate_limit.py)
# ----------------------------------------------
print("\n-- 6. Rate Limiter --")

from api.middleware.rate_limit import RateLimiter

check("RateLimiter importable", True)

rl = RateLimiter(requests_per_minute=60, burst=10)
check("RateLimiter instantiates", True)

# First request should be allowed
allowed, retry_after = rl.check("test-key")
check("first request allowed", allowed is True)
check("no retry_after on first", retry_after is None)

# Exhaust the bucket
for _ in range(9):  # already used 1
    rl.check("test-key")

# Next should be rate limited
allowed2, retry_after2 = rl.check("test-key")
check("11th request rate limited", allowed2 is False)
check("retry_after is numeric", isinstance(retry_after2, (int, float)))

# Different key should still be allowed
allowed3, _ = rl.check("other-key")
check("different key still allowed", allowed3 is True)

# Cleanup method exists
check("cleanup_stale() exists", hasattr(rl, "cleanup_stale"))

# ----------------------------------------------
# 7. DEPENDENCIES (api/dependencies.py)
# ----------------------------------------------
print("\n-- 7. Dependencies --")

import api.dependencies as deps

check("get_settings exists", hasattr(deps, "get_settings"))
check("get_engine exists", hasattr(deps, "get_engine"))
check("get_queue exists", hasattr(deps, "get_queue"))
check("get_voice_manager exists", hasattr(deps, "get_voice_manager"))
check("get_rate_limiter exists", hasattr(deps, "get_rate_limiter"))
check("check_rate_limit exists", hasattr(deps, "check_rate_limit"))

with open("api/dependencies.py", "r", encoding="utf-8") as f:
    deps_src = f.read()
check("uses request.app.state", "request.app.state" in deps_src)
check("raises HTTPException 429", "429" in deps_src)
check("uses Retry-After header", "Retry-After" in deps_src)

# ----------------------------------------------
# 8. ROUTES - HEALTH (api/routes/health.py)
# ----------------------------------------------
print("\n-- 8. Health Route --")

from api.routes.health import router as health_router

check("health router importable", True)
routes = [r.path for r in health_router.routes]
check("GET /health registered", "/health" in routes)

with open("api/routes/health.py", "r", encoding="utf-8") as f:
    health_src = f.read()
check("returns uptime_seconds", "uptime_seconds" in health_src)
check("returns queue stats", "get_queue_stats" in health_src)
check("returns voices_loaded", "voices_loaded" in health_src)
check("returns GPU info", "gpu_info" in health_src or "get_gpu_info" in health_src)

# ----------------------------------------------
# 9. ROUTES - VOICES (api/routes/voices.py)
# ----------------------------------------------
print("\n-- 9. Voices Route --")

from api.routes.voices import router as voices_router

check("voices router importable", True)
routes = [r.path for r in voices_router.routes]
check("GET /voices registered", "/voices" in routes)
check("GET /voices/{voice_id} registered", "/voices/{voice_id}" in routes)

with open("api/routes/voices.py", "r", encoding="utf-8") as f:
    voices_src = f.read()
check("filters by language", "language" in voices_src)
check("filters by gender", "gender" in voices_src)
check("filters by style", "style" in voices_src)
check("sanitizes voice data", "_sanitize_voice" in voices_src)
check("strips embedding_path", "embedding_path" in voices_src)

# ----------------------------------------------
# 10. ROUTES - GENERATE (api/routes/generate.py)
# ----------------------------------------------
print("\n-- 10. Generate Route --")

from api.routes.generate import router as gen_router, GenerateRequest

check("generate router importable", True)
check("GenerateRequest importable", True)

routes = [r.path for r in gen_router.routes]
check("POST /generate registered", "/generate" in routes)
check("POST /generate/sync registered", "/generate/sync" in routes)

# Check GenerateRequest fields
gr = GenerateRequest(text="hello", voice_id="v001")
check("GenerateRequest has text", gr.text == "hello")
check("GenerateRequest has voice_id", gr.voice_id == "v001")
check("GenerateRequest language defaults to auto", gr.language == "auto")
check("GenerateRequest mode defaults to flash", gr.mode == "flash")
check("GenerateRequest speed defaults to 1.0", gr.speed == 1.0)
check("GenerateRequest format defaults to mp3", gr.format == "mp3")

with open("api/routes/generate.py", "r", encoding="utf-8") as f:
    gen_src = f.read()
check("validates text length", "MAX_TEXT_LENGTH" in gen_src or "max_len" in gen_src)
check("validates voice exists", "voice_manager.get_voice" in gen_src or "get_voice" in gen_src)
check("validates mode", "VALID_MODES" in gen_src)
check("handles QueueFull", "QueueFull" in gen_src)
check("sync has shorter text limit", "MAX_SYNC_TEXT_LENGTH" in gen_src)
check("sync polls until complete", "poll_interval" in gen_src or "elapsed" in gen_src)
check("sync returns audio_url", "audio_url" in gen_src)
check("returns 503 when queue full", "503" in gen_src)

# ----------------------------------------------
# 11. ROUTES - JOBS (api/routes/jobs.py)
# ----------------------------------------------
print("\n-- 11. Jobs Route --")

from api.routes.jobs import router as jobs_router

check("jobs router importable", True)
routes = [r.path for r in jobs_router.routes]
check("GET /jobs/{job_id} registered", "/jobs/{job_id}" in routes)
check("GET /jobs/{job_id}/audio registered", "/jobs/{job_id}/audio" in routes)

with open("api/routes/jobs.py", "r", encoding="utf-8") as f:
    jobs_src = f.read()
check("returns FileResponse for audio", "FileResponse" in jobs_src)
check("handles missing job (404)", "404" in jobs_src)
check("handles job still processing (409)", "409" in jobs_src)
check("handles failed job (410)", "410" in jobs_src)
check("detects mp3 content type", "audio/mpeg" in jobs_src)
check("detects wav content type", "audio/wav" in jobs_src)

# ----------------------------------------------
# 12. APP FACTORY (api/app.py)
# ----------------------------------------------
print("\n-- 12. App Factory --")

with open("api/app.py", "r", encoding="utf-8") as f:
    app_src = f.read()

check("has create_app function", "def create_app" in app_src)
check("has lifespan context manager", "async def lifespan" in app_src or "asynccontextmanager" in app_src)
check("creates FastAPI instance", "FastAPI(" in app_src)
check("uses CORSMiddleware", "CORSMiddleware" in app_src)
check("uses APIKeyMiddleware", "APIKeyMiddleware" in app_src)
check("includes health router", "health.router" in app_src)
check("includes voices router", "voices.router" in app_src)
check("includes generate router", "generate.router" in app_src)
check("includes jobs router", "jobs.router" in app_src)
check("uses /api/v1 prefix", "/api/v1" in app_src)
check("mounts static files at /audio", '"/audio"' in app_src)
check("loads VoxarTTSEngine on startup", "VoxarTTSEngine" in app_src)
check("creates EngineRouter", "EngineRouter" in app_src)
check("creates VoiceManager", "VoiceManager" in app_src)
check("creates GPUJobQueue", "GPUJobQueue" in app_src)
check("creates RateLimiter", "RateLimiter" in app_src)
check("starts queue on startup", "queue.start" in app_src)
check("stops queue on shutdown", "queue.stop" in app_src)
check("unloads model on shutdown", "unload_model" in app_src)
check("module-level app = create_app()", re.search(r"^app\s*=\s*create_app\(\)", app_src, re.MULTILINE) is not None)

# Route count (at least 4 routers x include_router; Phase 6+ may add more)
router_includes = app_src.count("include_router")
check(f"4+ routers included ({router_includes})", router_includes >= 4)

# ----------------------------------------------
# 13. RUN SERVER (run_server.py)
# ----------------------------------------------
print("\n-- 13. Run Server --")

with open("run_server.py", "r", encoding="utf-8") as f:
    run_src = f.read()

check("imports uvicorn", "uvicorn" in run_src)
check("imports Settings", "Settings" in run_src)
check('runs "api.app:app"', "api.app:app" in run_src)
check("has main() function", "def main" in run_src)
check("has __main__ guard", "__main__" in run_src)

# ----------------------------------------------
# 14. SEPARATION OF CONCERNS
# ----------------------------------------------
print("\n-- 14. Separation of Concerns --")

# No TTS generation logic in api/ files
api_files = [
    "api/config.py",
    "api/dependencies.py",
    "api/middleware/api_key.py",
    "api/middleware/rate_limit.py",
    "api/routes/health.py",
    "api/routes/voices.py",
    "api/routes/generate.py",
    "api/routes/jobs.py",
    "api/app.py",
]

violations = []
for f in api_files:
    with open(f, "r", encoding="utf-8") as fh:
        src = fh.read()
    # Check for direct TTS/audio generation logic
    # These imports are OK in gpu_queue.py (it delegates to engine), but not in route files
    if f != "api/app.py":  # app.py legitimately imports engine for startup
        if "tts_to_file" in src:
            violations.append(f"{f}: contains tts_to_file (TTS logic)")
        if "AudioConcatenator" in src:
            violations.append(f"{f}: contains AudioConcatenator (audio logic)")
        if "ScriptPreprocessor" in src:
            violations.append(f"{f}: contains ScriptPreprocessor (preprocessing logic)")

check("no TTS logic in API routes", len(violations) == 0,
      "; ".join(violations) if violations else "")

# No billing/credit logic anywhere in api/
# (skip comment/docstring lines — only check actual code)
billing_violations = []
for f in api_files + ["api/gpu_queue.py"]:
    with open(f, "r", encoding="utf-8") as fh:
        lines = fh.readlines()
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Skip comments and docstring lines
        if stripped.startswith("#") or stripped.startswith('"""') or stripped.startswith("- "):
            continue
        for term in ["credit", "billing", "payment", "razorpay", "stripe"]:
            if term in stripped.lower():
                billing_violations.append(f"{f}:{i}: contains '{term}'")

check("no billing/credit logic in api/", len(billing_violations) == 0,
      "; ".join(billing_violations) if billing_violations else "")

# gpu_queue.py delegates to engine (uses VoxarPipeline, not direct TTS calls)
check("gpu_queue delegates via VoxarPipeline", "VoxarPipeline" in queue_src)
check("gpu_queue does not call tts_to_file directly", "tts_to_file" not in queue_src)

# ----------------------------------------------
# 15. API ENDPOINT COMPLETENESS
# ----------------------------------------------
print("\n-- 15. API Endpoint Completeness --")

# Verify all 7 planned endpoints exist
expected_endpoints = {
    "GET /health": False,
    "GET /voices": False,
    "GET /voices/{voice_id}": False,
    "POST /generate": False,
    "POST /generate/sync": False,
    "GET /jobs/{job_id}": False,
    "GET /jobs/{job_id}/audio": False,
}

# Check each router
for route in health_router.routes:
    methods = getattr(route, "methods", set())
    if "GET" in methods and route.path == "/health":
        expected_endpoints["GET /health"] = True

for route in voices_router.routes:
    methods = getattr(route, "methods", set())
    if "GET" in methods and route.path == "/voices":
        expected_endpoints["GET /voices"] = True
    if "GET" in methods and route.path == "/voices/{voice_id}":
        expected_endpoints["GET /voices/{voice_id}"] = True

for route in gen_router.routes:
    methods = getattr(route, "methods", set())
    if "POST" in methods and route.path == "/generate":
        expected_endpoints["POST /generate"] = True
    if "POST" in methods and route.path == "/generate/sync":
        expected_endpoints["POST /generate/sync"] = True

for route in jobs_router.routes:
    methods = getattr(route, "methods", set())
    if "GET" in methods and route.path == "/jobs/{job_id}":
        expected_endpoints["GET /jobs/{job_id}"] = True
    if "GET" in methods and route.path == "/jobs/{job_id}/audio":
        expected_endpoints["GET /jobs/{job_id}/audio"] = True

for endpoint, found in expected_endpoints.items():
    check(f"endpoint: {endpoint}", found)

# ----------------------------------------------
# 16. IMPORT CHAIN VALIDATION
# ----------------------------------------------
print("\n-- 16. Import Chain Validation --")

try:
    from api.gpu_queue import GPUJobQueue, JobResult
    check("import: api.gpu_queue", True)
except Exception as e:
    check("import: api.gpu_queue", False, str(e))

try:
    from api.middleware.api_key import APIKeyMiddleware
    check("import: api.middleware.api_key", True)
except Exception as e:
    check("import: api.middleware.api_key", False, str(e))

try:
    from api.middleware.rate_limit import RateLimiter
    check("import: api.middleware.rate_limit", True)
except Exception as e:
    check("import: api.middleware.rate_limit", False, str(e))

try:
    from api.dependencies import get_engine, get_queue, get_voice_manager, check_rate_limit
    check("import: api.dependencies", True)
except Exception as e:
    check("import: api.dependencies", False, str(e))

try:
    from api.routes.health import router
    check("import: api.routes.health", True)
except Exception as e:
    check("import: api.routes.health", False, str(e))

try:
    from api.routes.voices import router
    check("import: api.routes.voices", True)
except Exception as e:
    check("import: api.routes.voices", False, str(e))

try:
    from api.routes.generate import router, GenerateRequest
    check("import: api.routes.generate", True)
except Exception as e:
    check("import: api.routes.generate", False, str(e))

try:
    from api.routes.jobs import router
    check("import: api.routes.jobs", True)
except Exception as e:
    check("import: api.routes.jobs", False, str(e))

try:
    from api.config import Settings
    check("import: api.config", True)
except Exception as e:
    check("import: api.config", False, str(e))


# ============================================
# SUMMARY
# ============================================
print("\n" + "=" * 60)
total = passed + failed
if failed == 0:
    print(f"  ALL CHECKS PASSED: {passed}/{total}")
else:
    print(f"  RESULT: {passed}/{total} passed, {failed} FAILED")
print("=" * 60)

sys.exit(0 if failed == 0 else 1)
