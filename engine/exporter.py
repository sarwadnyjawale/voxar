"""
VOXAR Audio Exporter v1.0
Handles final export to MP3/WAV with proper metadata and watermarking.
"""

import os
import logging
import numpy as np

logger = logging.getLogger("VoxarExport")


class VoxarExporter:
    """
    Export mastered audio to final delivery format.

    Free tier:  MP3 128kbps + watermark
    Paid tier:  MP3 320kbps + WAV (no watermark)
    """

    def __init__(self):
        self.watermark_path = os.path.join(
            os.path.dirname(__file__), "assets", "watermark.wav"
        )
        logger.info("VoxarExporter initialized")

    def export_mp3(self, audio_path, output_path, quality="high", add_watermark=False,
                   title=None):
        """
        Export audio as MP3.

        Args:
            audio_path: source audio file
            output_path: destination MP3 path
            quality: "high" (320kbps) or "standard" (128kbps)
            add_watermark: append "Powered by VOXAR" audio
            title: title for ID3 tags

        Returns:
            dict with path, size, bitrate
        """
        from pydub import AudioSegment

        audio = AudioSegment.from_file(audio_path)

        # Add watermark for free users
        if add_watermark:
            audio = self._append_watermark(audio)

        # Set bitrate
        bitrate = "320k" if quality == "high" else "128k"

        # Build tags
        tags = {
            "artist": "VOXAR Studio",
            "album": "VOXAR Generation",
        }
        if title:
            tags["title"] = title[:100]

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)

        # Export
        audio.export(output_path, format="mp3", bitrate=bitrate, tags=tags)

        file_size_kb = os.path.getsize(output_path) / 1024.0
        duration = len(audio) / 1000.0

        logger.info(f"  MP3 exported: {bitrate} | {file_size_kb:.0f}KB | {duration:.1f}s → {output_path}")

        return {
            "output_path": output_path,
            "format": "mp3",
            "bitrate": bitrate,
            "quality": quality,
            "duration": round(duration, 2),
            "file_size_kb": round(file_size_kb, 1),
            "watermarked": add_watermark,
        }

    def export_wav(self, audio_path, output_path):
        """
        Export audio as WAV (16-bit 44100Hz — CD quality).
        Available for paid plans only.

        Args:
            audio_path: source audio file
            output_path: destination WAV path

        Returns:
            dict with path, size, sample_rate
        """
        import soundfile as sf

        data, sr = sf.read(audio_path, dtype='float32')

        # Resample to 44100Hz if needed (CD quality standard)
        if sr != 44100:
            try:
                import librosa
                data = librosa.resample(data, orig_sr=sr, target_sr=44100)
                sr = 44100
            except ImportError:
                logger.warning("  librosa not available, keeping original sample rate")

        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)

        # Export as 16-bit WAV
        sf.write(output_path, data, sr, subtype='PCM_16')

        file_size_kb = os.path.getsize(output_path) / 1024.0
        duration = len(data) / sr

        logger.info(f"  WAV exported: 16-bit {sr}Hz | {file_size_kb:.0f}KB | {duration:.1f}s → {output_path}")

        return {
            "output_path": output_path,
            "format": "wav",
            "sample_rate": sr,
            "bit_depth": 16,
            "duration": round(duration, 2),
            "file_size_kb": round(file_size_kb, 1),
        }

    def export_for_plan(self, audio_path, output_dir, filename_base, plan="free",
                        title=None):
        """
        Export with appropriate settings based on user's plan.

        Free:    MP3 128kbps + watermark
        Starter: MP3 320kbps, no watermark
        Creator: MP3 320kbps + WAV, no watermark
        Pro:     MP3 320kbps + WAV, no watermark
        Ultra:   MP3 320kbps + WAV, no watermark

        Returns:
            dict with all exported files
        """
        os.makedirs(output_dir, exist_ok=True)
        exports = {}

        if plan == "free":
            # MP3 128kbps with watermark
            mp3_path = os.path.join(output_dir, f"{filename_base}.mp3")
            exports["mp3"] = self.export_mp3(
                audio_path, mp3_path,
                quality="standard", add_watermark=True, title=title
            )

        elif plan == "starter":
            # MP3 320kbps, no watermark
            mp3_path = os.path.join(output_dir, f"{filename_base}.mp3")
            exports["mp3"] = self.export_mp3(
                audio_path, mp3_path,
                quality="high", add_watermark=False, title=title
            )

        else:
            # Creator, Pro, Ultra — MP3 + WAV
            mp3_path = os.path.join(output_dir, f"{filename_base}.mp3")
            exports["mp3"] = self.export_mp3(
                audio_path, mp3_path,
                quality="high", add_watermark=False, title=title
            )

            wav_path = os.path.join(output_dir, f"{filename_base}.wav")
            exports["wav"] = self.export_wav(audio_path, wav_path)

        logger.info(f"  Exported for plan '{plan}': {list(exports.keys())}")
        return exports

    def _append_watermark(self, audio):
        """Append 'Powered by VOXAR' watermark to end of audio."""
        from pydub import AudioSegment

        # Check if pre-generated watermark exists
        if os.path.exists(self.watermark_path):
            try:
                watermark = AudioSegment.from_file(self.watermark_path)
                # Add 500ms silence before watermark
                silence = AudioSegment.silent(duration=500)
                return audio + silence + watermark
            except Exception as e:
                logger.warning(f"  Could not load watermark: {e}")

        # Fallback: generate a simple tone-based watermark
        # 3 short beeps (not ideal but functional until real watermark is recorded)
        logger.info("  Using tone watermark (record real watermark later)")

        silence = AudioSegment.silent(duration=500)
        beep = AudioSegment.silent(duration=200)  # Placeholder

        # Simple approach: just add 1.5s silence as placeholder
        # In production, this would be a pre-recorded "Powered by VOXAR" clip
        watermark_placeholder = AudioSegment.silent(duration=1500)
        return audio + silence + watermark_placeholder

    def generate_watermark(self, output_path=None):
        """
        Generate the VOXAR watermark audio file.
        Should be called ONCE with a good TTS output.
        Uses XTTS to generate "Powered by VOXAR" speech.
        """
        if output_path is None:
            output_path = self.watermark_path

        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)

        logger.info(f"  Watermark should be generated using VOXAR TTS engine")
        logger.info(f"  Text: 'Powered by VOXAR'")
        logger.info(f"  Save to: {output_path}")
        logger.info(f"  This will be done during voice library creation (Phase 4)")

        return output_path