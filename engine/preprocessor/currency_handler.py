"""
VOXAR Currency Handler
Converts currency symbols and amounts to spoken words.
Supports ₹ (INR), $ (USD), € (EUR), £ (GBP).
"""

import re
import logging

logger = logging.getLogger("VoxarPreprocessor")

try:
    from num2words import num2words
    HAS_NUM2WORDS = True
except ImportError:
    HAS_NUM2WORDS = False


class CurrencyHandler:
    """Convert currency expressions to spoken words."""

    CURRENCIES = {
        "₹": {"en": ("rupee", "rupees", "paisa", "paise"),
               "hi": ("rupaya", "rupaye", "paisa", "paise")},
        "$": {"en": ("dollar", "dollars", "cent", "cents"),
               "hi": ("dollar", "dollars", "cent", "cents")},
        "€": {"en": ("euro", "euros", "cent", "cents"),
               "hi": ("euro", "euros", "cent", "cents")},
        "£": {"en": ("pound", "pounds", "penny", "pence"),
               "hi": ("pound", "pounds", "penny", "pence")},
    }

    def __init__(self, language="en"):
        self.language = language

    def process(self, text, language=None):
        """Process all currency expressions in text."""
        lang = language or self.language

        # Order: specific patterns first
        text = self._process_shorthand(text, lang)    # ₹1.5Cr, ₹10L
        text = self._process_with_decimal(text, lang)  # ₹99.99
        text = self._process_simple(text, lang)         # ₹500

        return text

    def _process_shorthand(self, text, lang):
        """Convert ₹1.5Cr → "one point five crore rupees" """
        def replace(match):
            symbol = match.group(1)
            num_str = match.group(2)
            unit = match.group(3).lower()

            try:
                num = float(num_str)
                currency = self.CURRENCIES.get(symbol, self.CURRENCIES["₹"])
                names = currency.get(lang, currency["en"])

                # Number to words
                num_word = self._num_to_words(num, lang)

                # Unit
                unit_map = {
                    "cr": "crore", "crore": "crore",
                    "l": "lakh", "lakh": "lakh",
                    "k": "thousand", "thousand": "thousand",
                    "m": "million", "million": "million",
                    "b": "billion", "billion": "billion",
                }
                unit_word = unit_map.get(unit, unit)

                # Currency name (plural)
                curr_name = names[1]  # plural

                return f"{num_word} {unit_word} {curr_name}"
            except Exception:
                return match.group(0)

        pattern = r'([₹$€£])\s*(\d+\.?\d*)\s*(Cr|Crore|L|Lakh|K|Thousand|M|Million|B|Billion)'
        return re.sub(pattern, replace, text, flags=re.IGNORECASE)

    def _process_with_decimal(self, text, lang):
        """Convert ₹99.99 → "ninety nine rupees and ninety nine paise" """
        def replace(match):
            symbol = match.group(1)
            whole = match.group(2).replace(',', '')
            decimal = match.group(3)

            try:
                whole_num = int(whole)
                decimal_num = int(decimal)

                currency = self.CURRENCIES.get(symbol, self.CURRENCIES["₹"])
                names = currency.get(lang, currency["en"])

                whole_word = self._num_to_words(whole_num, lang)
                main_unit = names[0] if whole_num == 1 else names[1]

                if decimal_num > 0:
                    decimal_word = self._num_to_words(decimal_num, lang)
                    sub_unit = names[2] if decimal_num == 1 else names[3]
                    connector = "and" if lang == "en" else "aur"
                    return f"{whole_word} {main_unit} {connector} {decimal_word} {sub_unit}"
                else:
                    return f"{whole_word} {main_unit}"
            except Exception:
                return match.group(0)

        pattern = r'([₹$€£])\s*(\d[\d,]*)\.(\d{1,2})\b'
        return re.sub(pattern, replace, text)

    def _process_simple(self, text, lang):
        """Convert ₹500 → "five hundred rupees" """
        def replace(match):
            symbol = match.group(1)
            num_str = match.group(2).replace(',', '')

            try:
                num = int(num_str)
                currency = self.CURRENCIES.get(symbol, self.CURRENCIES["₹"])
                names = currency.get(lang, currency["en"])

                num_word = self._num_to_words(num, lang)
                unit = names[0] if num == 1 else names[1]

                return f"{num_word} {unit}"
            except Exception:
                return match.group(0)

        pattern = r'([₹$€£])\s*(\d[\d,]*)\b(?!\.\d)'
        return re.sub(pattern, replace, text)

    def _num_to_words(self, num, lang):
        """Convert number to words."""
        if isinstance(num, float):
            if num == int(num):
                num = int(num)
            else:
                # Handle decimal
                whole = int(num)
                decimal = str(num).split('.')[1]
                whole_word = self._num_to_words(whole, lang)
                point = "point" if lang == "en" else "dashmlav"
                decimal_words = " ".join(
                    self._num_to_words(int(d), lang) for d in decimal
                )
                return f"{whole_word} {point} {decimal_words}"

        if lang == "hi":
            from engine.preprocessor.number_handler import NumberHandler
            handler = NumberHandler(language="hi")
            return handler._hindi_number(num)

        if HAS_NUM2WORDS:
            try:
                return num2words(num, lang='en')
            except Exception:
                return str(num)

        return str(num)