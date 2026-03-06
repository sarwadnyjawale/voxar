"""
VOXAR Pre-Phase-4 Verification Suite
Validates all CRITICAL and HIGH severity fixes.
"""

import sys
import os
import ast
import re
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np


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

    print("=" * 55)
    print("  VOXAR PRE-PHASE-4 VERIFICATION SUITE")
    print("=" * 55)

    # ── C1: Crossfade 50ms ──
    print("\n[C1] Crossfade = 50ms")
    with open("engine/tts_engine.py", "r", encoding="utf-8") as f:
        tts_src = f.read()
    check("crossfade value is 50", "pause_ms, 50)" in tts_src)
    check("no 30ms crossfade remains", "pause_ms, 30)" not in tts_src)

    # ── C2: Abbreviation safety ──
    print("\n[C2] Dangerous bare-word abbreviations removed")
    from engine.preprocessor.abbreviation_handler import AbbreviationHandler
    ah = AbbreviationHandler()

    r1 = ah.process("I am happy and the min effort")
    check("bare 'am' NOT expanded", "A M" not in r1)
    check("bare 'min' NOT expanded", "minimum" not in r1)

    r2 = ah.process("The a.m. session starts early")
    check("dotted 'a.m.' still expands", "A M" in r2)

    # Full pipeline integration
    from engine.preprocessor.script_preprocessor import ScriptPreprocessor
    sp = ScriptPreprocessor(language="en")
    r3 = sp.process("I am happy at 3:30 PM today", language="en")
    check("pipeline: 'am' not destroyed", "A M" not in r3.processed_text)
    check("pipeline: 'PM' not Prime Minister",
          "Prime Minister" not in r3.processed_text)

    # ── H1: ITRANS removed ──
    print("\n[H1] ITRANS fallback removed from HinglishHandler")
    with open("engine/preprocessor/hinglish_handler.py", "r", encoding="utf-8") as f:
        hh_src = f.read()
    check("no indic_transliteration import",
          "from indic_transliteration" not in hh_src)
    check("no sanscript.ITRANS reference",
          "sanscript.ITRANS" not in hh_src)

    from engine.preprocessor.hinglish_handler import HinglishHandler
    hh = HinglishHandler()
    r4 = hh.transliterate_to_devanagari("namaste unknown_xyz hello")
    check("unknown word preserved (no ITRANS)", "unknown_xyz" in r4)

    # ── H2: Model lifecycle ──
    print("\n[H2] Model unload/reload methods added")
    with open("engine/tts_engine.py", "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
    func_names = [n.name for n in ast.walk(tree)
                  if isinstance(n, ast.FunctionDef)]
    check("unload_model() exists", "unload_model" in func_names)
    check("reload_model() exists", "reload_model" in func_names)
    check("is_model_loaded property exists", "is_model_loaded" in func_names)
    check("generate() guards on model loaded",
          "is_model_loaded" in tts_src and "not self.is_model_loaded" in tts_src)

    # ── H3: Request-scoped temp directories ──
    print("\n[H3] Request-scoped temp directories for chunks")
    check("uuid import present", "import uuid" in tts_src)
    check("shutil import present", "import shutil" in tts_src)
    check("_temp dir pattern used", '"_temp"' in tts_src)
    check("shutil.rmtree for cleanup", "shutil.rmtree" in tts_src)

    # ── H5: Thread-safety documented ──
    print("\n[H5] Thread-safety documented (false positive)")
    with open("engine/preprocessor/script_preprocessor.py", "r",
              encoding="utf-8") as f:
        sp_src = f.read()
    check("thread-safe comment present", "thread-safe" in sp_src)

    # ── H6: GPU lock ──
    print("\n[H6] GPU concurrency lock added")
    check("threading import present", "import threading" in tts_src)
    check("_gpu_lock initialized", "_gpu_lock" in tts_src)
    check("with self._gpu_lock used", "with self._gpu_lock:" in tts_src)

    # ── C4: Vectorized audio processing ──
    print("\n[C4] Compression and artifact detection vectorized")
    with open("engine/audio_processor.py", "r", encoding="utf-8") as f:
        ap_src = f.read()
    check("no sample-by-sample loop in compression",
          "for i in range(len(data))" not in ap_src)
    check("block-based RMS used", "rms_blocks" in ap_src)
    check("uniform_filter1d used for clicks", "uniform_filter1d" in ap_src)

    from engine.audio_processor import VoxarAdvancedProcessor
    proc = VoxarAdvancedProcessor()

    audio_2s = np.random.randn(48000).astype(np.float32) * 0.5
    t0 = time.time()
    _ = proc.apply_compression(audio_2s, 24000)
    ms_2s = (time.time() - t0) * 1000
    check(f"2s compression fast ({ms_2s:.0f}ms)", ms_2s < 500)

    audio_30s = np.random.randn(720000).astype(np.float32) * 0.3
    t0 = time.time()
    _ = proc.apply_compression(audio_30s, 24000)
    ms_30s = (time.time() - t0) * 1000
    check(f"30s compression fast ({ms_30s:.0f}ms)", ms_30s < 500)

    t0 = time.time()
    _ = proc.remove_artifacts(audio_2s, 24000)
    ms_art = (time.time() - t0) * 1000
    check(f"2s artifact removal completes ({ms_art:.0f}ms)", ms_art < 5000)

    # ── C3: Pipeline orchestrator ──
    print("\n[C3/H4] Pipeline orchestrator created")
    check("engine/pipeline.py exists", os.path.exists("engine/pipeline.py"))

    from engine.pipeline import VoxarPipeline, PipelineResult
    pr = PipelineResult()
    check("PipelineResult has quality_score", hasattr(pr, "quality_score"))
    check("PipelineResult has to_dict()", hasattr(pr, "to_dict"))
    check("VoxarPipeline has process()", hasattr(VoxarPipeline, "process"))
    check("VoxarPipeline has cleanup_temp_files()",
          hasattr(VoxarPipeline, "cleanup_temp_files"))

    with open("engine/pipeline.py", "r", encoding="utf-8") as f:
        pipe_src = f.read()
    # Strip docstrings and comments, then check for actual billing code
    stripped = re.sub(r'"""[\s\S]*?"""', '', pipe_src)
    stripped = re.sub(r"'''[\s\S]*?'''", '', stripped)
    stripped = re.sub(r'#.*', '', stripped)
    stripped_lower = stripped.lower()
    check("pipeline has no billing/credit logic",
          "billing" not in stripped_lower
          and "stripe" not in stripped_lower
          and "credit" not in stripped_lower
          and "charge(" not in stripped_lower)

    # ── Version ──
    print("\n[Version]")
    from engine import __version__
    check(f"engine version >= 1.1.0 (got {__version__})",
          __version__ >= "1.1.0")

    # ── Syntax check all modified files ──
    print("\n[Syntax] All modified files parse cleanly")
    files_to_check = [
        "engine/tts_engine.py",
        "engine/audio_processor.py",
        "engine/pipeline.py",
        "engine/preprocessor/abbreviation_handler.py",
        "engine/preprocessor/hinglish_handler.py",
        "engine/preprocessor/script_preprocessor.py",
        "engine/preprocessor/special_text_handler.py",
        "engine/__init__.py",
    ]
    for fpath in files_to_check:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                ast.parse(f.read())
            check(f"{fpath} syntax OK", True)
        except SyntaxError as e:
            check(f"{fpath} syntax OK", False, str(e))

    # ── Summary ──
    print()
    print("=" * 55)
    total = passed + failed
    print(f"  RESULTS: {passed}/{total} passed, {failed} failed")
    if failed == 0:
        print("  STATUS: ALL FIXES VERIFIED")
    else:
        print("  STATUS: SOME FIXES NEED ATTENTION")
    print("=" * 55)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
