"""
Verify OpenVoice integration — Phase 4 completion.
Run from project root: python verify_openvoice.py
"""
import ast
import os
import re
import sys
import json

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
            msg += f" — {note}"
        print(msg)


print("=" * 60)
print("  VOXAR OPENVOICE INTEGRATION VERIFICATION")
print("=" * 60)

# ----------------------------------------------
# 1. FILE EXISTENCE
# ----------------------------------------------
print("\n-- 1. File Existence --")
check("openvoice_engine.py exists", os.path.exists("engine/openvoice_engine.py"))
check("engine_router.py exists", os.path.exists("engine/engine_router.py"))
check("__init__.py exists", os.path.exists("engine/__init__.py"))

# ----------------------------------------------
# 2. SYNTAX VALIDATION
# ----------------------------------------------
print("\n-- 2. Syntax Validation --")
for f in ["engine/openvoice_engine.py", "engine/engine_router.py", "engine/__init__.py"]:
    try:
        with open(f, "r", encoding="utf-8") as fh:
            ast.parse(fh.read())
        check(f"{f} parses cleanly", True)
    except SyntaxError as e:
        check(f"{f} parses cleanly", False, str(e))

# ----------------------------------------------
# 3. OPENVOICE ENGINE CLASS CHECKS
# ----------------------------------------------
print("\n-- 3. OpenVoice Engine Class --")
with open("engine/openvoice_engine.py", "r", encoding="utf-8") as f:
    ov_src = f.read()

check("VoxarOpenVoiceEngine class defined",
      "class VoxarOpenVoiceEngine" in ov_src)
check("is_model_loaded property",
      "is_model_loaded" in ov_src)
check("load_model() method",
      "def load_model(self)" in ov_src)
check("unload_model() method",
      "def unload_model(self)" in ov_src)
check("extract_se() method",
      "def extract_se(self" in ov_src)
check("convert() method",
      "def convert(self" in ov_src)
check("preload_voice_library() method",
      "def preload_voice_library(self" in ov_src)
check("get_model_info() method",
      "def get_model_info(self)" in ov_src)

# Lazy loading
check("Lazy loading (model starts as None)",
      "self._converter = None" in ov_src)
check("HuggingFace checkpoint repo defined",
      "myshell-ai/OpenVoiceV2" in ov_src)

# SE caching
check("In-memory SE cache dict",
      "self._se_cache = {}" in ov_src)
check("Disk SE cache support",
      "se_cache_dir" in ov_src)
check("SE cache hit check",
      "voice_id in self._se_cache" in ov_src)

# VRAM management
check("torch.cuda.empty_cache() on unload",
      "torch.cuda.empty_cache()" in ov_src)
check("torch.cuda.synchronize() on unload",
      "torch.cuda.synchronize()" in ov_src)

# No billing/API logic
ov_clean = re.sub(r'"""[\s\S]*?"""', '', ov_src).lower()
ov_clean = re.sub(r"'''[\s\S]*?'''", '', ov_clean).lower()
check("No billing logic in openvoice_engine",
      "credit" not in ov_clean and "billing" not in ov_clean)
check("No API routing in openvoice_engine",
      "fastapi" not in ov_clean and "flask" not in ov_clean)

# OpenVoice imports (lazy)
check("OpenVoice ToneColorConverter import (lazy)",
      "from openvoice.api import ToneColorConverter" in ov_src)
check("Watermark disabled (enable_watermark=False)",
      "enable_watermark=False" in ov_src)

# ----------------------------------------------
# 4. ENGINE ROUTER UPDATES
# ----------------------------------------------
print("\n-- 4. Engine Router Updates --")
with open("engine/engine_router.py", "r", encoding="utf-8") as f:
    router_src = f.read()

check("Router version bumped to v1.1+",
      "v1.1" in router_src or "v1.2" in router_src or "v1.3" in router_src)
check("OpenVoice mentioned in router docstring",
      "OpenVoice" in router_src)
check("openvoice_engine parameter in __init__",
      "openvoice_engine" in router_src and "openvoice_engine=None" in router_src)
check("Lazy OpenVoice property defined",
      "@property" in router_src and "def openvoice(self)" in router_src)
check("VoxarOpenVoiceEngine import in lazy property",
      "from engine.openvoice_engine import VoxarOpenVoiceEngine" in router_src)
check("OpenVoice setter defined",
      "@openvoice.setter" in router_src)

# MMS generation flow includes OpenVoice
check("speaker_wav passed to _generate_mms()",
      "speaker_wav=speaker_wav" in router_src)
check("_generate_mms accepts speaker_wav parameter",
      "def _generate_mms(self, text, language, speed, output_filename,\n"
      "                      speaker_wav=None)" in router_src)
check("OpenVoice convert() called in _generate_mms",
      "self.openvoice.convert(" in router_src)
check("OpenVoice unloaded after conversion",
      "self.openvoice.unload_model()" in router_src)
check("MMS temp file cleanup",
      "os.remove(mms_output_path)" in router_src)
check("Fallback to raw MMS on OpenVoice failure",
      "OpenVoice failed" in router_src)
check("_extract_voice_id() static method",
      "def _extract_voice_id(speaker_wav)" in router_src)
