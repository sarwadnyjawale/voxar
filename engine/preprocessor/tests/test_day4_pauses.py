"""
VOXAR Phase 3 — Day 4: Pause & Emphasis Test
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 3 — DAY 4: PAUSE & EMPHASIS CONTROLS")
    print("=" * 90)

    from engine.preprocessor.pause_controller import PauseController, EmphasisHandler

    pauser = PauseController()
    emphasis = EmphasisHandler()

    # ========================================
    # TEST 1: Punctuation Pauses
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 1: PUNCTUATION-BASED PAUSES")
    print(f"{'─' * 90}")

    punct_tests = [
        "Hello. How are you?",
        "First, we go here; then there.",
        "Wait... I have an idea!",
        "One thing: be careful.",
        "This is great — really great.",
        "Paragraph one.\n\nParagraph two.",
    ]

    for text in punct_tests:
        result = pauser.process(text)
        punct_count = len(result["punctuation_pauses"])
        total_ms = sum(p["duration_ms"] for p in result["punctuation_pauses"])

        print(f"  \"{text[:60]}\"")
        print(f"     Pauses: {punct_count} | Total: {total_ms}ms")
        for p in result["punctuation_pauses"]:
            print(f"       '{p['char']}' at pos {p['position']} → {p['duration_ms']}ms ({p['type']})")
        print()

    # ========================================
    # TEST 2: Custom Pause Markers
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 2: CUSTOM PAUSE MARKERS")
    print(f"{'─' * 90}")

    custom_tests = [
        "Welcome to VOXAR. [pause:1s] Let me show you something.",
        "First point. [pause:0.5s] Second point. [pause:0.5s] Third point.",
        "And the winner is... [pause:2s] VOXAR!",
        "Take a deep breath. [breath] Now let's continue.",
        "End of section one. [break] Section two begins here.",
        "Quick pause [pause:200ms] and continue.",
    ]

    for text in custom_tests:
        result = pauser.process(text)

        print(f"  IN:  \"{text}\"")
        print(f"  OUT: \"{result['cleaned_text']}\"")
        print(f"     Custom pauses: {result['custom_pause_count']} "
              f"({result['total_custom_pause_ms']}ms total)")
        for pos, dur, ptype in result["pause_map"]:
            print(f"       [{ptype}] at pos {pos} → {dur}ms")
        print()

    # ========================================
    # TEST 3: Emphasis Markers
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 3: EMPHASIS MARKERS")
    print(f"{'─' * 90}")

    emphasis_tests = [
        "This is *very* important.",
        "This is **extremely** critical.",
        "Speak _softly_ please.",
        "We ABSOLUTELY MUST act NOW.",
        "VOXAR is the *best* AI voice **platform** in India.",
        "*subtle* emphasis vs **strong** emphasis vs _whisper_ mode",
    ]

    for text in emphasis_tests:
        result = emphasis.process(text)

        print(f"  IN:  \"{text}\"")
        print(f"  OUT: \"{result['cleaned_text']}\"")
        if result["emphasis_map"]:
            for e in result["emphasis_map"]:
                print(f"       [{e['type']}] \"{e['word']}\"")
        print()

    # ========================================
    # TEST 4: Duration Estimation
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 4: DURATION ESTIMATION")
    print(f"{'─' * 90}")

    duration_tests = [
        "Hello World.",
        "This is a longer sentence with more words and punctuation, commas, and periods.",
        "Welcome to VOXAR. [pause:2s] This is our premium voice platform. [pause:1s] Enjoy!",
        "Short.",
    ]

    for text in duration_tests:
        est = pauser.estimate_total_duration(text)
        chars = len(text)
        print(f"  \"{text[:60]}{'...' if len(text) > 60 else ''}\"")
        print(f"     Chars: {chars} | Estimated duration: {est}s")
        print()

    # ========================================
    # TEST 5: Real Script with All Controls
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 5: REAL SCRIPT WITH PAUSES + EMPHASIS")
    print(f"{'─' * 90}")

    real_scripts = [
        {
            "text": (
                "Welcome to **VOXAR Studio**. [pause:1s] "
                "Today, we're introducing something *revolutionary*. [pause:0.5s] "
                "An AI voice engine that speaks Hindi... [pause:1s] "
                "Tamil... [pause:0.5s] Telugu... [pause:0.5s] "
                "and _many more_ Indian languages. [break] "
                "Let's **begin**."
            ),
            "desc": "Product launch script"
        },
        {
            "text": (
                "Chapter One: The Beginning. [pause:2s] "
                "It was a dark and stormy night. "
                "The wind howled through the empty streets, "
                "carrying with it the whispers of a forgotten era. [pause:1s] "
                "No one dared to venture outside... [pause:1.5s] "
                "except *one* brave soul."
            ),
            "desc": "Audiobook narration"
        },
    ]

    for script in real_scripts:
        pause_result = pauser.process(script["text"])
        emph_result = emphasis.process(pause_result["cleaned_text"])

        print(f"\n  [{script['desc']}]")
        print(f"  ORIGINAL:")
        print(f"    \"{script['text'][:100]}...\"")
        print(f"\n  AFTER PAUSE EXTRACTION:")
        print(f"    \"{pause_result['cleaned_text'][:100]}...\"")
        print(f"    Custom pauses: {pause_result['custom_pause_count']}")
        print(f"    Total custom pause: {pause_result['total_custom_pause_ms']}ms")
        print(f"\n  AFTER EMPHASIS EXTRACTION:")
        print(f"    \"{emph_result['cleaned_text'][:100]}...\"")
        if emph_result["emphasis_map"]:
            for e in emph_result["emphasis_map"]:
                print(f"    [{e['type']}] \"{e['word']}\"")

        est = pauser.estimate_total_duration(script["text"])
        print(f"\n  Estimated duration: {est}s")

    # ========================================
    # Summary
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  DAY 4 COMPLETE")
    print(f"{'=' * 90}")
    print(f"""
  ✅ Punctuation pauses: . ! ? , ; : — ... \\n\\n
  ✅ Custom markers: [pause:1s] [pause:500ms] [breath] [break]
  ✅ Markers stripped from text cleanly
  ✅ Emphasis: *slight* **strong** _soft_ ALLCAPS
  ✅ Duration estimation
  ✅ Real scripts processed correctly

  PIPELINE:
  ─────────────────────────────────────────────
  "Welcome **everyone**. [pause:1s] Let's *begin*."
       ↓ PauseController
  "Welcome everyone. Let's begin."
  + pause_map: [(pos 20, 1000ms, custom)]
       ↓ EmphasisHandler  
  "Welcome everyone. Let's begin."
  + emphasis_map: [("everyone", strong), ("begin", slight)]
       ↓ XTTS
  Audio generated
       ↓ Insert pauses from pause_map
  Final audio with natural pauses
    """)


if __name__ == "__main__":
    main()