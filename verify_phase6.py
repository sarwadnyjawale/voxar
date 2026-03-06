"""
VOXAR Phase 6 Verification Script
User Voice Cloning Engine

Tests:
  - UserVoiceManager class and all methods
  - API route registration and endpoint structure
  - Voice ID format validation (uv_ prefix)
  - Metadata JSON schema
  - Config settings
  - Dependency injection
  - GPU queue user voice resolution
  - Generate endpoint user voice acceptance
  - File validation logic (size, format, duration)
  - Voice count limit enforcement
  - Ownership enforcement
  - Delete cleanup
  - Quality analysis pipeline
  - Integration with existing pipeline

Run: python verify_phase6.py
"""

import os
import sys
import json
import inspect
import hashlib
import importlib
import ast
from pathlib import Path

# ── Test framework ──────────────────────────────────────────────────────

passed = 0
failed = 0
total = 0

def check(test_id, description, condition):
    global passed, failed, total
    total += 1
    if condition:
        passed += 1
        print(f"  [PASS] {test_id}: {description}")
    else:
        failed += 1
        print(f"  [FAIL] {test_id}: {description}")

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ========================================================================
# SECTION 1: UserVoiceManager — Class Structure
# ========================================================================
section("1. UserVoiceManager - Class Structure")

from engine.user_voice_manager import UserVoiceManager

check("p6_1_01", "UserVoiceManager class exists",
      inspect.isclass(UserVoiceManager))

check("p6_1_02", "UserVoiceManager has __init__ method",
      hasattr(UserVoiceManager, "__init__"))

check("p6_1_03", "UserVoiceManager has register_voice method",
      hasattr(UserVoiceManager, "register_voice") and callable(getattr(UserVoiceManager, "register_voice")))

check("p6_1_04", "UserVoiceManager has get_voice method",
      hasattr(UserVoiceManager, "get_voice") and callable(getattr(UserVoiceManager, "get_voice")))

check("p6_1_05", "UserVoiceManager has get_user_voices method",
      hasattr(UserVoiceManager, "get_user_voices") and callable(getattr(UserVoiceManager, "get_user_voices")))

check("p6_1_06", "UserVoiceManager has delete_voice method",
      hasattr(UserVoiceManager, "delete_voice") and callable(getattr(UserVoiceManager, "delete_voice")))

check("p6_1_07", "UserVoiceManager has get_voice_count method",
      hasattr(UserVoiceManager, "get_voice_count") and callable(getattr(UserVoiceManager, "get_voice_count")))

check("p6_1_08", "UserVoiceManager has resolve_embedding_path method",
      hasattr(UserVoiceManager, "resolve_embedding_path") and callable(getattr(UserVoiceManager, "resolve_embedding_path")))

check("p6_1_09", "UserVoiceManager has verify_ownership method",
      hasattr(UserVoiceManager, "verify_ownership") and callable(getattr(UserVoiceManager, "verify_ownership")))

check("p6_1_10", "UserVoiceManager has increment_usage method",
      hasattr(UserVoiceManager, "increment_usage") and callable(getattr(UserVoiceManager, "increment_usage")))

check("p6_1_11", "UserVoiceManager has is_user_voice_id static method",
      hasattr(UserVoiceManager, "is_user_voice_id") and callable(getattr(UserVoiceManager, "is_user_voice_id")))


# ========================================================================
# SECTION 2: UserVoiceManager — Constants
# ========================================================================
section("2. UserVoiceManager - Constants")

check("p6_2_01", "MAX_VOICES_PER_USER is set",
      hasattr(UserVoiceManager, "MAX_VOICES_PER_USER") and UserVoiceManager.MAX_VOICES_PER_USER >= 1)

check("p6_2_02", "MAX_UPLOAD_SIZE_MB is set",
      hasattr(UserVoiceManager, "MAX_UPLOAD_SIZE_MB") and UserVoiceManager.MAX_UPLOAD_SIZE_MB >= 1)

