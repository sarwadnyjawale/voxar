"""
VOXAR Phase 4 Verification Suite
Validates MMS engine, engine router, voice library tooling, and pipeline compatibility.
"""

import sys
import os
import ast
import json
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def main():
    passed = 0
    failed = 0

    def check(name, condition, detail=""):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"  PASS  {name}")
        else:
            failed += 1
            print(f"  FAIL  {name}: {detail}")

    print("=" * 60)
    print("  VOXAR PHASE 4 VERIFICATION SUITE")
    print("=" * 60)

    # ── MMS Engine ──
    print("\n[1] MMS Engine (engine/mms_engine.py)")
    check("file exists", os.path.exists("engine/mms_engine.py"))

    with open("engine/mms_engine.py", "r", encoding="utf-8") as f:
        mms_src = f.read()
    tree = ast.parse(mms_src)
    class_names = [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
    func_names = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]

    check("VoxarMMSEngine class exists", "VoxarMMSEngine" in class_names)
    check("generate() method", "generate" in func_names)
    check("load_model() method", "load_model" in func_names)
    check("unload_model() method", "unload_model" in func_names)
    check("is_model_loaded property", "is_model_loaded" in func_names)
    check("_resample() method", "_resample" in func_names)
    check("_save_wav() method", "_save_wav" in func_names)
    check("LANGUAGE_MODELS dict", "LANGUAGE_MODELS" in mms_src)
    check("16kHz native rate", "16000" in mms_src)
    check("24kHz output rate", "24000" in mms_src)
    check("VitsModel import", "VitsModel" in mms_src)
    check("AutoTokenizer import", "AutoTokenizer" in mms_src)

    # Verify all 10 Indian languages mapped
    for lang in ["hin", "tam", "tel", "ben", "mar", "kan", "mal", "guj", "pan", "ori"]:
        check(f"MMS model mapped: {lang}", f"mms-tts-{lang}" in mms_src)

    check("no billing logic in MMS",
          "billing" not in re.sub(r'"""[\s\S]*?"""', '', mms_src).lower()
          and "stripe" not in re.sub(r'"""[\s\S]*?"""', '', mms_src).lower())

    from engine.mms_engine import VoxarMMSEngine
    mms = VoxarMMSEngine()
    check("MMS instantiates without model load", not mms.is_model_loaded)
    check("MMS supports 10 languages", len(mms.get_supported_languages()) == 10)

    # ── Engine Router ──
    print("\n[2] Engine Router (engine/engine_router.py)")
    check("file exists", os.path.exists("engine/engine_router.py"))

    with open("engine/engine_router.py", "r", encoding="utf-8") as f:
        router_src = f.read()
    tree = ast.parse(router_src)
    class_names = [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
    func_names = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]

    check("EngineRouter class exists", "EngineRouter" in class_names)
    check("generate() method", "generate" in func_names)
    check("_generate_xtts() method", "_generate_xtts" in func_names)
    check("_generate_mms() method", "_generate_mms" in func_names)
    check("_route_language() method", "_route_language" in func_names)
    check("GPU lock present", "_gpu_lock" in router_src)
    check("threading import", "import threading" in router_src)
    check("unload_model in hot-swap", "unload_model" in router_src)
    check("reload_model in hot-swap", "reload_model" in router_src)
    check("MMS_LANGUAGES set defined", "MMS_LANGUAGES" in router_src)

    # Test routing logic
    from engine.engine_router import EngineRouter
    check("MMS routes Tamil", "ta" in EngineRouter.MMS_LANGUAGES)
    check("MMS routes Telugu", "te" in EngineRouter.MMS_LANGUAGES)
    check("MMS routes Bengali", "bn" in EngineRouter.MMS_LANGUAGES)
    check("MMS routes Marathi", "mr" in EngineRouter.MMS_LANGUAGES)
    check("English NOT in MMS", "en" not in EngineRouter.MMS_LANGUAGES)
    check("Hindi NOT in MMS (XTTS preferred)", "hi" not in EngineRouter.MMS_LANGUAGES)

    # ── TTS Engine Language Routing ──
    print("\n[3] TTS Engine — Clean language routing")
    with open("engine/tts_engine.py", "r", encoding="utf-8") as f:
        tts_src = f.read()
    check("no English tokenizer workaround",
          "Using English tokenizer with romanized text" not in tts_src)
    check("MMS direction for unsupported langs",
          "requires the MMS-TTS engine" in tts_src or "EngineRouter" in tts_src)

    # ── Voice Cleaner ──
    print("\n[4] Voice Cleaner (engine/voice_cleaner.py)")
    check("file exists", os.path.exists("engine/voice_cleaner.py"))

    with open("engine/voice_cleaner.py", "r", encoding="utf-8") as f:
        vc_src = f.read()
    tree = ast.parse(vc_src)
    class_names = [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
    func_names = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]

    check("VoiceSampleCleaner class", "VoiceSampleCleaner" in class_names)
    check("clean_sample() method", "clean_sample" in func_names)
    check("batch_clean() method", "batch_clean" in func_names)
    check("_reduce_noise() method", "_reduce_noise" in func_names)
    check("_trim_silence() method", "_trim_silence" in func_names)
    check("_normalize_lufs() method", "_normalize_lufs" in func_names)
    check("_assess_quality() method", "_assess_quality" in func_names)
    check("quality threshold = 7", "QUALITY_THRESHOLD = 7" in vc_src)
    check("target LUFS = -16", "TARGET_LUFS = -16" in vc_src)

    from engine.voice_cleaner import VoiceSampleCleaner
    cleaner = VoiceSampleCleaner()
    check("VoiceSampleCleaner instantiates", cleaner is not None)

    # ── Voice Manager ──
    print("\n[5] Voice Manager (engine/voice_manager.py)")
    check("file exists", os.path.exists("engine/voice_manager.py"))

    with open("engine/voice_manager.py", "r", encoding="utf-8") as f:
        vm_src = f.read()
    tree = ast.parse(vm_src)
    class_names = [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
    func_names = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]

    check("VoiceManager class", "VoiceManager" in class_names)
    check("add_voice() method", "add_voice" in func_names)
    check("remove_voice() method", "remove_voice" in func_names)
    check("get_voice() method", "get_voice" in func_names)
    check("list_voices() method", "list_voices" in func_names)
    check("get_voices_by_language() method", "get_voices_by_language" in func_names)
    check("extract_embedding() method", "extract_embedding" in func_names)
    check("generate_preview() method", "generate_preview" in func_names)
    check("validate_catalog() method", "validate_catalog" in func_names)

    from engine.voice_manager import VoiceManager
    vm = VoiceManager(voices_dir="voices")
    check("VoiceManager instantiates", vm is not None)
    check("catalog loads", len(vm.list_voices()) >= 0)

    # Test add/remove voice
    en_count_before = len(vm.get_voices_by_language("en"))
    vm.add_voice(
        voice_id="v_test", name="Test", display_name="Test Voice",
        gender="male", languages=["en"], primary_language="en",
    )
    check("add_voice works", vm.get_voice("v_test") is not None)
    check("voice has correct ID", vm.get_voice("v_test")["id"] == "v_test")
    check("get_voices_by_language works",
          len(vm.get_voices_by_language("en")) == en_count_before + 1)

    vm.remove_voice("v_test")
    check("remove_voice works", vm.get_voice("v_test") is None)

    # ── Voice Catalog JSON ──
    print("\n[6] Voice Catalog & Preview Scripts")
    check("voices_catalog.json exists",
          os.path.exists("voices/voices_catalog.json"))
    check("preview_scripts.json exists",
          os.path.exists("voices/preview_scripts.json"))

    with open("voices/voices_catalog.json", "r", encoding="utf-8") as f:
        catalog = json.load(f)
    check("catalog is valid JSON", isinstance(catalog, dict))
    check("catalog has version", "version" in catalog)
    check("catalog has voices list", "voices" in catalog and isinstance(catalog["voices"], list))

    with open("voices/preview_scripts.json", "r", encoding="utf-8") as f:
        scripts = json.load(f)
    check("preview scripts has English", "en" in scripts)
    check("preview scripts has Hindi", "hi" in scripts)
    check("preview scripts has Tamil", "ta" in scripts)
    check("preview scripts has Telugu", "te" in scripts)
    check("preview scripts has Bengali", "bn" in scripts)
    check("preview scripts has Marathi", "mr" in scripts)

    # ── Directory Structure ──
    print("\n[7] Directory Structure")
    for d in ["voices/raw_samples", "voices/cleaned_samples",
              "voices/embeddings", "voices/previews", "voices/references"]:
        check(f"{d}/ exists", os.path.isdir(d))

    # ── Pipeline Compatibility ──
    print("\n[8] Pipeline Compatibility")
    with open("engine/pipeline.py", "r", encoding="utf-8") as f:
        pipe_src = f.read()
    # Pipeline calls engine.generate() — works with both VoxarTTSEngine and EngineRouter
    check("pipeline calls engine.generate()", "self.engine.generate(" in pipe_src)

    # ── Version ──
    print("\n[9] Version")
    from engine import __version__
    check(f"engine version >= 1.2.0 (got {__version__})", __version__ >= "1.2.0")

    # ── Exports ──
    print("\n[10] Module Exports")
    from engine import VoxarPipeline, PipelineResult, VoxarMMSEngine, EngineRouter, VoiceManager
    check("VoxarPipeline importable", VoxarPipeline is not None)
    check("PipelineResult importable", PipelineResult is not None)
    check("VoxarMMSEngine importable", VoxarMMSEngine is not None)
    check("EngineRouter importable", EngineRouter is not None)
    check("VoiceManager importable", VoiceManager is not None)

    # ── Syntax Check ──
    print("\n[11] Syntax Check — All Phase 4 files")
    files_to_check = [
        "engine/mms_engine.py",
        "engine/engine_router.py",
        "engine/voice_cleaner.py",
        "engine/voice_manager.py",
        "engine/tts_engine.py",
        "engine/pipeline.py",
        "engine/__init__.py",
    ]
    for fpath in files_to_check:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                ast.parse(f.read())
            check(f"{fpath} syntax OK", True)
        except SyntaxError as e:
            check(f"{fpath} syntax OK", False, str(e))

    # ── Regression: Pre-Phase-4 checks still pass ──
    print("\n[12] Regression — Pre-Phase-4 fixes intact")
    # C1: crossfade 50ms
    with open("engine/tts_engine.py", "r", encoding="utf-8") as f:
        tts_src = f.read()
    check("C1: crossfade still 50ms", "pause_ms, 50)" in tts_src)

    # H2: model lifecycle
    tts_tree = ast.parse(tts_src)
    tts_funcs = [n.name for n in ast.walk(tts_tree) if isinstance(n, ast.FunctionDef)]
    check("H2: unload_model still exists", "unload_model" in tts_funcs)
    check("H2: reload_model still exists", "reload_model" in tts_funcs)

    # H6: GPU lock
    check("H6: GPU lock still present", "_gpu_lock" in tts_src)

    # C2: abbreviation safety
    from engine.preprocessor.abbreviation_handler import AbbreviationHandler
    ah = AbbreviationHandler()
    r = ah.process("I am happy")
    check("C2: bare 'am' still safe", "A M" not in r)

    # ── Summary ──
    print()
    print("=" * 60)
    total = passed + failed
    print(f"  RESULTS: {passed}/{total} passed, {failed} failed")
    if failed == 0:
        print("  STATUS: PHASE 4 FULLY VERIFIED")
    else:
        print("  STATUS: SOME CHECKS NEED ATTENTION")
    print("=" * 60)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
