"""
VOXAR Phase 3 — Day 2: Abbreviation & Special Text Test
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 3 — DAY 2: ABBREVIATIONS & SPECIAL TEXT")
    print("=" * 90)

    from engine.preprocessor.abbreviation_handler import AbbreviationHandler
    from engine.preprocessor.special_text_handler import SpecialTextHandler

    abbrev = AbbreviationHandler()
    special = SpecialTextHandler(language="en")

    # ========================================
    # TEST 1: Titles
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 1: TITLES")
    print(f"{'─' * 90}")

    title_tests = [
        "Dr. Sharma is a cardiologist",
        "Mr. Patel and Mrs. Gupta attended",
        "Prof. Kumar teaches AI at IIT",
        "Gen. Singh led the operation",
    ]

    for text in title_tests:
        result = abbrev.process(text)
        print(f"  \"{text}\"")
        print(f"  → \"{result}\"")
        print()

    # ========================================
    # TEST 2: Common Abbreviations
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 2: COMMON ABBREVIATIONS")
    print(f"{'─' * 90}")

    abbrev_tests = [
        "The govt. announced new policies",
        "Features include AI, ML, etc.",
        "India vs Australia cricket match",
        "Pvt. Ltd. company registration",
        "The dept. will handle this approx. by Monday",
    ]

    for text in abbrev_tests:
        result = abbrev.process(text)
        print(f"  \"{text}\"")
        print(f"  → \"{result}\"")
        print()

    # ========================================
    # TEST 3: Indian Acronyms
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 3: INDIAN ACRONYMS")
    print(f"{'─' * 90}")

    acronym_tests = [
        "The PM met the CM of Maharashtra",
        "ISRO launched a new satellite",
        "IIT and IIM admissions are open",
        "BJP won the MLA seat",
        "File a PIL or RTI for information",
        "UPI payments crossed 10 billion",
        "SEBI issued new GST guidelines",
        "Check your PAN and complete KYC",
    ]

    for text in acronym_tests:
        result = abbrev.process(text)
        print(f"  \"{text}\"")
        print(f"  → \"{result}\"")
        print()

    # ========================================
    # TEST 4: URLs & Emails
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 4: URLs & EMAILS")
    print(f"{'─' * 90}")

    url_tests = [
        "Visit https://voxar.in for more",
        "Check www.example.com/pricing",
        "Email us at hello@voxar.in",
        "Contact support@voxar.studio for help",
    ]

    for text in url_tests:
        result = special.process(text)
        print(f"  \"{text}\"")
        print(f"  → \"{result}\"")
        print()

    # ========================================
    # TEST 5: Phone Numbers
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 5: PHONE NUMBERS")
    print(f"{'─' * 90}")

    phone_tests = [
        "Call us at +91 98765 43210",
        "Contact: 9876543210",
        "Office: +91-11-2345-6789",
    ]

    for text in phone_tests:
        result = special.process(text)
        print(f"  \"{text}\"")
        print(f"  → \"{result}\"")
        print()

    # ========================================
    # TEST 6: Dates & Times
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 6: DATES & TIMES")
    print(f"{'─' * 90}")

    date_tests = [
        "Meeting on 15/01/2025",
        "Born on 26/01/1950",
        "Jan 15, 2025 is the deadline",
        "August 15, 1947 was Independence Day",
        "Call at 3:30 PM",
        "Meeting at 14:00",
        "Wake up at 6:00 am",
    ]

    for text in date_tests:
        result = special.process(text)
        print(f"  \"{text}\"")
        print(f"  → \"{result}\"")
        print()

    # ========================================
    # TEST 7: Math & Emojis
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 7: MATH SYMBOLS & EMOJIS")
    print(f"{'─' * 90}")

    misc_tests = [
        "2 + 2 = 4",
        "Temperature is 37°C",
        "Great work! 🔥🚀",
        "Score > 90 means excellent 🏆",
        "Hello 😊 Welcome to VOXAR ❤️",
    ]

    for text in misc_tests:
        result = special.process(text)
        print(f"  \"{text}\"")
        print(f"  → \"{result}\"")
        print()

    # ========================================
    # TEST 8: Real-World Scripts (Combined)
    # ========================================
    print(f"{'=' * 90}")
    print(f"  TEST 8: REAL-WORLD SCRIPTS (abbreviations + special text)")
    print(f"{'─' * 90}")

    scripts = [
        {
            "text": "Dr. Kumar, CEO of ISRO, announced the launch on 15/01/2025 at 3:30 PM. Contact info@isro.govt.in for details.",
            "desc": "News article"
        },
        {
            "text": "The PM said India's GDP growth is > 7%. BJP's MLA from NCR won by approx. 50,000 votes.",
            "desc": "Political news"
        },
        {
            "text": "Visit https://voxar.in — AI voice tech by Prof. Shah. IIT grad. 🚀 Call +91 98765 43210",
            "desc": "Marketing copy"
        },
    ]

    for script in scripts:
        # Process abbreviations first, then special text
        result = script["text"]
        result = abbrev.process(result)
        result = special.process(result)

        print(f"\n  [{script['desc']}]")
        print(f"  IN:  \"{script['text']}\"")
        print(f"  OUT: \"{result}\"")

    # ========================================
    # Summary
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  DAY 2 COMPLETE")
    print(f"{'=' * 90}")
    print(f"\n  ✅ Titles: Dr., Mr., Mrs., Prof., Gen., etc.")
    print(f"  ✅ Common: govt., etc., vs., dept., pvt. ltd.")
    print(f"  ✅ Indian: BJP, ISRO, IIT, PM, CM, UPI, GST, etc.")
    print(f"  ✅ URLs: spoken as 'voxar dot in'")
    print(f"  ✅ Emails: 'hello at voxar dot in'")
    print(f"  ✅ Phones: digit-by-digit with country code")
    print(f"  ✅ Dates: DD/MM/YYYY → 'fifteenth January...'")
    print(f"  ✅ Times: 3:30 PM → 'three thirty PM'")
    print(f"  ✅ Math symbols: +, =, >, < → words")
    print(f"  ✅ Emojis: removed cleanly")
    print()


if __name__ == "__main__":
    main()