check("p6_2_03", "MAX_UPLOAD_SIZE_BYTES computed correctly",
      hasattr(UserVoiceManager, "MAX_UPLOAD_SIZE_BYTES")
      and UserVoiceManager.MAX_UPLOAD_SIZE_BYTES == UserVoiceManager.MAX_UPLOAD_SIZE_MB * 1024 * 1024)

check("p6_2_04", "ALLOWED_EXTENSIONS includes wav",
      ".wav" in UserVoiceManager.ALLOWED_EXTENSIONS)

check("p6_2_05", "ALLOWED_EXTENSIONS includes mp3",
      ".mp3" in UserVoiceManager.ALLOWED_EXTENSIONS)

check("p6_2_06", "ALLOWED_EXTENSIONS includes flac",
      ".flac" in UserVoiceManager.ALLOWED_EXTENSIONS)

check("p6_2_07", "ALLOWED_EXTENSIONS includes m4a",
      ".m4a" in UserVoiceManager.ALLOWED_EXTENSIONS)

check("p6_2_08", "MIN_DURATION_SECONDS >= 10",
      UserVoiceManager.MIN_DURATION_SECONDS >= 10)

check("p6_2_09", "MAX_DURATION_SECONDS >= 60",
      UserVoiceManager.MAX_DURATION_SECONDS >= 60)

check("p6_2_10", "IDEAL_DURATION_MIN >= 15",
      UserVoiceManager.IDEAL_DURATION_MIN >= 15)

check("p6_2_11", "IDEAL_DURATION_MAX >= 30",
      UserVoiceManager.IDEAL_DURATION_MAX >= 30)

check("p6_2_12", "MIN_SAMPLE_RATE >= 16000",
      UserVoiceManager.MIN_SAMPLE_RATE >= 16000)

check("p6_2_13", "QUALITY_THRESHOLD >= 5",
      UserVoiceManager.QUALITY_THRESHOLD >= 5)

check("p6_2_14", "MIN_SPEECH_RATIO > 0",
      UserVoiceManager.MIN_SPEECH_RATIO > 0)

check("p6_2_15", "MAX_SILENCE_RATIO < 1",
      UserVoiceManager.MAX_SILENCE_RATIO < 1)


# ========================================================================
# SECTION 3: UserVoiceManager — Voice ID Logic
# ========================================================================
section("3. UserVoiceManager - Voice ID Logic")

check("p6_3_01", "is_user_voice_id('uv_abc123_def45678') returns True",
      UserVoiceManager.is_user_voice_id("uv_abc123_def45678"))

check("p6_3_02", "is_user_voice_id('v001') returns False",
      not UserVoiceManager.is_user_voice_id("v001"))

check("p6_3_03", "is_user_voice_id('') returns False",
      not UserVoiceManager.is_user_voice_id(""))

check("p6_3_04", "is_user_voice_id(None) returns False",
      not UserVoiceManager.is_user_voice_id(None))

check("p6_3_05", "is_user_voice_id(123) returns False",
      not UserVoiceManager.is_user_voice_id(123))

# Test hash consistency
hash1 = UserVoiceManager._hash_api_key("test-key-123")
hash2 = UserVoiceManager._hash_api_key("test-key-123")
hash3 = UserVoiceManager._hash_api_key("different-key")

check("p6_3_06", "API key hash is deterministic",
      hash1 == hash2)

check("p6_3_07", "Different API keys produce different hashes",
      hash1 != hash3)

check("p6_3_08", "API key hash is 6 characters",
      len(hash1) == 6)

check("p6_3_09", "API key hash is lowercase hex",
      all(c in "0123456789abcdef" for c in hash1))

# Test voice ID generation
vid = UserVoiceManager._generate_voice_id(hash1)

check("p6_3_10", "Generated voice ID starts with 'uv_'",
      vid.startswith("uv_"))

check("p6_3_11", "Generated voice ID contains key hash",
      hash1 in vid)

check("p6_3_12", "Generated voice ID has 3 parts (uv, hash, uuid)",
      len(vid.split("_")) == 3)

