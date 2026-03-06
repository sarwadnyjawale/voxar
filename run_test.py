"""
VOXAR Test Runner
"""

import sys
import os
import importlib.util

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

TEST_FILES = {
    "day1": os.path.join(PROJECT_ROOT, "engine", "tests", "test_day1_basic.py"),
    "day2": os.path.join(PROJECT_ROOT, "engine", "tests", "test_day2_languages.py"),
    "hindi": os.path.join(PROJECT_ROOT, "engine", "tests", "test_hindi_script.py"),
    "marathi": os.path.join(PROJECT_ROOT, "engine", "tests", "test_marathi.py"),
    "day3": os.path.join(PROJECT_ROOT, "engine", "tests", "test_day3_stress.py"),
    "day4": os.path.join(PROJECT_ROOT, "engine", "tests", "test_day4_chunking.py"),
    "day5": os.path.join(PROJECT_ROOT, "engine", "tests", "test_day5_voices.py"),
    "day6": os.path.join(PROJECT_ROOT, "engine", "tests", "test_day6_modes.py"),
    # Phase 2
    "p2d1": os.path.join(PROJECT_ROOT, "engine", "tests", "test_phase2_day1.py"),
    "p2d2": os.path.join(PROJECT_ROOT, "engine", "tests", "test_phase2_day2.py"),
    "p2d3": os.path.join(PROJECT_ROOT, "engine", "tests", "test_phase2_day3.py"),
    "p2d4": os.path.join(PROJECT_ROOT, "engine", "tests", "test_phase2_day4.py"),
    "p2d5": os.path.join(PROJECT_ROOT, "engine", "tests", "test_phase2_day5.py"),
    "p3d1": os.path.join(PROJECT_ROOT, "engine", "preprocessor", "tests", "test_day1_numbers.py"),
    "p3d2": os.path.join(PROJECT_ROOT, "engine", "preprocessor", "tests", "test_day2_abbreviations.py"),
    "p3d3": os.path.join(PROJECT_ROOT, "engine", "preprocessor", "tests", "test_day3_hinglish.py"),
    "p3d4": os.path.join(PROJECT_ROOT, "engine", "preprocessor", "tests", "test_day4_pauses.py"),
    "p3d5": os.path.join(PROJECT_ROOT, "engine", "preprocessor", "tests", "test_day5_pipeline.py"),
}


def load_and_run(test_name):
    file_path = TEST_FILES.get(test_name)
    if not file_path:
        print(f"Unknown test: {test_name}")
        print(f"Available: {', '.join(TEST_FILES.keys())}")
        return

    if not os.path.exists(file_path):
        print(f"ERROR: Test file not found: {file_path}")
        tests_dir = os.path.join(PROJECT_ROOT, "engine", "tests")
        if os.path.exists(tests_dir):
            print(f"\nFiles in engine/tests/:")
            for f in os.listdir(tests_dir):
                print(f"  - {f}")
        return

    spec = importlib.util.spec_from_file_location("test_module", file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    if hasattr(module, 'main'):
        module.main()
    else:
        print(f"ERROR: No main() function in {file_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("=" * 50)
        print("VOXAR Test Runner")
        print("=" * 50)
        print("\nUsage: python run_test.py <test_name>")
        print("\nAvailable tests:")
        for name in TEST_FILES:
            print(f"  {name}")
        sys.exit(1)

    load_and_run(sys.argv[1].lower().strip())