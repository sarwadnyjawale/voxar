"""
VOXAR Engine Router v1.2
Central router that manages hot-swapping between XTTS, MMS, OpenVoice, and Whisper engines.

Routing rules (TTS):
  - XTTS: English, Hindi, + all XTTS-supported languages (voice cloning)
  - MMS + OpenVoice: Tamil, Telugu, Bengali, Kannada, Malayalam, Gujarati, Punjabi, Odia

Routing rules (STT):
  - Whisper (faster-whisper): All 99 languages, transcription + translation
  - Diarizer (pyannote.audio): Speaker identification (optional)

Regional language pipeline (Approach B):
  1. Unload XTTS (free ~2GB VRAM)
  2. Load MMS -> generate audio with perfect native pronunciation
  3. Unload MMS
  4. Load OpenVoice -> transfer reference voice identity onto MMS output
  5. Unload OpenVoice -> reload XTTS (primary engine stays warm)

STT pipeline (Phase 7):
  1. Unload XTTS (free ~2GB VRAM)
  2. Load Whisper -> transcribe/translate audio
  3. Optionally load diarizer -> identify speakers
  4. Merge diarization with transcript
  5. Unload Whisper + diarizer -> reload XTTS

RULES:
  - This module must NEVER contain credit/billing/API logic
  - GPU lock prevents concurrent access during model swaps
  - XTTS is the primary engine -- always reload after MMS/Whisper usage
  - Never load XTTS and MMS/Whisper simultaneously (hot-swap only)
"""

import os
import time
import logging
import threading

logger = logging.getLogger("VoxarRouter")