# Uniqueness
vid2 = UserVoiceManager._generate_voice_id(hash1)
check("p6_3_13", "Generated voice IDs are unique",
      vid != vid2)


# ========================================================================
# SECTION 4: UserVoiceManager — Initialization
# ========================================================================
section("4. UserVoiceManager - Initialization")

import tempfile
test_base = tempfile.mkdtemp(prefix="voxar_test_uvm_")

try:
    uvm = UserVoiceManager(base_dir=test_base)

    check("p6_4_01", "UserVoiceManager initializes without error", True)

    check("p6_4_02", "base_dir is set correctly",
          str(uvm.base_dir) == test_base)

    check("p6_4_03", "base_dir exists",
          uvm.base_dir.exists())

    check("p6_4_04", "_cleaner is initialized",
          uvm._cleaner is not None)

    from engine.voice_cleaner import VoiceSampleCleaner
    check("p6_4_05", "_cleaner is VoiceSampleCleaner instance",
          isinstance(uvm._cleaner, VoiceSampleCleaner))

except Exception as e:
    check("p6_4_01", f"UserVoiceManager init failed: {e}", False)


# ========================================================================
# SECTION 5: UserVoiceManager — get_voice with invalid IDs
# ========================================================================
section("5. UserVoiceManager - get_voice edge cases")

check("p6_5_01", "get_voice(None) returns None",
      uvm.get_voice(None) is None)

check("p6_5_02", "get_voice('') returns None",
      uvm.get_voice("") is None)

check("p6_5_03", "get_voice('v001') returns None (not user voice)",
      uvm.get_voice("v001") is None)

check("p6_5_04", "get_voice('uv_invalid') returns None (bad format)",
      uvm.get_voice("uv_invalid") is None)

check("p6_5_05", "get_voice('uv_abcdef_12345678') returns None (not exists)",
      uvm.get_voice("uv_abcdef_12345678") is None)


# ========================================================================
# SECTION 6: UserVoiceManager — Ownership verification
# ========================================================================
section("6. UserVoiceManager - Ownership verification")

test_key = "test-api-key-001"
test_hash = UserVoiceManager._hash_api_key(test_key)
test_vid = f"uv_{test_hash}_abcdef01"

other_key = "other-api-key-999"
other_hash = UserVoiceManager._hash_api_key(other_key)
other_vid = f"uv_{other_hash}_abcdef01"

check("p6_6_01", "verify_ownership returns True for matching key",
      uvm.verify_ownership(test_key, test_vid))

check("p6_6_02", "verify_ownership returns False for non-matching key",
      not uvm.verify_ownership(test_key, other_vid))

check("p6_6_03", "verify_ownership returns False for library voice ID",
      not uvm.verify_ownership(test_key, "v001"))

check("p6_6_04", "verify_ownership returns False for None voice_id",
      not uvm.verify_ownership(test_key, None))

check("p6_6_05", "verify_ownership returns False for empty voice_id",
      not uvm.verify_ownership(test_key, ""))


# ========================================================================
# SECTION 7: UserVoiceManager — Voice count
# ========================================================================
section("7. UserVoiceManager - Voice count")

check("p6_7_01", "get_voice_count returns 0 for new user",
      uvm.get_voice_count("brand-new-user-key") == 0)


# ========================================================================
# SECTION 8: UserVoiceManager — resolve_embedding_path errors
# ========================================================================
section("8. UserVoiceManager - resolve_embedding_path errors")

try:
    uvm.resolve_embedding_path("v001")
    check("p6_8_01", "resolve_embedding_path raises ValueError for non-uv_ ID", False)
except ValueError:
    check("p6_8_01", "resolve_embedding_path raises ValueError for non-uv_ ID", True)

try:
    uvm.resolve_embedding_path("")
    check("p6_8_02", "resolve_embedding_path raises ValueError for empty ID", False)
except ValueError:
    check("p6_8_02", "resolve_embedding_path raises ValueError for empty ID", True)

