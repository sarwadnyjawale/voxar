"""
VOXAR Phase 2 — Day 1: Raw Audio Analysis
Analyzes all Phase 1 output files to identify problems.
"""
import numpy as np
import sys
import os
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 2 — DAY 1: RAW AUDIO ANALYSIS")
    print("  Analyzing all Phase 1 outputs to identify problems")
    print("=" * 90)

    output_dir = os.path.join(PROJECT_ROOT, "output")
    if not os.path.exists(output_dir):
        print("  ERROR: output/ directory not found!")
        print("  Run Phase 1 tests first to generate audio files.")
        return

    # Count files
    wav_files = [f for f in os.listdir(output_dir)
                 if f.endswith('.wav') and not f.startswith('_')]
    print(f"\n  Found {len(wav_files)} audio files in output/")

    if not wav_files:
        print("  ERROR: No .wav files found. Run Phase 1 tests first.")
        return

    # List files
    print(f"\n  Files to analyze:")
    for f in sorted(wav_files):
        size_kb = os.path.getsize(os.path.join(output_dir, f)) / 1024
        print(f"    {f} ({size_kb:.0f} KB)")

    # ========================================
    # Run analysis
    # ========================================
    print(f"\n  Starting analysis...")
    print(f"  (This is CPU-only, no GPU needed)\n")

    from engine.audio_processor import VoxarAudioAnalyzer
    analyzer = VoxarAudioAnalyzer()

    results = analyzer.analyze_batch(output_dir)

    # ========================================
    # Print report
    # ========================================
    analyzer.print_report(results)

    # ========================================
    # Save reports
    # ========================================
    # Markdown report
    md_path = analyzer.save_report_md(results, "docs/audio_problems_report.md")
    print(f"  Markdown report saved: {md_path}")

    # JSON data (for reference)
    os.makedirs("docs", exist_ok=True)
    json_path = "docs/audio_analysis_data.json"

    json_results = []
    for r in results:
        jr = dict(r)
        # Convert problem tuples to dicts for JSON
            # JSON data (for reference)
    os.makedirs("docs", exist_ok=True)
    json_path = "docs/audio_analysis_data.json"

    json_results = []
    for r in results:
        jr = {}
        for key, value in r.items():
            if key == 'problems':
                jr['problems'] = [
                    {"type": p[0], "severity": int(p[1]), "description": p[2]}
                    for p in value
                ]
            elif isinstance(value, (np.integer,)):
                jr[key] = int(value)
            elif isinstance(value, (np.floating,)):
                jr[key] = float(value)
            elif isinstance(value, (np.bool_,)):
                jr[key] = bool(value)
            else:
                jr[key] = value
        json_results.append(jr)

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(json_results, f, indent=2, ensure_ascii=False)
    print(f"  JSON data saved: {json_path}")
    valid = [r for r in results if 'error' not in r]
    if valid:
        worst = sorted(valid, key=lambda x: x['score'])[:3]
        print(f"\n  WORST 3 FILES (need most processing):")
        print(f"  {'─' * 60}")
        for r in worst:
            print(f"\n    File: {r['file_name']}")
            print(f"    Score: {r['score']}/100 ({r['severity']})")
            print(f"    Duration: {r['duration_seconds']}s")
            print(f"    Loudness: {r['loudness_lufs']} LUFS")
            print(f"    Leading silence: {r['leading_silence_ms']}ms")
            print(f"    Trailing silence: {r['trailing_silence_ms']}ms")
            print(f"    Silence ratio: {r['silence_ratio']:.0%}")
            print(f"    Problems:")
            for ptype, sev, desc in r['problems']:
                print(f"      [{sev}] {desc}")

        best = sorted(valid, key=lambda x: -x['score'])[:3]
        print(f"\n  BEST 3 FILES (least processing needed):")
        print(f"  {'─' * 60}")
        for r in best:
            print(f"\n    File: {r['file_name']}")
            print(f"    Score: {r['score']}/100 ({r['severity']})")
            print(f"    Loudness: {r['loudness_lufs']} LUFS")
            if r['problems']:
                for ptype, sev, desc in r['problems']:
                    print(f"      [{sev}] {desc}")
            else:
                print(f"      No problems detected!")

    print(f"\n" + "=" * 90)
    print(f"  DAY 1 COMPLETE")
    print(f"  Now we know EXACTLY what problems to fix in Day 2-4")
    print(f"=" * 90)
    print()


if __name__ == "__main__":
    main()