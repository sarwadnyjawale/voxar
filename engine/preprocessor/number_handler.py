"""
VOXAR Number Handler
Converts numbers, ordinals, percentages to spoken words.
Supports English and Hindi (Indian numbering system).
"""

import re
import logging

logger = logging.getLogger("VoxarPreprocessor")

try:
    from num2words import num2words
    HAS_NUM2WORDS = True
except ImportError:
    HAS_NUM2WORDS = False
    logger.warning("num2words not installed. pip install num2words")


class NumberHandler:
    """Convert numbers to spoken words in English and Hindi."""

    # Indian numbering: lakh (1,00,000), crore (1,00,00,000)
    HINDI_ONES = [
        "", "ek", "do", "teen", "chaar", "paanch",
        "chhah", "saat", "aath", "nau", "das",
        "gyaarah", "baarah", "terah", "chaudah", "pandrah",
        "solah", "satrah", "athaarah", "unees", "bees",
        "ikkees", "baees", "teis", "chaubees", "pachchees",
        "chhabbees", "sattaees", "atthaees", "untees", "tees",
        "ikatees", "battees", "taintees", "chauntees", "paintees",
        "chhattees", "saintees", "adtees", "untaalees", "chaalees",
        "iktaalees", "bayaalees", "taintaalees", "chauvaalees", "paintaalees",
        "chhiyaalees", "saintaalees", "adtaalees", "unchaas", "pachaas",
        "ikyaavan", "baavan", "tirpan", "chauvan", "pachpan",
        "chhappan", "sattaavan", "atthaavan", "unsath", "saath",
        "iksath", "baasath", "tirsath", "chaunsath", "painsath",
        "chhiyaasath", "sadsath", "adsath", "unhattar", "sattar",
        "ikattar", "bahattar", "tihattar", "chauhattar", "pachattar",
        "chhihattar", "sathattar", "athhattar", "unaasi", "assi",
        "ikyaasi", "bayaasi", "tiraasi", "chauraasi", "pachaasi",
        "chhiyaasi", "sataasi", "athaasi", "navaasi", "nabbe",
        "ikyaanbe", "baanbe", "tiraanbe", "chauraanbe", "pachaanbe",
        "chhiyaanbe", "sataanbe", "athaanbe", "ninyaanbe", "sau"
    ]

    HINDI_ORDINALS = {
        1: "pehla", 2: "doosra", 3: "teesra", 4: "chautha",
        5: "paanchvaan", 6: "chhathvaan", 7: "saatvaan", 8: "aathvaan",
        9: "nauvaan", 10: "dasvaan",
    }

    def __init__(self, language="en"):
        self.language = language

    def process(self, text, language=None):
        """Process all numbers in text."""
        lang = language or self.language

        # Order matters — process specific patterns before generic numbers
        text = self._process_percentages(text, lang)
        text = self._process_ordinals(text, lang)
        text = self._process_decimals(text, lang)
        text = self._process_indian_format(text, lang)
        text = self._process_integers(text, lang)

        return text

    def _process_percentages(self, text, lang):
        """Convert "50%" → "fifty percent" """
        def replace(match):
            num = match.group(1).replace(',', '')
            try:
                val = float(num)
                word = self._number_to_words(val, lang)
                suffix = "percent" if lang == "en" else "pratishat"
                return f"{word} {suffix}"
            except Exception:
                return match.group(0)

        return re.sub(r'(\d[\d,]*\.?\d*)\s*%', replace, text)

    def _process_ordinals(self, text, lang):
        """Convert "1st", "2nd", "3rd" → "first", "second", "third" """
        def replace(match):
            num = int(match.group(1))
            try:
                if lang == "en" and HAS_NUM2WORDS:
                    return num2words(num, to='ordinal', lang='en')
                elif lang == "hi":
                    return self.HINDI_ORDINALS.get(num, f"{self._hindi_number(num)}vaan")
                else:
                    return num2words(num, to='ordinal', lang='en')
            except Exception:
                return match.group(0)

        return re.sub(r'(\d+)(?:st|nd|rd|th)\b', replace, text)

    def _process_decimals(self, text, lang):
        """Convert "3.14" → "three point one four" """
        def replace(match):
            whole = match.group(1)
            decimal = match.group(2)

            try:
                whole_word = self._number_to_words(int(whole), lang)

                # Read decimal digits individually
                if lang == "en":
                    point = "point"
                    decimal_words = " ".join(
                        self._number_to_words(int(d), lang) for d in decimal
                    )
                else:
                    point = "dashmlav"
                    decimal_words = " ".join(
                        self._hindi_number(int(d)) for d in decimal
                    )

                return f"{whole_word} {point} {decimal_words}"
            except Exception:
                return match.group(0)

        return re.sub(r'(\d+)\.(\d+)', replace, text)

    def _process_indian_format(self, text, lang):
        """Convert Indian format "1,00,000" → "one lakh" """
        def replace(match):
            num_str = match.group(0).replace(',', '')
            try:
                num = int(num_str)
                if lang == "hi":
                    return self._hindi_number(num)
                else:
                    return self._english_indian_number(num)
            except Exception:
                return match.group(0)

        # Indian format: 1,00,000 or 10,00,000 etc
        return re.sub(r'\d{1,2}(?:,\d{2})*,\d{3}\b', replace, text)

    def _process_integers(self, text, lang):
        """Convert standalone integers to words."""
        def replace(match):
            # Don't convert if part of a larger pattern (time, date, etc)
            num_str = match.group(0).replace(',', '')
            try:
                num = int(num_str)
                # Don't convert years (1900-2100) in most contexts
                if 1900 <= num <= 2100:
                    return self._year_to_words(num, lang)
                return self._number_to_words(num, lang)
            except Exception:
                return match.group(0)

        # Match numbers not preceded/followed by certain chars
        return re.sub(r'(?<![:\-/.])\b(\d{1,3}(?:,\d{3})*|\d+)\b(?![:\-/.])', replace, text)

    def _number_to_words(self, num, lang):
        """Convert a number to spoken words."""
        if lang == "hi":
            return self._hindi_number(int(num) if num == int(num) else num)

        if HAS_NUM2WORDS:
            try:
                return num2words(num, lang='en')
            except Exception:
                return str(num)

        return str(num)

    def _hindi_number(self, num):
        """Convert number to Hindi words (Indian numbering system)."""
        if num < 0:
            return "minus " + self._hindi_number(-num)

        if num == 0:
            return "shoonya"

        if num <= 100:
            return self.HINDI_ONES[num] if num < len(self.HINDI_ONES) else str(num)

        parts = []

        # Crore (1,00,00,000)
        if num >= 10000000:
            crore = num // 10000000
            parts.append(f"{self._hindi_number(crore)} crore")
            num %= 10000000

        # Lakh (1,00,000)
        if num >= 100000:
            lakh = num // 100000
            parts.append(f"{self._hindi_number(lakh)} lakh")
            num %= 100000

        # Hazaar (1,000)
        if num >= 1000:
            hazaar = num // 1000
            parts.append(f"{self._hindi_number(hazaar)} hazaar")
            num %= 1000

        # Sau (100)
        if num >= 100:
            sau = num // 100
            parts.append(f"{self._hindi_number(sau)} sau")
            num %= 100

        # Remaining
        if num > 0:
            if num < len(self.HINDI_ONES):
                parts.append(self.HINDI_ONES[num])
            else:
                parts.append(str(num))

        return " ".join(parts)

    def _english_indian_number(self, num):
        """English words but with Indian numbering (lakh, crore)."""
        if num < 100000:
            if HAS_NUM2WORDS:
                return num2words(num, lang='en')
            return str(num)

        parts = []

        if num >= 10000000:
            crore = num // 10000000
            parts.append(f"{num2words(crore, lang='en') if HAS_NUM2WORDS else crore} crore")
            num %= 10000000

        if num >= 100000:
            lakh = num // 100000
            parts.append(f"{num2words(lakh, lang='en') if HAS_NUM2WORDS else lakh} lakh")
            num %= 100000

        if num > 0:
            parts.append(num2words(num, lang='en') if HAS_NUM2WORDS else str(num))

        return " ".join(parts)

    def _year_to_words(self, year, lang):
        """Convert year to natural speech: 2025 → "twenty twenty five" """
        if lang == "hi":
            return self._hindi_number(year)

        if HAS_NUM2WORDS:
            # For years like 2025, say "twenty twenty five" not "two thousand and twenty five"
            if 2000 <= year <= 2099:
                return num2words(year, lang='en')
            elif 1900 <= year <= 1999:
                first = year // 100
                second = year % 100
                if second == 0:
                    return num2words(first, lang='en') + " hundred"
                return f"{num2words(first, lang='en')} {num2words(second, lang='en')}"

        return str(year)