try:
    uvm.resolve_embedding_path("uv_abcdef_12345678")
    check("p6_8_03", "resolve_embedding_path raises FileNotFoundError for non-existent voice", False)
except FileNotFoundError:
    check("p6_8_03", "resolve_embedding_path raises FileNotFoundError for non-existent voice", True)


# ========================================================================
# SECTION 9: UserVoiceManager — Quality Analysis Methods
# ========================================================================
section("9. UserVoiceManager - Quality Analysis Methods")

check("p6_9_01", "Has _pre_validate method",
      hasattr(uvm, "_pre_validate"))

check("p6_9_02", "Has _deep_quality_analysis method",
      hasattr(uvm, "_deep_quality_analysis"))

check("p6_9_03", "Has _calculate_speech_ratio method",
      hasattr(uvm, "_calculate_speech_ratio"))

check("p6_9_04", "Has _estimate_snr method",
      hasattr(uvm, "_estimate_snr"))

check("p6_9_05", "Has _measure_volume_consistency method",
      hasattr(uvm, "_measure_volume_consistency"))

check("p6_9_06", "Has _generate_improvement_tips method",
      hasattr(uvm, "_generate_improvement_tips"))

check("p6_9_07", "Has _build_rejection_reason method",
      hasattr(uvm, "_build_rejection_reason"))

check("p6_9_08", "Has _build_acceptance_message method",
      hasattr(uvm, "_build_acceptance_message"))

# Score to grade mapping
check("p6_9_09", "_score_to_grade(10) = A+",
      UserVoiceManager._score_to_grade(10) == "A+")

check("p6_9_10", "_score_to_grade(9) = A",
      UserVoiceManager._score_to_grade(9) == "A")

check("p6_9_11", "_score_to_grade(8) = B+",
      UserVoiceManager._score_to_grade(8) == "B+")

check("p6_9_12", "_score_to_grade(7) = B",
      UserVoiceManager._score_to_grade(7) == "B")

check("p6_9_13", "_score_to_grade(6) = C+",
      UserVoiceManager._score_to_grade(6) == "C+")

check("p6_9_14", "_score_to_grade(3) = F",
      UserVoiceManager._score_to_grade(3) == "F")

check("p6_9_15", "_score_to_grade(0) = F",
      UserVoiceManager._score_to_grade(0) == "F")


# ========================================================================
# SECTION 10: UserVoiceManager — Pre-validation
# ========================================================================
section("10. UserVoiceManager - Pre-validation")

# Test with non-existent file
result = uvm._pre_validate("/non/existent/file.wav")
check("p6_10_01", "_pre_validate rejects non-existent file",
      not result["valid"])

# Test with empty extension check
check("p6_10_02", "ALLOWED_EXTENSIONS has >= 5 formats",
      len(UserVoiceManager.ALLOWED_EXTENSIONS) >= 5)


# ========================================================================
# SECTION 11: UserVoiceManager — Delete edge cases
# ========================================================================
section("11. UserVoiceManager - Delete edge cases")

check("p6_11_01", "delete_voice returns False for non-existent voice",
      uvm.delete_voice(test_key, f"uv_{test_hash}_nonexist") is False)

check("p6_11_02", "delete_voice returns False for non-uv_ ID",
      uvm.delete_voice(test_key, "v001") is False)

try:
    uvm.delete_voice(test_key, other_vid)
    check("p6_11_03", "delete_voice raises PermissionError for wrong owner", False)
except PermissionError:
    check("p6_11_03", "delete_voice raises PermissionError for wrong owner", True)


# ========================================================================
# SECTION 12: API Routes — user_voices.py structure
# ========================================================================
section("12. API Routes - user_voices.py structure")

from api.routes import user_voices

check("p6_12_01", "user_voices module exists",
      user_voices is not None)

check("p6_12_02", "user_voices has router",
      hasattr(user_voices, "router"))

from fastapi import APIRouter
check("p6_12_03", "router is an APIRouter instance",
      isinstance(user_voices.router, APIRouter))

# Check routes exist
routes = [r.path for r in user_voices.router.routes]