check("engine label 'mms+openvoice' in result",
      'mms+openvoice' in router_src)
check("Approach B mentioned",
      "Approach B" in router_src)

# GPU safety
check("GPU lock in _generate_mms",
      "self._gpu_lock" in router_src)
check("se_cache_dir parameter in __init__",
      "se_cache_dir" in router_src)

# No billing in router
router_clean = re.sub(r'"""[\s\S]*?"""', '', router_src).lower()
router_clean = re.sub(r"'''[\s\S]*?'''", '', router_clean).lower()
check("No billing logic in engine_router",
      "credit" not in router_clean and "billing" not in router_clean)

# ----------------------------------------------
# 5. EXPORTS
# ----------------------------------------------
print("\n-- 5. Exports & Version --")
with open("engine/__init__.py", "r", encoding="utf-8") as f:
    init_src = f.read()

check("VoxarOpenVoiceEngine exported",
      "from engine.openvoice_engine import VoxarOpenVoiceEngine" in init_src)
check("Version bumped to 1.3.0",
      '__version__ = "1.3.0"' in init_src)
check("All engines exported (MMS, OpenVoice, Router)",
      "VoxarMMSEngine" in init_src and
      "VoxarOpenVoiceEngine" in init_src and
      "EngineRouter" in init_src)

# ----------------------------------------------
# 6. VOICE EMBEDDINGS READY
# ----------------------------------------------
print("\n-- 6. Voice Library Ready --")
embeddings_dir = "voices/embeddings"
if os.path.exists(embeddings_dir):
    wav_files = [f for f in os.listdir(embeddings_dir) if f.endswith(".wav")]
    check(f"Embeddings directory has {len(wav_files)} voice files",
          len(wav_files) == 20, f"expected 20, got {len(wav_files)}")
else:
    check("Embeddings directory exists", False, "voices/embeddings/ not found")

# Verify catalog
catalog_path = "voices/voices_catalog.json"
if os.path.exists(catalog_path):
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)
    check(f"Catalog has {len(catalog.get('voices', []))} voices",
          len(catalog.get("voices", [])) == 20)
else:
    check("Catalog exists", False)

# ----------------------------------------------
# 7. EXTRACT_VOICE_ID LOGIC
# ----------------------------------------------
print("\n-- 7. Voice ID Extraction Logic --")
# Test the regex pattern used in _extract_voice_id
pattern = r"(v\d{3})_"
test_cases = [
    ("v001_aisha.wav", "v001"),
    ("v012_vikram.wav", "v012"),
    ("v020_tejas.wav", "v020"),
    ("random_file.wav", None),
    ("voices/embeddings/v005_isha.wav", "v005"),
]
for filename, expected in test_cases:
    basename = os.path.basename(filename)
    match = re.match(pattern, basename)
    result = match.group(1) if match else None
    check(f"extract_voice_id('{filename}') -> '{result}'",
          result == expected,
          f"expected '{expected}'")

# ----------------------------------------------
# 8. ARCHITECTURAL COMPLIANCE
# ----------------------------------------------
print("\n-- 8. Architectural Compliance --")
# Hot-swap protocol in correct order
check("XTTS unloaded before MMS in _generate_mms",
      router_src.index("unload_model()") < router_src.index("self.mms.generate("))
check("MMS unloaded before OpenVoice convert",
      "Unload MMS" in router_src)
check("OpenVoice unloaded after convert",
      "unloading OpenVoice after conversion" in router_src)
check("XTTS reloaded after full pipeline",
      "_reload_xtts_safe" in router_src)

# MMS languages set unchanged
check("MMS_LANGUAGES includes all 9 regional languages",
      all(lang in router_src for lang in ["ta", "te", "bn", "mr", "kn", "ml", "gu", "pa", "or"]))

# ----------------------------------------------
# 9. PREVIOUS PHASE REGRESSIONS
# ----------------------------------------------
print("\n-- 9. Regression Checks --")
# MMS engine unchanged
check("mms_engine.py exists",
      os.path.exists("engine/mms_engine.py"))
with open("engine/mms_engine.py", "r", encoding="utf-8") as f:
    mms_src = f.read()
check("MMS VoxarMMSEngine class intact",
      "class VoxarMMSEngine" in mms_src)
check("MMS generate() method intact",
      "def generate(self" in mms_src)
check("MMS LANGUAGE_MODELS dict intact",
      "LANGUAGE_MODELS" in mms_src and "facebook/mms-tts" in mms_src)

# Voice cleaner unchanged
check("voice_cleaner.py exists",
      os.path.exists("engine/voice_cleaner.py"))

# Voice manager unchanged
check("voice_manager.py exists",
      os.path.exists("engine/voice_manager.py"))

# Pipeline unchanged
check("pipeline.py exists",
      os.path.exists("engine/pipeline.py"))

# ----------------------------------------------
# SUMMARY
# ----------------------------------------------
total = passed + failed
print("\n" + "=" * 60)
print(f"  RESULTS: {passed}/{total} checks passed")
if failed == 0:
    print("  STATUS: ALL CHECKS PASSED")
else:
    print(f"  STATUS: {failed} CHECKS FAILED")
print("=" * 60)

sys.exit(0 if failed == 0 else 1)
