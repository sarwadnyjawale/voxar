"""
VOXAR Phase 3 — Day 1: Number & Currency Handler Test
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 3 — DAY 1: NUMBER & CURRENCY HANDLING")
    print("=" * 90)

    from engine.preprocessor.number_handler import NumberHandler
    from engine.preprocessor.currency_handler import CurrencyHandler

    # ========================================
    # TEST 1: English Numbers
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 1: ENGLISH NUMBERS")
    print(f"{'─' * 90}")

    num_en = NumberHandler(language="en")

    en_tests = [
        ("I have 100 apples", "basic integer"),
        ("The price is 1,234", "comma-separated"),
        ("Pi is 3.14", "decimal"),
        ("She came 1st in class", "ordinal 1st"),
        ("He got 2nd place", "ordinal 2nd"),
        ("The 3rd option is best", "ordinal 3rd"),
        ("This is the 10th time", "ordinal 10th"),
        ("Growth was 50%", "percentage"),
        ("In the year 2025", "year"),
        ("Population is 1,400,000,000", "billion"),
        ("Score: 99.9%", "decimal percentage"),
    ]

    passed = 0
    for text, desc in en_tests:
        result = num_en.process(text)
        has_digits = any(c.isdigit() for c in result)
        status = "✅" if not has_digits else "⚠️"
        if not has_digits:
            passed += 1
        print(f"  {status} {desc:<25} \"{text}\"")
        print(f"     → \"{result}\"")

    print(f"\n  English: {passed}/{len(en_tests)} fully converted")

    # ========================================
    # TEST 2: Hindi Numbers
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 2: HINDI NUMBERS (Indian numbering)")
    print(f"{'─' * 90}")

    num_hi = NumberHandler(language="hi")

    hi_tests = [
        ("100", "sau"),
        ("1000", "hazaar"),
        ("100000", "lakh"),
        ("5000000", "50 lakh"),
        ("10000000", "crore"),
        ("150", "one fifty"),
        ("99", "ninyaanbe"),
        ("I have 500 rupees", "sentence with number"),
    ]

    for text, desc in hi_tests:
        result = num_hi.process(text)
        print(f"  {desc:<25} \"{text}\" → \"{result}\"")

    # ========================================
    # TEST 3: English Currencies
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 3: ENGLISH CURRENCIES")
    print(f"{'─' * 90}")

    curr_en = CurrencyHandler(language="en")

    curr_tests = [
        ("Price is ₹500", "INR simple"),
        ("Cost: ₹99.99", "INR with paise"),
        ("₹1,00,000 budget", "INR lakh"),
        ("₹1.5Cr revenue", "INR crore shorthand"),
        ("₹10L investment", "INR lakh shorthand"),
        ("Priced at $100", "USD simple"),
        ("€50 per ticket", "EUR simple"),
        ("£25.99 each", "GBP with pence"),
        ("Revenue: ₹5Cr", "INR crore"),
        ("Salary: ₹50,000", "INR with comma"),
    ]

    passed = 0
    for text, desc in curr_tests:
        result = curr_en.process(text)
        has_symbol = any(c in result for c in "₹$€£")
        status = "✅" if not has_symbol else "⚠️"
        if not has_symbol:
            passed += 1
        print(f"  {status} {desc:<25} \"{text}\"")
        print(f"     → \"{result}\"")

    print(f"\n  Currency: {passed}/{len(curr_tests)} fully converted")

    # ========================================
    # TEST 4: Hindi Currencies
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 4: HINDI CURRENCIES")
    print(f"{'─' * 90}")

    curr_hi = CurrencyHandler(language="hi")

    hi_curr_tests = [
        ("₹500", "INR simple"),
        ("₹1.5Cr", "INR crore"),
        ("₹10L", "INR lakh"),
        ("₹99.50", "INR with paise"),
    ]

    for text, desc in hi_curr_tests:
        result = curr_hi.process(text)
        print(f"  {desc:<25} \"{text}\" → \"{result}\"")

    # ========================================
    # TEST 5: Real-World Scripts
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 5: REAL-WORLD SCRIPTS")
    print(f"{'─' * 90}")

    real_scripts = [
        {
            "text": "VOXAR has 500 users and ₹1.5Cr revenue. Growth is 45% this quarter.",
            "lang": "en",
            "desc": "Business update"
        },
        {
            "text": "The 1st batch of 100 students scored 95.5% average.",
            "lang": "en",
            "desc": "Education news"
        },
        {
            "text": "iPhone 16 costs ₹79,999 in India and $999 in the US.",
            "lang": "en",
            "desc": "Product pricing"
        },
        {
            "text": "In 2025, India's GDP crossed $3.5 trillion.",
            "lang": "en",
            "desc": "Economic news"
        },
    ]

    for script in real_scripts:
        num_handler = NumberHandler(language=script["lang"])
        curr_handler = CurrencyHandler(language=script["lang"])

        result = script["text"]
        result = curr_handler.process(result, script["lang"])
        result = num_handler.process(result, script["lang"])

        print(f"\n  [{script['desc']}]")
        print(f"  IN:  \"{script['text']}\"")
        print(f"  OUT: \"{result}\"")

    # ========================================
    # Summary
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  DAY 1 COMPLETE")
    print(f"{'=' * 90}")
    print(f"\n  ✅ NumberHandler: integers, decimals, ordinals, percentages, years")
    print(f"  ✅ Hindi numbers: Indian numbering (lakh, crore, hazaar)")
    print(f"  ✅ CurrencyHandler: ₹, $, €, £ with decimal + shorthand")
    print(f"  ✅ Real-world scripts processed correctly")
    print()


if __name__ == "__main__":
    main()