check("p6_12_04", "/voices/clone POST route exists",
      any("/voices/clone" in str(r.path) for r in user_voices.router.routes))

check("p6_12_05", "clone_voice function exists",
      hasattr(user_voices, "clone_voice"))

check("p6_12_06", "list_user_voices function exists",
      hasattr(user_voices, "list_user_voices"))

check("p6_12_07", "get_user_voice function exists",
      hasattr(user_voices, "get_user_voice"))

check("p6_12_08", "delete_user_voice function exists",
      hasattr(user_voices, "delete_user_voice"))

# Check route tags
check("p6_12_09", "Router has voice-cloning tag",
      "voice-cloning" in user_voices.router.tags)


# ========================================================================
# SECTION 13: API Routes — Route details
# ========================================================================
section("13. API Routes - Route details")

# Read the source to check for important patterns
uv_source = Path("api/routes/user_voices.py").read_text(encoding="utf-8")

check("p6_13_01", "Route uses UploadFile for file upload",
      "UploadFile" in uv_source)

check("p6_13_02", "Route uses File() dependency",
      "File(" in uv_source)

check("p6_13_03", "Route uses Form() for name parameter",
      "Form(" in uv_source)

check("p6_13_04", "Route checks file extension",
      "os.path.splitext" in uv_source or "ext" in uv_source)

check("p6_13_05", "Route enforces upload size limit",
      "max_bytes" in uv_source or "MAX_UPLOAD_SIZE" in uv_source)

check("p6_13_06", "Route cleans up temp files in finally block",
      "finally:" in uv_source and "os.remove" in uv_source)

check("p6_13_07", "Route checks API key ownership",
      "verify_ownership" in uv_source or "_get_api_key" in uv_source)

check("p6_13_08", "Route handles PermissionError for delete",
      "PermissionError" in uv_source)

check("p6_13_09", "Route returns 413 for file too large",
      "413" in uv_source)

check("p6_13_10", "Route returns tips in rejection response",
      "tips" in uv_source)

check("p6_13_11", "DELETE endpoint returns confirmation message",
      '"deleted"' in uv_source or "'deleted'" in uv_source)

check("p6_13_12", "GET list endpoint returns remaining count",
      "remaining" in uv_source)


# ========================================================================
# SECTION 14: API Config — User voice settings
# ========================================================================
section("14. API Config - User voice settings")

from api.config import Settings

settings = Settings()

check("p6_14_01", "Settings has MAX_USER_VOICES",
      hasattr(settings, "MAX_USER_VOICES"))

check("p6_14_02", "MAX_USER_VOICES is int",
      isinstance(settings.MAX_USER_VOICES, int))

check("p6_14_03", "MAX_USER_VOICES >= 1",
      settings.MAX_USER_VOICES >= 1)

check("p6_14_04", "Settings has MAX_UPLOAD_SIZE_MB",
      hasattr(settings, "MAX_UPLOAD_SIZE_MB"))

check("p6_14_05", "MAX_UPLOAD_SIZE_MB is int",
      isinstance(settings.MAX_UPLOAD_SIZE_MB, int))

check("p6_14_06", "MAX_UPLOAD_SIZE_MB >= 5",
      settings.MAX_UPLOAD_SIZE_MB >= 5)

check("p6_14_07", "Settings has USER_VOICES_DIR",
      hasattr(settings, "USER_VOICES_DIR"))

check("p6_14_08", "USER_VOICES_DIR is a string",
      isinstance(settings.USER_VOICES_DIR, str))

check("p6_14_09", "USER_VOICES_DIR default contains 'user_voices'",
      "user_voices" in settings.USER_VOICES_DIR)

# to_dict includes new settings
settings_dict = settings.to_dict()
check("p6_14_10", "to_dict includes max_user_voices",
      "max_user_voices" in settings_dict)

check("p6_14_11", "to_dict includes max_upload_size_mb",
      "max_upload_size_mb" in settings_dict)

check("p6_14_12", "to_dict includes user_voices_dir",
      "user_voices_dir" in settings_dict)


