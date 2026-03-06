"""
VOXAR Special Text Handler
Handles URLs, emails, phone numbers, dates, times, math symbols, emojis.
"""

import re
import logging

logger = logging.getLogger("VoxarPreprocessor")

try:
    from num2words import num2words
    HAS_NUM2WORDS = True
except ImportError:
    HAS_NUM2WORDS = False


class SpecialTextHandler:
    """Handle special text patterns that TTS can't read properly."""

    MATH_SYMBOLS = {
        "+": "plus",
        "=": "equals",
        "-": "minus",
        "×": "times",
        "÷": "divided by",
        ">": "greater than",
        "<": "less than",
        "≥": "greater than or equal to",
        "≤": "less than or equal to",
        "≠": "not equal to",
        "≈": "approximately",
        "±": "plus or minus",
        "∞": "infinity",
        "°": "degrees",
        "π": "pi",
    }

    # Common emoji descriptions
    EMOJI_MAP = {
        "😊": "", "😂": "", "❤️": "", "🔥": "",
        "👍": "", "🎉": "", "✅": "", "❌": "",
        "⭐": "", "💡": "", "🚀": "", "💰": "",
        "📈": "", "📉": "", "🎯": "", "🏆": "",
        "👋": "", "🙏": "", "💪": "", "🤔": "",
    }

    def __init__(self, language="en"):
        self.language = language

    def process(self, text, language=None):
        """Process all special text patterns."""
        lang = language or self.language

        text = self._process_urls(text)
        text = self._process_emails(text)
        text = self._process_phone_numbers(text, lang)
        text = self._process_dates(text, lang)
        text = self._process_times(text, lang)
        text = self._process_math_symbols(text)
        text = self._remove_emojis(text)
        text = self._clean_special_chars(text)

        return text

    def _process_urls(self, text):
        """Convert URLs to spoken form or remove them."""
        def replace_url(match):
            url = match.group(0)

            # Extract domain
            domain_match = re.search(r'(?:https?://)?(?:www\.)?([^/\s]+)', url)
            if domain_match:
                domain = domain_match.group(1)
                # Convert dots to "dot"
                spoken = domain.replace('.', ' dot ')
                return spoken

            return ""

        # Full URLs
        text = re.sub(
            r'https?://[^\s<>"\']+',
            replace_url, text
        )

        # www URLs without protocol
        text = re.sub(
            r'www\.[^\s<>"\']+',
            replace_url, text
        )

        return text

    def _process_emails(self, text):
        """Convert emails: hello@voxar.in → "hello at voxar dot in" """
        def replace_email(match):
            email = match.group(0)
            parts = email.split('@')
            if len(parts) == 2:
                user = parts[0]
                domain = parts[1].replace('.', ' dot ')
                return f"{user} at {domain}"
            return email

        text = re.sub(r'[\w.+-]+@[\w.-]+\.\w+', replace_email, text)
        return text

    def _process_phone_numbers(self, text, lang):
        """Convert phone numbers to digit-by-digit reading."""
        digit_words_en = {
            '0': 'zero', '1': 'one', '2': 'two', '3': 'three',
            '4': 'four', '5': 'five', '6': 'six', '7': 'seven',
            '8': 'eight', '9': 'nine',
        }
        digit_words_hi = {
            '0': 'shoonya', '1': 'ek', '2': 'do', '3': 'teen',
            '4': 'chaar', '5': 'paanch', '6': 'chhah', '7': 'saat',
            '8': 'aath', '9': 'nau',
        }

        digits = digit_words_hi if lang == "hi" else digit_words_en

        def replace_phone(match):
            full = match.group(0)
            # Extract just digits
            only_digits = re.sub(r'[^\d]', '', full)

            if len(only_digits) < 7:
                return full  # Too short to be a phone number

            # Handle country code
            result_parts = []
            if full.startswith('+'):
                # Country code
                if only_digits.startswith('91') and len(only_digits) >= 12:
                    cc = only_digits[:2]
                    number = only_digits[2:]
                    result_parts.append("plus")
                    result_parts.extend(digits[d] for d in cc)
                    result_parts.append(",")
                    only_digits = number
                elif len(only_digits) > 10:
                    cc_len = len(only_digits) - 10
                    cc = only_digits[:cc_len]
                    result_parts.append("plus")
                    result_parts.extend(digits[d] for d in cc)
                    result_parts.append(",")
                    only_digits = only_digits[cc_len:]

            # Read remaining digits in groups
            # Indian format: XXXXX XXXXX
            if len(only_digits) == 10:
                group1 = only_digits[:5]
                group2 = only_digits[5:]
                result_parts.extend(digits[d] for d in group1)
                result_parts.append(",")
                result_parts.extend(digits[d] for d in group2)
            else:
                result_parts.extend(digits[d] for d in only_digits)

            return " ".join(result_parts)

        # Indian phone: +91 98765 43210 or 9876543210
        text = re.sub(
            r'\+?\d{1,3}[\s.-]?\d{4,5}[\s.-]?\d{4,5}',
            replace_phone, text
        )

        return text

    def _process_dates(self, text, lang):
        """Convert dates to spoken form."""
        months_en = {
            '01': 'January', '02': 'February', '03': 'March',
            '04': 'April', '05': 'May', '06': 'June',
            '07': 'July', '08': 'August', '09': 'September',
            '10': 'October', '11': 'November', '12': 'December',
            '1': 'January', '2': 'February', '3': 'March',
            '4': 'April', '5': 'May', '6': 'June',
            '7': 'July', '8': 'August', '9': 'September',
        }

        def ordinal(n):
            if HAS_NUM2WORDS:
                return num2words(n, to='ordinal', lang='en')
            suffixes = {1: 'st', 2: 'nd', 3: 'rd'}
            suffix = suffixes.get(n % 10, 'th')
            if 11 <= n % 100 <= 13:
                suffix = 'th'
            return f"{n}{suffix}"

        # DD/MM/YYYY
        def replace_dmy(match):
            day = int(match.group(1))
            month = match.group(2)
            year = match.group(3)

            month_name = months_en.get(month, month)
            day_word = ordinal(day)

            if HAS_NUM2WORDS:
                year_word = num2words(int(year), lang='en')
            else:
                year_word = year

            return f"{day_word} {month_name} {year_word}"

        text = re.sub(r'(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})', replace_dmy, text)

        # Month DD, YYYY (already readable but ensure numbers convert)
        month_names = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"

        def replace_mdy(match):
            month = match.group(1)
            day = int(match.group(2))
            year = match.group(3)

            day_word = ordinal(day)
            if HAS_NUM2WORDS:
                year_word = num2words(int(year), lang='en')
            else:
                year_word = year

            return f"{month} {day_word}, {year_word}"

        text = re.sub(
            rf'({month_names})\s+(\d{{1,2}}),?\s+(\d{{4}})',
            replace_mdy, text
        )

        return text

    def _process_times(self, text, lang):
        """Convert times to spoken form."""
        def replace_time(match):
            hour = int(match.group(1))
            minute = match.group(2)
            period = match.group(3) if match.group(3) else ""

            if HAS_NUM2WORDS:
                hour_word = num2words(hour, lang='en')
            else:
                hour_word = str(hour)

            if minute and int(minute) > 0:
                if HAS_NUM2WORDS:
                    min_word = num2words(int(minute), lang='en')
                else:
                    min_word = minute
                time_str = f"{hour_word} {min_word}"
            else:
                time_str = f"{hour_word} o'clock" if not period else hour_word

            if period:
                # Space the letters so TTS reads "P M" not "PM" (which would
                # collide with "PM" → "Prime Minister" in Indian abbreviations)
                spaced = " ".join(period.upper().replace(".", ""))
                time_str += f" {spaced}"

            return time_str

        # 3:30 PM, 14:00, 3:30pm
        text = re.sub(
            r'(\d{1,2}):(\d{2})\s*((?:[AaPp]\.?[Mm]\.?))?',
            replace_time, text
        )

        return text

    def _process_math_symbols(self, text):
        """Convert math symbols to words."""
        for symbol, word in self.MATH_SYMBOLS.items():
            if symbol in text:
                # Add spaces around the word
                text = text.replace(symbol, f" {word} ")

        # Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text)
        return text

    def _remove_emojis(self, text):
        """Remove emojis from text."""
        # Remove known emojis
        for emoji in self.EMOJI_MAP:
            text = text.replace(emoji, "")

        # Remove any remaining emoji characters using regex
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map
            "\U0001F1E0-\U0001F1FF"  # flags
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "\U0001f926-\U0001f937"
            "\U00010000-\U0010ffff"
            "]+",
            flags=re.UNICODE
        )
        text = emoji_pattern.sub('', text)

        return text.strip()

    def _clean_special_chars(self, text):
        """Clean remaining special characters."""
        # Replace multiple dashes with single
        text = re.sub(r'—+', ', ', text)
        text = re.sub(r'–+', ', ', text)

        # Replace multiple dots (not ellipsis) with period
        text = re.sub(r'\.{4,}', '.', text)

        # Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text)

        # Clean up multiple commas
        text = re.sub(r',\s*,', ',', text)

        return text.strip()