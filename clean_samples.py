"""
Batch clean all raw voice samples.
Run from project root: python clean_samples.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine.voice_cleaner import VoiceSampleCleaner

def main():
    cleaner = VoiceSampleCleaner()

    print("=" * 60)
    print("  VOXAR VOICE SAMPLE BATCH CLEANING")
    print("=" * 60)

    results = cleaner.batch_clean("voices/raw_samples", "voices/cleaned_samples")

    print("\n" + "=" * 60)
    print("  RESULTS SUMMARY")
    print("=" * 60)

    accepted = []
    rejected = []

    for r in results:
        name = os.path.basename(r["input_path"])
        if r["accepted"]:
            accepted.append(r)
            print(f"  PASS  {name} — {r['duration']}s, quality={r['quality_score']}/10")
        else:
            rejected.append(r)
            issues = "; ".join(r["issues"])
            print(f"  FAIL  {name} — quality={r['quality_score']}/10 ({issues})")

    print(f"\n  Accepted: {len(accepted)}/{len(results)}")
    print(f"  Rejected: {len(rejected)}/{len(results)}")

    if len(accepted) >= 20:
        print(f"\n  We have {len(accepted)} clean samples — enough to select best 20!")
    elif len(accepted) >= 15:
        print(f"\n  We have {len(accepted)} clean samples — enough but tight.")
    else:
        print(f"\n  WARNING: Only {len(accepted)} passed — may need more samples.")

    print("=" * 60)

if __name__ == "__main__":
    main()