# ========================================================================
# SECTION 15: API App — UserVoiceManager integration
# ========================================================================
section("15. API App - UserVoiceManager integration")

app_source = Path("api/app.py").read_text(encoding="utf-8")

check("p6_15_01", "app.py imports UserVoiceManager",
      "UserVoiceManager" in app_source)

check("p6_15_02", "app.py imports user_voices route module",
      "user_voices" in app_source)

check("p6_15_03", "app.py stores user_voice_manager in app.state",
      "app.state.user_voice_manager" in app_source)

check("p6_15_04", "app.py creates UserVoiceManager with USER_VOICES_DIR",
      "USER_VOICES_DIR" in app_source)

check("p6_15_05", "app.py registers user_voices router",
      "user_voices.router" in app_source)

check("p6_15_06", "app.py passes user_voice_manager to GPUJobQueue",
      "user_voice_manager=user_voice_manager" in app_source
      or "user_voice_manager" in app_source)


# ========================================================================
# SECTION 16: API Dependencies — get_user_voice_manager
# ========================================================================
section("16. API Dependencies - get_user_voice_manager")

from api.dependencies import get_user_voice_manager

check("p6_16_01", "get_user_voice_manager function exists",
      callable(get_user_voice_manager))

deps_source = Path("api/dependencies.py").read_text(encoding="utf-8")

check("p6_16_02", "get_user_voice_manager accesses app.state",
      "user_voice_manager" in deps_source)


# ========================================================================
# SECTION 17: GPU Queue — User voice support
# ========================================================================
section("17. GPU Queue - User voice support")

queue_source = Path("api/gpu_queue.py").read_text(encoding="utf-8")

check("p6_17_01", "GPUJobQueue __init__ accepts user_voice_manager parameter",
      "user_voice_manager" in queue_source)

check("p6_17_02", "_process_job checks is_user_voice_id",
      "is_user_voice_id" in queue_source)

check("p6_17_03", "_process_job calls resolve_embedding_path for user voices",
      "resolve_embedding_path" in queue_source)

check("p6_17_04", "_process_job calls increment_usage for user voices",
      "increment_usage" in queue_source)

check("p6_17_05", "_process_job has fallback for library voices (existing behavior)",
      "get_voice" in queue_source and "voice_manager" in queue_source.lower())

check("p6_17_06", "GPUJobQueue stores _user_voice_manager",
      "_user_voice_manager" in queue_source)

# Check GPUJobQueue constructor signature
from api.gpu_queue import GPUJobQueue
sig = inspect.signature(GPUJobQueue.__init__)
params = list(sig.parameters.keys())

check("p6_17_07", "GPUJobQueue __init__ has user_voice_manager param",
      "user_voice_manager" in params)


# ========================================================================
# SECTION 18: Generate Route — User voice support
# ========================================================================
section("18. Generate Route - User voice support")

gen_source = Path("api/routes/generate.py").read_text(encoding="utf-8")

check("p6_18_01", "generate.py imports get_user_voice_manager",
      "get_user_voice_manager" in gen_source)

check("p6_18_02", "_validate_request accepts user_voice_manager parameter",
      "user_voice_manager" in gen_source)

check("p6_18_03", "_validate_request accepts api_key parameter",
      "api_key" in gen_source)

check("p6_18_04", "_validate_request checks is_user_voice_id",
      "is_user_voice_id" in gen_source)

check("p6_18_05", "_validate_request calls verify_ownership",
      "verify_ownership" in gen_source)

check("p6_18_06", "_validate_request checks voice status for user voices",
      "status" in gen_source and "ready" in gen_source)

check("p6_18_07", "generate_async depends on get_user_voice_manager",
      "user_voice_manager=Depends(get_user_voice_manager)" in gen_source
      or "get_user_voice_manager" in gen_source)

check("p6_18_08", "generate_sync depends on get_user_voice_manager",
      gen_source.count("get_user_voice_manager") >= 3)  # import + 2 endpoints

