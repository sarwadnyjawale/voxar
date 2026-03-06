"""
VOXAR Subtitle Exporter v1.0
Converts Whisper transcript segments to SRT, VTT, and structured JSON formats.

Features:
  - SRT export (SubRip Text -- universally supported)
  - VTT export (WebVTT -- HTML5 native, YouTube, browser players)
  - JSON export (structured data for programmatic access)
  - Long segment splitting (max chars per line, max duration per subtitle)
  - Word-level subtitle mode for karaoke-style display
  - Speaker label support (from diarization)

Architecture:
  - Stateless utility (all static methods -- no GPU, no VRAM, no model)
  - Operates on TranscriptSegment lists from VoxarWhisperEngine
  - Called by EngineRouter after transcription + optional diarization

RULES:
  - This module must NEVER contain credit/billing/API logic
  - No model loading -- pure text formatting
  - Must handle edge cases: empty segments, overlapping times, unicode
"""

import os
import logging
from typing import List, Optional

logger = logging.getLogger("VoxarSubtitles")


class SubtitleExporter:
    """
    Converts Whisper transcript segments to subtitle file formats.

    Stateless utility class -- all methods are static.
    No model loading, no GPU usage, no VRAM impact.

    Supported formats:
      - SRT (SubRip Text): Most widely supported subtitle format.
        Used by VLC, YouTube Studio, Premiere Pro, DaVinci Resolve.
      - VTT (WebVTT): W3C standard for HTML5 <track> elements.
        Used by browsers, YouTube, online video players.
      - JSON: Structured data for programmatic access and custom rendering.

    Usage:
        from engine.whisper_engine import VoxarWhisperEngine
        from engine.subtitle_exporter import SubtitleExporter

        whisper = VoxarWhisperEngine()
        result = whisper.transcribe("audio.wav")

        # Generate SRT
        srt_content = SubtitleExporter.to_srt(result.segments)
        SubtitleExporter.save_srt(result.segments, "output.srt")

        # Generate VTT
        vtt_content = SubtitleExporter.to_vtt(result.segments)
        SubtitleExporter.save_vtt(result.segments, "output.vtt")

        # Generate JSON
        json_data = SubtitleExporter.to_json(result.segments, include_words=True)
    """

    # ─── Subtitle formatting defaults ────────────────────────────────────

    # Maximum characters per subtitle line (industry standard: 42 for broadcast,
    # 47 for streaming). We use 42 for wide compatibility.
    DEFAULT_MAX_CHARS_PER_LINE = 42

    # Maximum number of lines per subtitle block
    DEFAULT_MAX_LINES = 2

    # Maximum duration of a single subtitle (seconds).
    # Netflix standard: 7s max. YouTube: similar. Broadcast: 3-5s.
    DEFAULT_MAX_DURATION = 7.0

    # Minimum duration for a subtitle to be readable (seconds)
    MIN_SUBTITLE_DURATION = 0.5

    # Characters per second reading speed (average adult: 15-20 CPS)
    # We use 21 CPS which matches Netflix/Amazon standards
    TARGET_CPS = 21

    # ─── SRT Format ──────────────────────────────────────────────────────

    @staticmethod
    def to_srt(segments, max_chars_per_line=None, max_lines=None,
               max_duration=None, include_speakers=True):
        """
        Convert transcript segments to SRT (SubRip Text) format.

        SRT format specification:
            1
            00:00:01,500 --> 00:00:04,200
            First subtitle text line.

            2
            00:00:04,500 --> 00:00:07,800
            Second subtitle text.

        Args:
            segments: list of TranscriptSegment from Whisper
            max_chars_per_line: max characters per line (default: 42)
            max_lines: max lines per subtitle block (default: 2)
            max_duration: max subtitle duration in seconds (default: 7.0)
            include_speakers: prepend speaker labels if available

        Returns:
            str: complete SRT file content
        """
        max_chars = max_chars_per_line or SubtitleExporter.DEFAULT_MAX_CHARS_PER_LINE
        max_ln = max_lines or SubtitleExporter.DEFAULT_MAX_LINES
        max_dur = max_duration or SubtitleExporter.DEFAULT_MAX_DURATION

        # Split long segments for readability
        split_segments = SubtitleExporter._split_long_segments(
            segments, max_chars * max_ln, max_dur
        )

        srt_blocks = []

        for idx, seg in enumerate(split_segments, start=1):
            # Format timestamps: HH:MM:SS,mmm
            start_ts = SubtitleExporter._format_timestamp_srt(seg["start"])
            end_ts = SubtitleExporter._format_timestamp_srt(seg["end"])

            # Format text with line wrapping
            text = seg["text"]
            if include_speakers and seg.get("speaker"):
                text = f"[{seg['speaker']}] {text}"

            wrapped = SubtitleExporter._wrap_text(text, max_chars, max_ln)

            block = f"{idx}\n{start_ts} --> {end_ts}\n{wrapped}\n"
            srt_blocks.append(block)

        return "\n".join(srt_blocks)

    @staticmethod
    def save_srt(segments, output_path, **kwargs):
        """
        Save transcript segments as an SRT file.

        Args:
            segments: list of TranscriptSegment
            output_path: path for the output .srt file
            **kwargs: passed to to_srt()
        """
        srt_content = SubtitleExporter.to_srt(segments, **kwargs)
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(srt_content)
        logger.info(f"SRT saved: {output_path}")

    # ─── VTT Format ──────────────────────────────────────────────────────

    @staticmethod
    def to_vtt(segments, max_chars_per_line=None, max_lines=None,
               max_duration=None, include_speakers=True):
        """
        Convert transcript segments to WebVTT format.

        VTT format specification:
            WEBVTT

            1
            00:00:01.500 --> 00:00:04.200
            First subtitle text line.

            2
            00:00:04.500 --> 00:00:07.800
            <v Speaker1>Second subtitle text.

        Note: VTT uses dots (.) for millisecond separator, not commas.
        VTT supports speaker identification via <v SpeakerName> tags.

        Args:
            segments: list of TranscriptSegment from Whisper
            max_chars_per_line: max characters per line (default: 42)
            max_lines: max lines per subtitle block (default: 2)
            max_duration: max subtitle duration in seconds (default: 7.0)
            include_speakers: include speaker labels via VTT voice tags

        Returns:
            str: complete VTT file content (with WEBVTT header)
        """
        max_chars = max_chars_per_line or SubtitleExporter.DEFAULT_MAX_CHARS_PER_LINE
        max_ln = max_lines or SubtitleExporter.DEFAULT_MAX_LINES
        max_dur = max_duration or SubtitleExporter.DEFAULT_MAX_DURATION

        # Split long segments for readability
        split_segments = SubtitleExporter._split_long_segments(
            segments, max_chars * max_ln, max_dur
        )

        lines = ["WEBVTT", ""]  # VTT header + blank line

        for idx, seg in enumerate(split_segments, start=1):
            # Format timestamps: HH:MM:SS.mmm (VTT uses dot, not comma)
            start_ts = SubtitleExporter._format_timestamp_vtt(seg["start"])
            end_ts = SubtitleExporter._format_timestamp_vtt(seg["end"])

            # Format text with line wrapping
            text = seg["text"]
            if include_speakers and seg.get("speaker"):
                # VTT voice span syntax: <v SpeakerName>text</v>
                text = f"<v {seg['speaker']}>{text}"

            wrapped = SubtitleExporter._wrap_text(text, max_chars, max_ln)

            lines.append(str(idx))
            lines.append(f"{start_ts} --> {end_ts}")
            lines.append(wrapped)
            lines.append("")  # Blank line between cues

        return "\n".join(lines)

    @staticmethod
    def save_vtt(segments, output_path, **kwargs):
        """
        Save transcript segments as a WebVTT file.

        Args:
            segments: list of TranscriptSegment
            output_path: path for the output .vtt file
            **kwargs: passed to to_vtt()
        """
        vtt_content = SubtitleExporter.to_vtt(segments, **kwargs)
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(vtt_content)
        logger.info(f"VTT saved: {output_path}")

    # ─── JSON Format ─────────────────────────────────────────────────────

    @staticmethod
    def to_json(segments, include_words=False):
        """
        Convert transcript segments to a structured JSON dict.

        Useful for programmatic access, custom subtitle rendering,
        or feeding into downstream AI pipelines.

        Args:
            segments: list of TranscriptSegment from Whisper
            include_words: include word-level timestamps in output

        Returns:
            dict with segments, full text, and metadata
        """
        json_segments = []

        for seg in segments:
            entry = {
                "id": seg.id,
                "text": seg.text,
                "start": round(seg.start, 3),
                "end": round(seg.end, 3),
                "duration": round(seg.end - seg.start, 3),
            }

            if seg.speaker:
                entry["speaker"] = seg.speaker

            if include_words and seg.words:
                entry["words"] = [w.to_dict() for w in seg.words]

            if hasattr(seg, "avg_logprob") and seg.avg_logprob:
                entry["avg_logprob"] = round(seg.avg_logprob, 4)

            if hasattr(seg, "no_speech_prob") and seg.no_speech_prob:
                entry["no_speech_prob"] = round(seg.no_speech_prob, 4)

            json_segments.append(entry)

        # Build full text
        full_text = " ".join(s.text for s in segments if s.text)

        # Collect unique speakers
        speakers = sorted(set(
            s.speaker for s in segments if s.speaker
        ))

        return {
            "segments": json_segments,
            "text": full_text,
            "segment_count": len(json_segments),
            "word_count": sum(len(s.text.split()) for s in segments if s.text),
            "speakers": speakers,
            "duration": round(
                max(s.end for s in segments) - min(s.start for s in segments), 3
            ) if segments else 0.0,
        }

    # ─── Word-Level Subtitles ────────────────────────────────────────────

    @staticmethod
    def to_word_srt(segments, words_per_group=5, max_duration=3.0):
        """
        Generate word-level SRT subtitles for karaoke-style display.

        Each subtitle shows a small group of words with precise timing,
        useful for music videos, language learning, and accessibility.

        Args:
            segments: list of TranscriptSegment with word-level timestamps
            words_per_group: number of words per subtitle group (default: 5)
            max_duration: maximum duration per word group (seconds)

        Returns:
            str: SRT content with word-level timing
        """
        # Collect all words from all segments
        all_words = []
        for seg in segments:
            if seg.words:
                for w in seg.words:
                    all_words.append({
                        "word": w.word.strip(),
                        "start": w.start,
                        "end": w.end,
                        "speaker": getattr(seg, "speaker", None),
                    })

        if not all_words:
            logger.warning("No word-level timestamps available for word SRT")
            return SubtitleExporter.to_srt(segments)

        # Group words
        srt_blocks = []
        idx = 1

        for i in range(0, len(all_words), words_per_group):
            group = all_words[i:i + words_per_group]
            if not group:
                continue

            start_time = group[0]["start"]
            end_time = group[-1]["end"]

            # Enforce max duration
            if end_time - start_time > max_duration:
                end_time = start_time + max_duration

            # Ensure minimum duration
            if end_time - start_time < SubtitleExporter.MIN_SUBTITLE_DURATION:
                end_time = start_time + SubtitleExporter.MIN_SUBTITLE_DURATION

            text = " ".join(w["word"] for w in group)

            start_ts = SubtitleExporter._format_timestamp_srt(start_time)
            end_ts = SubtitleExporter._format_timestamp_srt(end_time)

            block = f"{idx}\n{start_ts} --> {end_ts}\n{text}\n"
            srt_blocks.append(block)
            idx += 1

        return "\n".join(srt_blocks)

    @staticmethod
    def to_word_vtt(segments, words_per_group=5, max_duration=3.0):
        """
        Generate word-level VTT subtitles for karaoke-style display.

        Same as to_word_srt() but in WebVTT format.

        Args:
            segments: list of TranscriptSegment with word-level timestamps
            words_per_group: number of words per subtitle group
            max_duration: maximum duration per word group (seconds)

        Returns:
            str: VTT content with word-level timing
        """
        # Collect all words
        all_words = []
        for seg in segments:
            if seg.words:
                for w in seg.words:
                    all_words.append({
                        "word": w.word.strip(),
                        "start": w.start,
                        "end": w.end,
                    })

        if not all_words:
            logger.warning("No word-level timestamps available for word VTT")
            return SubtitleExporter.to_vtt(segments)

        lines = ["WEBVTT", ""]
        idx = 1

        for i in range(0, len(all_words), words_per_group):
            group = all_words[i:i + words_per_group]
            if not group:
                continue

            start_time = group[0]["start"]
            end_time = group[-1]["end"]

            if end_time - start_time > max_duration:
                end_time = start_time + max_duration
            if end_time - start_time < SubtitleExporter.MIN_SUBTITLE_DURATION:
                end_time = start_time + SubtitleExporter.MIN_SUBTITLE_DURATION

            text = " ".join(w["word"] for w in group)

            start_ts = SubtitleExporter._format_timestamp_vtt(start_time)
            end_ts = SubtitleExporter._format_timestamp_vtt(end_time)

            lines.append(str(idx))
            lines.append(f"{start_ts} --> {end_ts}")
            lines.append(text)
            lines.append("")
            idx += 1

        return "\n".join(lines)

    # ─── Timestamp Formatting ────────────────────────────────────────────

    @staticmethod
    def _format_timestamp_srt(seconds):
        """
        Format seconds to SRT timestamp: HH:MM:SS,mmm

        Examples:
            0.0      -> "00:00:00,000"
            65.5     -> "00:01:05,500"
            3723.123 -> "01:02:03,123"
        """
        if seconds < 0:
            seconds = 0.0

        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int(round((seconds % 1) * 1000))

        # Handle rounding to 1000ms
        if millis >= 1000:
            millis = 0
            secs += 1
            if secs >= 60:
                secs = 0
                minutes += 1
                if minutes >= 60:
                    minutes = 0
                    hours += 1

        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    @staticmethod
    def _format_timestamp_vtt(seconds):
        """
        Format seconds to VTT timestamp: HH:MM:SS.mmm

        Same as SRT but uses dot (.) instead of comma (,) for milliseconds.

        Examples:
            0.0      -> "00:00:00.000"
            65.5     -> "00:01:05.500"
            3723.123 -> "01:02:03.123"
        """
        if seconds < 0:
            seconds = 0.0

        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int(round((seconds % 1) * 1000))

        if millis >= 1000:
            millis = 0
            secs += 1
            if secs >= 60:
                secs = 0
                minutes += 1
                if minutes >= 60:
                    minutes = 0
                    hours += 1

        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"

    # ─── Text Helpers ────────────────────────────────────────────────────

    @staticmethod
    def _wrap_text(text, max_chars_per_line, max_lines):
        """
        Wrap text to fit within subtitle line limits.

        Breaks at word boundaries. If a single word exceeds max_chars,
        it's placed on its own line (no mid-word breaks).

        Args:
            text: input text string
            max_chars_per_line: maximum characters per line
            max_lines: maximum number of lines

        Returns:
            str: wrapped text with newlines
        """
        if len(text) <= max_chars_per_line:
            return text

        words = text.split()
        lines = []
        current_line = ""

        for word in words:
            if not current_line:
                current_line = word
            elif len(current_line) + 1 + len(word) <= max_chars_per_line:
                current_line += " " + word
            else:
                lines.append(current_line)
                current_line = word

                # Hit max lines: stuff remaining words into last line
                if len(lines) >= max_lines - 1:
                    remaining_idx = words.index(word)
                    current_line = " ".join(words[remaining_idx:])
                    break

        if current_line:
            lines.append(current_line)

        # Trim to max lines
        lines = lines[:max_lines]

        return "\n".join(lines)

    @staticmethod
    def _split_long_segments(segments, max_chars, max_duration):
        """
        Split segments that exceed character or duration limits.

        Produces smaller subtitle-sized chunks while preserving timing
        proportionally.

        Args:
            segments: list of TranscriptSegment (or dicts with text/start/end/speaker)
            max_chars: maximum total characters per subtitle block
            max_duration: maximum duration in seconds per subtitle block

        Returns:
            list of dicts with text, start, end, speaker keys
        """
        result = []

        for seg in segments:
            # Handle both TranscriptSegment objects and dicts
            text = seg.text if hasattr(seg, "text") else seg.get("text", "")
            start = seg.start if hasattr(seg, "start") else seg.get("start", 0)
            end = seg.end if hasattr(seg, "end") else seg.get("end", 0)
            speaker = (
                seg.speaker if hasattr(seg, "speaker") else seg.get("speaker")
            )
            duration = end - start

            # Segment fits within limits
            if len(text) <= max_chars and duration <= max_duration:
                result.append({
                    "text": text,
                    "start": start,
                    "end": end,
                    "speaker": speaker,
                })
                continue

            # Need to split -- try word-level splitting first
            if hasattr(seg, "words") and seg.words:
                # Word-level split: use actual word timestamps
                word_chunks = SubtitleExporter._split_by_words(
                    seg.words, max_chars, max_duration, speaker
                )
                result.extend(word_chunks)
            else:
                # No word timestamps: split text evenly by estimated timing
                text_chunks = SubtitleExporter._split_by_text(
                    text, start, end, max_chars, max_duration, speaker
                )
                result.extend(text_chunks)

        return result

    @staticmethod
    def _split_by_words(words, max_chars, max_duration, speaker=None):
        """
        Split a segment's words into subtitle-sized chunks using word timestamps.

        This produces the most accurate subtitle timing since each word
        has its own start/end time from Whisper.

        Args:
            words: list of WordSegment objects
            max_chars: max characters per chunk
            max_duration: max duration per chunk (seconds)
            speaker: speaker label (if any)

        Returns:
            list of dicts with text, start, end, speaker
        """
        chunks = []
        current_words = []
        current_chars = 0

        for word in words:
            word_text = word.word.strip()
            word_len = len(word_text) + (1 if current_words else 0)  # +1 for space

            # Check if adding this word exceeds limits
            would_exceed_chars = (current_chars + word_len) > max_chars
            would_exceed_duration = (
                current_words and
                (word.end - current_words[0].start) > max_duration
            )

            if current_words and (would_exceed_chars or would_exceed_duration):
                # Flush current chunk
                chunks.append({
                    "text": " ".join(w.word.strip() for w in current_words),
                    "start": current_words[0].start,
                    "end": current_words[-1].end,
                    "speaker": speaker,
                })
                current_words = []
                current_chars = 0

            current_words.append(word)
            current_chars += word_len

        # Flush remaining words
        if current_words:
            chunks.append({
                "text": " ".join(w.word.strip() for w in current_words),
                "start": current_words[0].start,
                "end": current_words[-1].end,
                "speaker": speaker,
            })

        return chunks

    @staticmethod
    def _split_by_text(text, start, end, max_chars, max_duration, speaker=None):
        """
        Split a segment by text when word-level timestamps aren't available.

        Estimates timing proportionally based on character count.
        Tries to break at sentence boundaries first, then word boundaries.

        Args:
            text: full segment text
            start: segment start time (seconds)
            end: segment end time (seconds)
            max_chars: max characters per chunk
            max_duration: max duration per chunk (seconds)
            speaker: speaker label (if any)

        Returns:
            list of dicts with text, start, end, speaker
        """
        duration = end - start
        if not text or duration <= 0:
            return [{"text": text, "start": start, "end": end, "speaker": speaker}]

        # Try to split at sentence boundaries first
        sentences = SubtitleExporter._split_at_sentences(text)

        chunks = []
        current_text = ""
        total_chars = len(text)

        for sentence in sentences:
            if not current_text:
                current_text = sentence
            elif len(current_text) + 1 + len(sentence) <= max_chars:
                current_text += " " + sentence
            else:
                # Calculate proportional timing
                char_fraction = len(current_text) / total_chars
                chunk_duration = duration * char_fraction

                # Check duration limit
                if chunk_duration > max_duration:
                    # Further split by words
                    word_chunks = SubtitleExporter._split_text_by_words(
                        current_text, max_chars
                    )
                    for wc in word_chunks:
                        wc_fraction = len(wc) / total_chars
                        wc_duration = duration * wc_fraction
                        wc_start = start + (sum(len(c["text"]) for c in chunks) / total_chars) * duration
                        chunks.append({
                            "text": wc,
                            "start": wc_start,
                            "end": wc_start + wc_duration,
                            "speaker": speaker,
                        })
                else:
                    progress = sum(len(c["text"]) for c in chunks) / total_chars
                    chunk_start = start + progress * duration
                    chunks.append({
                        "text": current_text,
                        "start": chunk_start,
                        "end": chunk_start + chunk_duration,
                        "speaker": speaker,
                    })
                current_text = sentence

        # Flush remaining
        if current_text:
            progress = sum(len(c["text"]) for c in chunks) / total_chars if chunks else 0
            chunk_start = start + progress * duration
            chunks.append({
                "text": current_text,
                "start": chunk_start,
                "end": end,
                "speaker": speaker,
            })

        return chunks

    @staticmethod
    def _split_at_sentences(text):
        """
        Split text at sentence boundaries.

        Handles common sentence-ending punctuation: . ! ? ; :
        Preserves punctuation with the preceding sentence.

        Args:
            text: input text

        Returns:
            list of sentence strings
        """
        import re
        # Split at sentence boundaries, keeping the delimiter with the sentence
        parts = re.split(r'(?<=[.!?;])\s+', text)
        return [p.strip() for p in parts if p.strip()]

    @staticmethod
    def _split_text_by_words(text, max_chars):
        """
        Split text into chunks of max_chars at word boundaries.

        Args:
            text: input text
            max_chars: max characters per chunk

        Returns:
            list of text chunks
        """
        words = text.split()
        chunks = []
        current = ""

        for word in words:
            if not current:
                current = word
            elif len(current) + 1 + len(word) <= max_chars:
                current += " " + word
            else:
                chunks.append(current)
                current = word

        if current:
            chunks.append(current)

        return chunks
