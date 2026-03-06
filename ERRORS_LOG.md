# ERRORS_LOG.md

## Resolved Errors (Do Not Revert)
1.  **XTTS Hindi Parameter Bug:** XTTS v2 crashes (`KeyError`) when generating Hindi with parameters like `temperature` or `top_k`.
    * *Resolution:* Using basic `tts_to_file` for Hindi. Do not attempt to pass advanced config dicts for `lang="hi"`.
2.  **Chunk Boundary Artifacts:** Hard concatenation of 250/350 char chunks caused robotic pitch resets.
    * *Resolution:* Implemented a 50ms crossfade (`cf50`) in `AudioConcatenator`. Do not revert to 0ms.
3.  **Hinglish Transliteration Garbage:** `indic-transliteration` library created weird characters for English words mixed in Hindi.
    * *Resolution:* Bypassed algorithmic transliteration. Using strict dictionary lookup (`hinglish_words.json`).
4.  **Special Text Pipeline Conflicts:** Expanding abbreviations ruined URLs and Time formats (PM -> Prime Minister).
    * *Resolution:* Pipeline order is strictly enforced in `ScriptPreprocessor`: 1. Protect URLs/Emails -> 2. Times/Dates -> 3. Abbreviations -> 4. Restore URLs/Emails.

## Known Limitations / Watchlist
1.  **XTTS Max Chunk Limit:** XTTS natively struggles/warns if a Hindi chunk exceeds 250 characters. `TextChunker` is configured to respect this.
2.  **VRAM Limits:** RTX 4060 has 8.59GB. XTTS takes ~2GB. MMS ~0.5GB. OpenVoice ~0.5GB. Sequential hot-swapping required on dev hardware. Production 24GB GPU can hold multiple models.
3.  **XTTS Marathi:** Works via Devanagari script (same as Hindi). Uses basic `tts_to_file` call. Voice cloning works.

## Rejected Approaches (Do Not Revisit)
1.  **ITRANS Transliteration:** Produces garbage for mixed Hinglish text. Removed in v1.1.0. Use `hinglish_words.json` dictionary only.
2.  **Approach A — Phonetic Script Conversion for Regional Languages:** Converting Tamil/Kannada/Telugu/Malayalam script to Devanagari phonetic approximation and feeding to XTTS. Rejected because Dravidian languages have sounds (e.g., Tamil ழ) that don't exist in Hindi phoneme set. Output sounds like "Hindi accent reading transliterated words." Native speakers will immediately reject it. Using Approach B (MMS + OpenVoice) instead.
3.  **Bare-word abbreviation expansion:** Expanding "am", "pm", "min", "max" etc. as abbreviations destroys normal English words. Removed in v1.1.0. Only dotted forms ("a.m.", "p.m.") are expanded.