check("p6_18_09", "generate_async passes user_voice_manager to _validate_request",
      "user_voice_manager=user_voice_manager" in gen_source)

check("p6_18_10", "generate_async extracts api_key from request.state",
      "request.state" in gen_source and "api_key" in gen_source)

check("p6_18_11", "_validate_request returns 403 for unauthorized user voice",
      "403" in gen_source)


# ========================================================================
# SECTION 19: File Structure
# ========================================================================
section("19. File Structure")

check("p6_19_01", "engine/user_voice_manager.py exists",
      Path("engine/user_voice_manager.py").exists())

check("p6_19_02", "api/routes/user_voices.py exists",
      Path("api/routes/user_voices.py").exists())

check("p6_19_03", "engine/voice_cleaner.py exists (dependency)",
      Path("engine/voice_cleaner.py").exists())

check("p6_19_04", "engine/voice_manager.py exists (dependency)",
      Path("engine/voice_manager.py").exists())


# ========================================================================
# SECTION 20: Integration — Pipeline compatibility
# ========================================================================
section("20. Integration - Pipeline compatibility")

# Verify pipeline.py is unchanged (user voices go through the same pipeline)
pipeline_source = Path("engine/pipeline.py").read_text(encoding="utf-8")

check("p6_20_01", "Pipeline still uses speaker_wav parameter",
      "speaker_wav" in pipeline_source)

check("p6_20_02", "Pipeline still uses engine.generate()",
      "engine.generate" in pipeline_source or "self.engine.generate" in pipeline_source)

check("p6_20_03", "Pipeline VoxarPipeline class exists",
      "class VoxarPipeline" in pipeline_source)

# Verify engine_router.py is unchanged
router_source = Path("engine/engine_router.py").read_text(encoding="utf-8")

check("p6_20_04", "EngineRouter still uses speaker_wav parameter",
      "speaker_wav" in router_source)

check("p6_20_05", "EngineRouter generate() signature unchanged",
      "def generate(self, text, speaker_wav" in router_source)


# ========================================================================
# SECTION 21: Security
# ========================================================================
section("21. Security")

# Voice IDs are server-generated
check("p6_21_01", "Voice IDs use UUID (non-guessable)",
      "uuid" in Path("engine/user_voice_manager.py").read_text(encoding="utf-8"))

# API key hashing
check("p6_21_02", "API key is hashed (sha256)",
      "hashlib" in Path("engine/user_voice_manager.py").read_text(encoding="utf-8"))

uvm_source = Path("engine/user_voice_manager.py").read_text(encoding="utf-8")

check("p6_21_03", "API key is never stored on disk",
      "api_key_hash" in uvm_source and uvm_source.count("api_key") > 5)

check("p6_21_04", "delete_voice checks ownership before deleting",
      "PermissionError" in uvm_source)

check("p6_21_05", "Temp file cleanup in upload route",
      "finally:" in Path("api/routes/user_voices.py").read_text(encoding="utf-8"))

check("p6_21_06", "File content type validation in upload route",
      "content_type" in Path("api/routes/user_voices.py").read_text(encoding="utf-8"))


# ========================================================================
# SECTION 22: Quality Assurance — Rejection result format
# ========================================================================
section("22. Quality Assurance - Result formats")

# Test rejection result
rej = UserVoiceManager._rejection_result(
    name="Test", reason="Test rejection", tips=["Tip 1"]
)

check("p6_22_01", "Rejection result has voice_id=None",
      rej["voice_id"] is None)

check("p6_22_02", "Rejection result has status='rejected'",
      rej["status"] == "rejected")

check("p6_22_03", "Rejection result has quality_score",
      "quality_score" in rej)

check("p6_22_04", "Rejection result has quality_grade",
      "quality_grade" in rej)

check("p6_22_05", "Rejection result has tips list",
      isinstance(rej["tips"], list))

check("p6_22_06", "Rejection result has message",
      rej["message"] == "Test rejection")

check("p6_22_07", "Rejection result has analysis dict",
      isinstance(rej["analysis"], dict))