class EngineRouter:
    """
    Routes TTS/STT between XTTS, MMS, OpenVoice, and Whisper engines.

    Drop-in replacement for VoxarTTSEngine -- same generate() signature.
    Also provides transcribe() for Speech-to-Text with optional diarization.

    TTS routing:
      - XTTS languages: direct voice cloning
      - MMS languages: MMS (pronunciation) + OpenVoice (voice identity)

    STT routing:
      - Whisper: transcription/translation for 99 languages
      - Pyannote: speaker diarization (optional, requires HF token)

    Usage:
        from engine.tts_engine import VoxarTTSEngine
        from engine.engine_router import EngineRouter

        xtts = VoxarTTSEngine()
        router = EngineRouter(xtts_engine=xtts)

        # TTS
        result = router.generate("Hello", speaker_wav="voice.wav", language="en")

        # STT
        result = router.transcribe("audio.wav", diarize=True)
    """

    # Languages routed to MMS (no XTTS support)
    MMS_LANGUAGES = {"ta", "te", "bn", "mr", "kn", "ml", "gu", "pa", "or"}

    def __init__(self, xtts_engine, mms_engine=None, openvoice_engine=None,
                 auto_reload_xtts=True, se_cache_dir=None,
                 whisper_model_size="large-v3", whisper_compute_type="int8",
                 hf_token=None):
        """
        Args:
            xtts_engine: VoxarTTSEngine instance (must be pre-initialized with model loaded)
            mms_engine: VoxarMMSEngine instance (created lazily if not provided)
            openvoice_engine: VoxarOpenVoiceEngine instance (created lazily if not provided)
            auto_reload_xtts: if True, reload XTTS automatically after MMS/Whisper generation
            se_cache_dir: directory for caching speaker embeddings on disk
            whisper_model_size: Whisper model size (default: large-v3)
            whisper_compute_type: Whisper quantization (default: int8)
            hf_token: HuggingFace token for pyannote diarization (optional)
        """
        self.xtts = xtts_engine
        self.auto_reload_xtts = auto_reload_xtts
        self._se_cache_dir = se_cache_dir

        # Whisper / diarization config
        self._whisper_model_size = whisper_model_size
        self._whisper_compute_type = whisper_compute_type
        self._hf_token = hf_token or os.getenv("HF_TOKEN", "")

        # Lazy-init MMS engine
        if mms_engine is not None:
            self.mms = mms_engine
        else:
            self._mms = None  # Lazily created on first MMS request

        # Lazy-init OpenVoice engine
        if openvoice_engine is not None:
            self.openvoice = openvoice_engine
        else:
            self._openvoice = None  # Lazily created on first conversion request

        # Lazy-init Whisper engine (STT)
        self._whisper = None

        # Lazy-init Diarizer
        self._diarizer = None

        self._active_engine = "xtts" if xtts_engine.is_model_loaded else None
        self._gpu_lock = threading.Lock()

        logger.info(
            f"EngineRouter initialized: XTTS={'loaded' if self._active_engine == 'xtts' else 'unloaded'} | "
            f"MMS=lazy | OpenVoice=lazy | Whisper=lazy | auto_reload_xtts={auto_reload_xtts}"
        )

    @property
    def mms(self):
        """Lazy-init MMS engine on first access."""
        if self._mms is None:
            from engine.mms_engine import VoxarMMSEngine
            self._mms = VoxarMMSEngine(output_dir=str(self.xtts.output_dir))
            logger.info("MMS engine created (lazy init)")
        return self._mms

    @mms.setter
    def mms(self, value):
        self._mms = value

    @property
    def openvoice(self):
        """Lazy-init OpenVoice engine on first access."""
        if self._openvoice is None:
            from engine.openvoice_engine import VoxarOpenVoiceEngine
            self._openvoice = VoxarOpenVoiceEngine(se_cache_dir=self._se_cache_dir)
            logger.info("OpenVoice engine created (lazy init)")
        return self._openvoice

    @openvoice.setter
    def openvoice(self, value):
        self._openvoice = value

    @property
    def whisper(self):
        """Lazy-init Whisper STT engine on first access."""
        if self._whisper is None:
            from engine.whisper_engine import VoxarWhisperEngine
            self._whisper = VoxarWhisperEngine(
                model_size=self._whisper_model_size,
                compute_type=self._whisper_compute_type,
            )
            logger.info("Whisper engine created (lazy init)")
        return self._whisper

    @property
    def diarizer(self):
        """Lazy-init diarizer on first access."""
        if self._diarizer is None:
            from engine.diarizer import VoxarDiarizer
            self._diarizer = VoxarDiarizer(hf_token=self._hf_token)
            logger.info("Diarizer created (lazy init)")
        return self._diarizer

    @property
    def is_diarization_available(self):
        """Check if speaker diarization is configured and available."""
        return self.diarizer.is_available

    @property
    def is_model_loaded(self):
        """Check if the primary (XTTS) model is loaded."""
        return self.xtts.is_model_loaded

    def _route_language(self, language):
        """
        Determine which engine handles this language.

        Returns:
            "xtts" or "mms"
        """
        if language in self.MMS_LANGUAGES:
            return "mms"
        return "xtts"

    def generate(self, text, speaker_wav=None, language="en", mode="flash",
                 speed=None, output_filename=None):
        """
        Generate speech with automatic engine routing.

        Same signature as VoxarTTSEngine.generate() — drop-in replacement.

        For XTTS languages: uses XTTS with voice cloning (speaker_wav).
        For MMS languages: hot-swaps to MMS → generates → OpenVoice voice conversion.

        Args:
            text: input text
            speaker_wav: reference voice audio (XTTS: voice cloning, MMS: OpenVoice conversion)
            language: language code
            mode: TTS mode (XTTS only)
            speed: speed multiplier
            output_filename: custom output filename

        Returns:
            dict with output_path, duration, characters, etc.
        """
        engine_choice = self._route_language(language)

        if engine_choice == "xtts":
            return self._generate_xtts(text, speaker_wav, language, mode,
                                       speed, output_filename)
        else:
            return self._generate_mms(text, language, speed, output_filename,
                                      speaker_wav=speaker_wav)

    def _generate_xtts(self, text, speaker_wav, language, mode, speed,
                       output_filename):
        """Generate via XTTS engine."""
        with self._gpu_lock:
            # Ensure XTTS is loaded
            if not self.xtts.is_model_loaded:
                logger.info("Router: reloading XTTS for generation...")
                self.xtts.reload_model()
                self._active_engine = "xtts"

        # XTTS generate() has its own _gpu_lock, so we don't double-lock
        result = self.xtts.generate(
            text=text,
            speaker_wav=speaker_wav,
            language=language,
            mode=mode,
            speed=speed,
            output_filename=output_filename,
        )
        result["engine"] = "xtts"
        return result

    def _generate_mms(self, text, language, speed, output_filename,
                      speaker_wav=None):
        """
        Generate via MMS engine with optional OpenVoice voice conversion.

        Approach B regional language pipeline:
        1. Unload XTTS (free ~2GB VRAM)
        2. Load MMS → generate audio with native pronunciation
        3. Unload MMS
        4. If speaker_wav provided: Load OpenVoice → convert voice identity → unload
        5. Reload XTTS (if auto_reload_xtts=True)

        If no speaker_wav is provided, returns raw MMS audio (default MMS voice).
        """
        with self._gpu_lock:
            swap_start = time.time()

            # Step 1: Unload XTTS to free VRAM
            if self.xtts.is_model_loaded:
                logger.info("Router: unloading XTTS for MMS hot-swap...")
                self.xtts.unload_model()
                self._active_engine = None

            # Step 2: Load MMS and generate pronunciation-correct audio
            mms_output_filename = output_filename
            if speaker_wav and output_filename:
                # Use a temp name for MMS output — final output comes from OpenVoice
                mms_output_filename = f"_mms_temp_{output_filename}"

            try:
                result = self.mms.generate(
                    text=text,
                    language=language,
                    speed=speed,
                    output_filename=mms_output_filename,
                )
            except Exception as e:
                logger.error(f"MMS generation failed: {e}")
                if self.auto_reload_xtts:
                    self._reload_xtts_safe()
                raise

            # Step 3: Unload MMS to free VRAM for OpenVoice
            if self.mms.is_model_loaded:
                logger.info("Router: unloading MMS after generation...")
                self.mms.unload_model()

            # Step 4: Voice conversion via OpenVoice (if reference voice provided)
            if speaker_wav:
                try:
                    mms_output_path = result["output_path"]

                    # Determine final output path
                    if output_filename:
                        final_output = str(self.xtts.output_dir / output_filename)
                    else:
                        # Replace _mms_ prefix with _ov_ in the filename
                        final_output = mms_output_path.replace(
                            "voxar_mms_", "voxar_ov_"
                        )

                    # Derive voice_id from speaker_wav filename for SE caching
                    # e.g., "voices/embeddings/v001_aisha.wav" → "v001"
                    voice_id = self._extract_voice_id(speaker_wav)

                    logger.info(
                        f"Router: OpenVoice conversion "
                        f"(voice={voice_id or 'unknown'})..."
                    )

                    ov_result = self.openvoice.convert(
                        source_audio=mms_output_path,
                        reference_audio=speaker_wav,
                        output_path=final_output,
                        voice_id=voice_id,
                    )

                    # Clean up MMS temp file
                    if os.path.exists(mms_output_path) and mms_output_path != final_output:
                        try:
                            os.remove(mms_output_path)
                        except OSError:
                            pass

                    # Merge results
                    result["output_path"] = ov_result["output_path"]
                    result["duration"] = ov_result["duration"]
                    result["file_size_kb"] = ov_result["file_size_kb"]
                    result["engine"] = "mms+openvoice"
                    result["voice_id"] = voice_id
                    result["conversion_time"] = ov_result["conversion_time"]
                    result["quality_notes"].append(
                        "Voice cloned via OpenVoice (Approach B)"
                    )

                except Exception as e:
                    logger.error(f"OpenVoice conversion failed: {e}")
                    # Fall back to raw MMS output (no voice cloning)
                    result["quality_notes"].append(
                        f"OpenVoice failed ({e}) — using raw MMS voice"
                    )
                finally:
                    # Always unload OpenVoice after conversion
                    if self._openvoice is not None and self.openvoice.is_model_loaded:
                        logger.info("Router: unloading OpenVoice after conversion...")
                        self.openvoice.unload_model()

            # Step 5: Reload XTTS
            if self.auto_reload_xtts:
                self._reload_xtts_safe()

            swap_time = time.time() - swap_start
            engine_label = result.get("engine", "mms")
            logger.info(
                f"Router: {engine_label} round-trip completed in {swap_time:.1f}s "
                f"(includes model swaps)"
            )

        return result

    @staticmethod
    def _extract_voice_id(speaker_wav):
        """
        Extract voice_id from a speaker WAV filename.

        Examples:
            "voices/embeddings/v001_aisha.wav" → "v001"
            "v012_vikram.wav" → "v012"
            "random_file.wav" → None
        """
        import re
        basename = os.path.basename(str(speaker_wav))
        match = re.match(r"(v\d{3})_", basename)
        return match.group(1) if match else None

    def _reload_xtts_safe(self):
        """Reload XTTS with error handling."""
        try:
            logger.info("Router: reloading XTTS (primary engine)...")
            self.xtts.reload_model()
            self._active_engine = "xtts"
        except Exception as e:
            logger.error(f"Failed to reload XTTS: {e}")
            self._active_engine = None

    def get_active_engine(self):
        """Get the currently active engine name."""
        return self._active_engine

    def get_supported_languages(self):
        """Get all supported languages across both engines."""
        xtts_langs = set(self.xtts.xtts_languages) if self.xtts.is_model_loaded else set()
        mms_langs = set(self.MMS_LANGUAGES)
        return {
            "xtts": sorted(xtts_langs),
            "mms": sorted(mms_langs),
            "all": sorted(xtts_langs | mms_langs),
        }

    def get_engine_for_language(self, language):
        """Get which engine will handle a given language."""
        return self._route_language(language)

    def get_gpu_info(self):
        """Get GPU info from the XTTS engine."""
        return self.xtts.get_gpu_info()

    # ─── Speech-to-Text (Phase 7) ────────────────────────────────────────

    def transcribe(self, audio_path, language=None, task="transcribe",
                   diarize=False, word_timestamps=True, beam_size=5,
                   initial_prompt=None, num_speakers=None,
                   min_speakers=None, max_speakers=None):
        """
        Transcribe or translate an audio file with optional speaker diarization.

        Hot-swap protocol:
          1. Unload XTTS (free ~2GB VRAM)
          2. Load Whisper (faster-whisper, ~1GB) -> transcribe/translate
          3. If diarize=True: Load pyannote (~0.5GB) -> identify speakers
          4. Merge diarization with transcript
          5. Generate subtitles (SRT/VTT) from segments
          6. Unload all STT models -> reload XTTS

        Args:
            audio_path: path to audio file (WAV, MP3, FLAC, etc.)
            language: language code (None = auto-detect). Use ISO 639-1 codes.
            task: "transcribe" (keep original language) or
                  "translate" (translate to English)
            diarize: if True, perform speaker diarization (requires pyannote + HF token)
            word_timestamps: include word-level timestamps (recommended for subtitles)
            beam_size: beam search width (higher = better quality, slower)
            initial_prompt: optional context prompt to guide Whisper
            num_speakers: exact number of speakers (for diarization)
            min_speakers: minimum speakers (for diarization auto-detect)
            max_speakers: maximum speakers (for diarization auto-detect)

        Returns:
            dict with:
              - transcription: TranscriptionResult with segments, text, language, etc.
              - diarization: DiarizationResult (or None if diarize=False)
              - subtitles: dict with srt and vtt content strings
              - processing_time: total wall-clock time including model swaps
        """
        import torch

        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        with self._gpu_lock:
            swap_start = time.time()

            # ── Step 1: Unload XTTS to free VRAM ──
            if self.xtts.is_model_loaded:
                logger.info("Router: unloading XTTS for Whisper STT hot-swap...")
                self.xtts.unload_model()
                self._active_engine = None

            transcription_result = None
            diarization_result = None

            try:
                # ── Step 2: Load Whisper and transcribe ──
                logger.info(
                    f"Router: starting Whisper {task} | "
                    f"lang={'auto' if not language else language} | "
                    f"diarize={diarize}"
                )

                self.whisper.load_model()
                self._active_engine = "whisper"

                transcription_result = self.whisper.transcribe(
                    audio_path=audio_path,
                    language=language,
                    task=task,
                    beam_size=beam_size,
                    word_timestamps=word_timestamps,
                    initial_prompt=initial_prompt,
                )

                # Unload Whisper before loading diarizer (VRAM management)
                logger.info("Router: unloading Whisper after transcription...")
                self.whisper.unload_model()
                self._active_engine = None

                # ── Step 3: Diarization (optional) ──
                if diarize:
                    if self.diarizer.is_available:
                        logger.info("Router: starting speaker diarization...")

                        self.diarizer.load_model()
                        self._active_engine = "diarizer"

                        diarization_result = self.diarizer.diarize(
                            audio_path=audio_path,
                            num_speakers=num_speakers,
                            min_speakers=min_speakers,
                            max_speakers=max_speakers,
                        )

                        # ── Step 4: Merge diarization with transcript ──
                        if diarization_result and diarization_result.segments:
                            self.diarizer.merge_with_transcript(
                                diarization_segments=diarization_result.segments,
                                transcript_segments=transcription_result.segments,
                            )
                            transcription_result.diarized = True

                            logger.info(
                                f"Router: diarization merged | "
                                f"{diarization_result.num_speakers} speakers identified"
                            )

                        # Unload diarizer
                        logger.info("Router: unloading diarizer...")
                        self.diarizer.unload_model()
                        self._active_engine = None

                    else:
                        logger.warning(
                            f"Router: diarization requested but not available: "
                            f"{self.diarizer.unavailable_reason}"
                        )

                # ── Step 5: Generate subtitles ──
                from engine.subtitle_exporter import SubtitleExporter

                subtitles = {
                    "srt": SubtitleExporter.to_srt(
                        transcription_result.segments,
                        include_speakers=diarize and transcription_result.diarized,
                    ),
                    "vtt": SubtitleExporter.to_vtt(
                        transcription_result.segments,
                        include_speakers=diarize and transcription_result.diarized,
                    ),
                    "json": SubtitleExporter.to_json(
                        transcription_result.segments,
                        include_words=word_timestamps,
                    ),
                }

                # Word-level subtitles if word timestamps are available
                if word_timestamps and any(s.words for s in transcription_result.segments):
                    subtitles["word_srt"] = SubtitleExporter.to_word_srt(
                        transcription_result.segments
                    )
                    subtitles["word_vtt"] = SubtitleExporter.to_word_vtt(
                        transcription_result.segments
                    )

            except Exception as e:
                logger.error(f"Router: STT pipeline failed: {e}")
                # Ensure models are unloaded on error
                if self._whisper is not None and self.whisper.is_model_loaded:
                    self.whisper.unload_model()
                if self._diarizer is not None and self.diarizer.is_model_loaded:
                    self.diarizer.unload_model()
                self._active_engine = None

                # Reload XTTS before re-raising
                if self.auto_reload_xtts:
                    self._reload_xtts_safe()
                raise

            # ── Step 6: Reload XTTS ──
            if self.auto_reload_xtts:
                self._reload_xtts_safe()

            total_time = time.time() - swap_start
            logger.info(
                f"Router: STT pipeline completed in {total_time:.1f}s "
                f"(includes model swaps) | "
                f"{len(transcription_result.segments)} segments | "
                f"lang={transcription_result.detected_language} | "
                f"diarized={transcription_result.diarized}"
            )

        return {
            "transcription": transcription_result,
            "diarization": diarization_result,
            "subtitles": subtitles,
            "processing_time": round(total_time, 2),
        }