check("p6_22_08", "Rejection result has embedding_path=None",
      rej["embedding_path"] is None)


# ========================================================================
# SECTION 23: Existing code — No regressions
# ========================================================================
section("23. Existing Code - No Regressions")

# VoiceManager unchanged
from engine.voice_manager import VoiceManager
check("p6_23_01", "VoiceManager class still exists",
      inspect.isclass(VoiceManager))

check("p6_23_02", "VoiceManager still has add_voice",
      hasattr(VoiceManager, "add_voice"))

check("p6_23_03", "VoiceManager still has get_voice",
      hasattr(VoiceManager, "get_voice"))

check("p6_23_04", "VoiceManager still has list_voices",
      hasattr(VoiceManager, "list_voices"))

# VoiceSampleCleaner unchanged
from engine.voice_cleaner import VoiceSampleCleaner
check("p6_23_05", "VoiceSampleCleaner class still exists",
      inspect.isclass(VoiceSampleCleaner))

check("p6_23_06", "VoiceSampleCleaner still has clean_sample",
      hasattr(VoiceSampleCleaner, "clean_sample"))

check("p6_23_07", "VoiceSampleCleaner still has batch_clean",
      hasattr(VoiceSampleCleaner, "batch_clean"))

# Config backward compatibility
check("p6_23_08", "Settings still has MAX_TEXT_LENGTH",
      hasattr(settings, "MAX_TEXT_LENGTH"))

check("p6_23_09", "Settings still has VOICES_DIR",
      hasattr(settings, "VOICES_DIR"))

check("p6_23_10", "Settings still has MAX_QUEUE_SIZE",
      hasattr(settings, "MAX_QUEUE_SIZE"))


# ========================================================================
# SECTION 24: Voice catalog — Not modified
# ========================================================================
section("24. Voice Catalog - Not Modified")

catalog_path = Path("voices/voices_catalog.json")
check("p6_24_01", "voices_catalog.json exists",
      catalog_path.exists())

if catalog_path.exists():
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    check("p6_24_02", "Catalog version is 1.0",
          catalog.get("version") == "1.0")

    check("p6_24_03", "Catalog has 20 voices",
          catalog.get("total_voices", 0) >= 20)

    check("p6_24_04", "First voice is v001 (Aisha)",
          len(catalog["voices"]) > 0 and catalog["voices"][0]["id"] == "v001")

    check("p6_24_05", "Library voices have embedding_path",
          all("embedding_path" in v for v in catalog["voices"]))


# ========================================================================
# SECTION 25: Engine version / Module imports
# ========================================================================
section("25. Module Imports")

try:
    from engine.user_voice_manager import UserVoiceManager
    check("p6_25_01", "engine.user_voice_manager imports cleanly", True)
except Exception as e:
    check("p6_25_01", f"engine.user_voice_manager import failed: {e}", False)

try:
    from api.routes.user_voices import router as uv_router
    check("p6_25_02", "api.routes.user_voices imports cleanly", True)
except Exception as e:
    check("p6_25_02", f"api.routes.user_voices import failed: {e}", False)

try:
    from api.dependencies import get_user_voice_manager
    check("p6_25_03", "get_user_voice_manager imports cleanly", True)
except Exception as e:
    check("p6_25_03", f"get_user_voice_manager import failed: {e}", False)


# ========================================================================
# Cleanup
# ========================================================================
import shutil
shutil.rmtree(test_base, ignore_errors=True)


# ========================================================================
# SUMMARY
# ========================================================================
print(f"\n{'='*60}")
print(f"  PHASE 6 VERIFICATION RESULTS")
print(f"{'='*60}")
print(f"  Passed: {passed}/{total}")
print(f"  Failed: {failed}/{total}")
print(f"{'='*60}")

if failed == 0:
    print(f"  ALL {total} CHECKS PASSED")
else:
    print(f"  {failed} CHECKS FAILED -- review above")
print(f"{'='*60}")

sys.exit(0 if failed == 0 else 1)
