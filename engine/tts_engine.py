"""
VOXAR TTS Engine
Core wrapper around XTTS v2 with intelligent configuration,
chunking, and quality management.
"""

import os
import sys
import time
import json
import torch
import logging
import threading
import uuid
import shutil
from pathlib import Path
from datetime import datetime

os.makedirs('logs', exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('logs/voxar_engine.log', mode='a', encoding='utf-8')
    ]
)
logger = logging.getLogger("VoxarEngine")


class VoxarTTSEngine:
    """
    VOXAR Text-to-Speech Engine (XTTS v2 Wrapper)
    
    Key discovery: XTTS v2 has a bug where passing extra generation
    parameters (temperature, top_k, top_p, etc.) causes KeyError
    for Hindi language. Direct calls without these params work fine.
    
    Solution: For Hindi, use simplified call without advanced params.
    For all other XTTS languages, use full params for quality control.
    """

    SAMPLE_RATE = 24000

    # Languages where XTTS v2 crashes with extra params (temperature, top_k, etc.)
    # These work fine with basic tts_to_file() call
    XTTS_BASIC_ONLY_LANGUAGES = {"hi"}

    # Languages not supported by XTTS v2 at all
    UNSUPPORTED_LANGUAGES = {"ta", "te", "bn", "mr", "kn", "ml", "gu", "pa", "or"}

    LANGUAGE_NAMES = {
        "en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
        "bn": "Bengali", "mr": "Marathi", "kn": "Kannada", "ml": "Malayalam",
        "gu": "Gujarati", "pa": "Punjabi", "or": "Odia",
        "es": "Spanish", "fr": "French", "de": "German", "it": "Italian",
        "pt": "Portuguese", "pl": "Polish", "tr": "Turkish", "ru": "Russian",
        "nl": "Dutch", "cs": "Czech", "ar": "Arabic", "zh-cn": "Chinese",
        "hu": "Hungarian", "ko": "Korean", "ja": "Japanese",
    }

    def __init__(self, output_dir="output", configs_dir="engine/configs"):
        self.output_dir = Path(output_dir)
        self.configs_dir = Path(configs_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Device: {self.device}")

        if self.device == "cuda":
            gpu_info = self.get_gpu_info()
            logger.info(f"GPU: {gpu_info['gpu_name']}")
            logger.info(f"VRAM: {gpu_info['vram_total_gb']} GB total")

        logger.info("Loading XTTS v2 model... (this takes 15-30 seconds)")
        load_start = time.time()

        from TTS.api import TTS
        self.model = TTS(
            "tts_models/multilingual/multi-dataset/xtts_v2",
            gpu=(self.device == "cuda")
        )

        load_time = time.time() - load_start
        logger.info(f"Model loaded in {load_time:.1f} seconds")

        if self.device == "cuda":
            gpu_after = self.get_gpu_info()
            logger.info(f"VRAM after model load: {gpu_after['vram_used_gb']} GB used")

        # Get supported languages from model
        self.xtts_languages = list(self.model.languages)
        logger.info(f"XTTS v2 languages: {self.xtts_languages}")

        # All languages VOXAR supports
        self.all_supported_languages = (
            set(self.xtts_languages) | self.UNSUPPORTED_LANGUAGES
        )
        logger.info(f"Total VOXAR languages: {len(self.all_supported_languages)}")

        # Load configs
        self.configs = self._load_configs()
        logger.info(f"Loaded {len(self.configs)} modes: {list(self.configs.keys())}")

        # Chunker
        from engine.text_chunker import TextChunker, AudioConcatenator
        self.chunker_class = TextChunker
        self.concatenator = AudioConcatenator()

        # MMS engine placeholder
        self.mms_engine = None

        # Model lifecycle state
        self._model_loaded = True

        # GPU concurrency guard — prevents OOM from parallel inference
        self._gpu_lock = threading.Lock()

        logger.info("=" * 50)
        logger.info("VOXAR TTS ENGINE READY")
        logger.info("=" * 50)

    # ========================================
    # MODEL LIFECYCLE
    # ========================================

    @property
    def is_model_loaded(self):
        """Check if the XTTS model is currently loaded in memory."""
        return self._model_loaded and self.model is not None

    def unload_model(self):
        """Unload XTTS model from GPU/CPU memory. Required for MMS hot-swapping."""
        if not self._model_loaded:
            logger.warning("Model already unloaded")
            return

        vram_before = None
        if self.device == "cuda":
            vram_before = self.get_gpu_info()

        # Release model reference
        del self.model
        self.model = None
        self._model_loaded = False

        # Force VRAM cleanup
        if self.device == "cuda":
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
            vram_after = self.get_gpu_info()
            freed = round(vram_before["vram_used_gb"] - vram_after["vram_used_gb"], 2)
            logger.info(f"Model unloaded. VRAM freed: ~{freed} GB "
                        f"(used: {vram_after['vram_used_gb']} GB)")
        else:
            logger.info("Model unloaded from CPU")

    def reload_model(self):
        """Reload the XTTS model. Call after unload_model() to restore generation."""
        if self._model_loaded and self.model is not None:
            logger.warning("Model already loaded")
            return

        logger.info("Reloading XTTS v2 model...")
        load_start = time.time()

        from TTS.api import TTS
        self.model = TTS(
            "tts_models/multilingual/multi-dataset/xtts_v2",
            gpu=(self.device == "cuda")
        )

        load_time = time.time() - load_start
        self._model_loaded = True
        self.xtts_languages = list(self.model.languages)

        logger.info(f"Model reloaded in {load_time:.1f} seconds")
        if self.device == "cuda":
            gpu_info = self.get_gpu_info()
            logger.info(f"VRAM after reload: {gpu_info['vram_used_gb']} GB used")

    def _load_configs(self):
        configs = {}
        configs_path = Path(self.configs_dir)
        if not configs_path.exists():
            configs["flash"] = self._default_config()
            return configs

        for config_file in configs_path.glob("*.json"):
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    configs[config.get("id", config_file.stem)] = config
            except Exception as e:
                logger.error(f"Failed to load config {config_file}: {e}")

        if not configs:
            configs["flash"] = self._default_config()
        return configs

    def _default_config(self):
        return {
            "id": "flash", "name": "Default",
            "temperature": 0.75, "length_penalty": 1.0,
            "repetition_penalty": 5.0, "top_k": 50, "top_p": 0.85,
            "speed": 1.0, "max_chunk_size": 350,
            "enable_text_splitting": True, "credit_multiplier": 1.0
        }

    # ========================================
    # LANGUAGE ROUTING
    # ========================================

    def _resolve_language(self, language):
        """
        Determine how to handle this language.
        Returns: (engine, actual_lang, use_basic_call, notes)
        """
        notes = []

        # XTTS native (full params work)
        if language in self.xtts_languages and language not in self.XTTS_BASIC_ONLY_LANGUAGES:
            return "xtts", language, False, notes

        # XTTS supported but needs basic call only (Hindi)
        if language in self.XTTS_BASIC_ONLY_LANGUAGES:
            notes.append(
                f"Using simplified XTTS call for {self.LANGUAGE_NAMES.get(language, language)} "
                f"(advanced params cause internal bug, voice cloning still works)"
            )
            return "xtts", language, True, notes

        # Not supported by XTTS — requires MMS engine via EngineRouter
        if language in self.UNSUPPORTED_LANGUAGES:
            lang_name = self.LANGUAGE_NAMES.get(language, language)
            raise ValueError(
                f"{lang_name} ({language}) requires the MMS-TTS engine. "
                f"Use EngineRouter instead of VoxarTTSEngine directly for "
                f"regional Indian language support."
            )

        raise ValueError(
            f"Language '{language}' not supported. "
            f"Supported: {sorted(self.all_supported_languages)}"
        )

    # ========================================
    # CORE GENERATION
    # ========================================

    def generate(self, text, speaker_wav, language="en", mode="flash",
                 speed=None, output_filename=None):
        """Generate speech from text with automatic language routing."""
        if not self.is_model_loaded:
            raise RuntimeError("Model not loaded. Call reload_model() first.")

        self._validate_inputs(text, speaker_wav, language, mode)

        engine, actual_lang, use_basic, lang_notes = self._resolve_language(language)

        for note in lang_notes:
            logger.info(f"  Language: {note}")

        config = self.configs[mode]
        max_chunk = config.get("max_chunk_size", 350)
        gen_speed = speed if speed is not None else config.get("speed", 1.0)

        clean_text = text.strip()

        if len(clean_text) <= max_chunk:
            result = self._generate_single(
                clean_text, speaker_wav, actual_lang, config,
                gen_speed, output_filename, use_basic
            )
        else:
            result = self._generate_chunked(
                clean_text, speaker_wav, actual_lang, config,
                gen_speed, output_filename, use_basic
            )

        result["requested_language"] = language
        result["actual_engine_language"] = actual_lang
        result["used_basic_call"] = use_basic
        result["language_notes"] = lang_notes

        return result

    def _call_xtts(self, text, speaker_wav, language, config, speed, file_path, use_basic):
        """
        Call XTTS v2 tts_to_file with proper parameters.
        
        use_basic=True:  Simple call without advanced params (for Hindi)
        use_basic=False: Full call with all quality parameters
        """
        if use_basic:
            # Hindi and other buggy languages — basic call works perfectly
            # Voice cloning still works! Just can't tune temperature/top_k etc.
            logger.info(f"  Using basic XTTS call (language={language})")
            self.model.tts_to_file(
                text=text,
                speaker_wav=speaker_wav,
                language=language,
                file_path=str(file_path),
                speed=speed
            )
        else:
            # Full call with all quality parameters
            self.model.tts_to_file(
                text=text,
                speaker_wav=speaker_wav,
                language=language,
                file_path=str(file_path),
                temperature=config["temperature"],
                length_penalty=config["length_penalty"],
                repetition_penalty=config["repetition_penalty"],
                top_k=config["top_k"],
                top_p=config["top_p"],
                speed=speed,
                enable_text_splitting=config.get("enable_text_splitting", True)
            )

    def _generate_single(self, text, speaker_wav, language, config, speed,
                         output_filename, use_basic):
        if output_filename:
            output_path = self.output_dir / output_filename
        else:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
            output_path = self.output_dir / f"voxar_{config['id']}_{language}_{timestamp}.wav"

        logger.info(
            f"Generating: mode={config['id']} | lang={language} | "
            f"chars={len(text)} | speed={speed} | basic={use_basic}"
        )

        start_time = time.time()
        quality_notes = []

        with self._gpu_lock:
            try:
                self._call_xtts(text, speaker_wav, language, config, speed,
                               output_path, use_basic)
            except RuntimeError as e:
                if "out of memory" in str(e).lower():
                    logger.error("GPU OUT OF MEMORY!")
                    if self.device == "cuda":
                        torch.cuda.empty_cache()
                    raise RuntimeError("GPU out of memory. Try shorter text.") from e
                raise
            except KeyError as e:
                # If advanced params cause KeyError, retry with basic call
                logger.warning(f"KeyError with advanced params: {e}. Retrying with basic call...")
                try:
                    self._call_xtts(text, speaker_wav, language, config, speed,
                                   output_path, use_basic=True)
                    quality_notes.append("Used basic call (advanced params not supported for this language)")
                except Exception as retry_e:
                    logger.error(f"Basic call also failed: {retry_e}")
                    raise
            except Exception as e:
                logger.error(f"Generation failed: {type(e).__name__}: {e}")
                raise

        gen_time = time.time() - start_time

        from pydub import AudioSegment
        audio = AudioSegment.from_file(str(output_path))
        duration = len(audio) / 1000.0

        if duration < 0.5:
            quality_notes.append("WARNING: Audio very short")

        silence_ratio = self._calculate_silence_ratio(audio)
        if silence_ratio > 0.4:
            quality_notes.append(f"WARNING: High silence ratio ({silence_ratio:.0%})")

        if self.device == "cuda":
            torch.cuda.empty_cache()

        return {
            "output_path": str(output_path),
            "duration": round(duration, 2),
            "characters": len(text),
            "generation_time": round(gen_time, 2),
            "mode": config["id"],
            "mode_name": config.get("name", config["id"]),
            "language": language,
            "speed": speed,
            "chunks_used": 1,
            "quality_notes": quality_notes,
            "file_size_kb": round(os.path.getsize(output_path) / 1024, 1)
        }

    def _generate_chunked(self, text, speaker_wav, language, config, speed,
                          output_filename, use_basic):
        max_chunk = config.get("max_chunk_size", 350)
        chunker = self.chunker_class(max_chunk_size=max_chunk)
        chunks = chunker.split_text(text)
        logger.info(f"Split text into {len(chunks)} chunks")

        # Request-scoped temp directory to avoid collisions under concurrency
        request_id = str(uuid.uuid4())
        temp_dir = self.output_dir / "_temp" / request_id
        temp_dir.mkdir(parents=True, exist_ok=True)

        chunk_paths = []
        total_gen_time = 0
        quality_notes = []

        try:
            for i, chunk_text in enumerate(chunks):
                logger.info(f"  Chunk {i + 1}/{len(chunks)} ({len(chunk_text)} chars)")

                chunk_file = temp_dir / f"chunk_{i}.wav"

                with self._gpu_lock:
                    try:
                        chunk_start = time.time()
                        self._call_xtts(chunk_text, speaker_wav, language, config,
                                       speed, chunk_file, use_basic)
                        chunk_time = time.time() - chunk_start
                        total_gen_time += chunk_time
                        chunk_paths.append(str(chunk_file))
                        logger.info(f"  Chunk {i + 1} done in {chunk_time:.1f}s")

                    except KeyError as e:
                        # Retry with basic call
                        logger.warning(f"  Chunk {i+1} KeyError, retrying basic...")
                        try:
                            chunk_start = time.time()
                            self._call_xtts(chunk_text, speaker_wav, language, config,
                                           speed, chunk_file, use_basic=True)
                            chunk_time = time.time() - chunk_start
                            total_gen_time += chunk_time
                            chunk_paths.append(str(chunk_file))
                        except Exception as retry_e:
                            logger.error(f"  Chunk {i+1} retry failed: {retry_e}")
                            quality_notes.append(f"Chunk {i+1} failed: {retry_e}")

                    except Exception as e:
                        logger.error(f"  Chunk {i + 1} failed: {e}")
                        quality_notes.append(f"Chunk {i + 1} failed: {str(e)}")
                        if self.device == "cuda":
                            torch.cuda.empty_cache()
                        continue

            if not chunk_paths:
                raise RuntimeError("All chunks failed to generate")

            if output_filename:
                final_path = str(self.output_dir / output_filename)
            else:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
                final_path = str(
                    self.output_dir / f"voxar_{config['id']}_{language}_{timestamp}.wav"
                )

            pause_ms = {"cinematic": 600, "flash": 300, "longform": 500}.get(config["id"], 400)
            self.concatenator.concatenate(chunk_paths, final_path, pause_ms, 50)

            from pydub import AudioSegment
            final_audio = AudioSegment.from_file(final_path)
            duration = len(final_audio) / 1000.0

            if self.device == "cuda":
                torch.cuda.empty_cache()

            return {
                "output_path": final_path,
                "duration": round(duration, 2),
                "characters": len(text),
                "generation_time": round(total_gen_time, 2),
                "mode": config["id"],
                "mode_name": config.get("name", config["id"]),
                "language": language,
                "speed": speed,
                "chunks_used": len(chunk_paths),
                "total_chunks_attempted": len(chunks),
                "quality_notes": quality_notes,
                "file_size_kb": round(os.path.getsize(final_path) / 1024, 1)
            }
        finally:
            # Always clean up request-scoped temp directory
            if temp_dir.exists():
                shutil.rmtree(temp_dir, ignore_errors=True)

    # ========================================
    # SPEAKER EMBEDDING ANALYSIS
    # ========================================

    def extract_embedding_info(self, audio_path):
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        from pydub import AudioSegment
        audio = AudioSegment.from_file(audio_path)
        duration = len(audio) / 1000.0

        analysis = {
            "file_path": audio_path,
            "duration_seconds": round(duration, 2),
            "sample_rate": audio.frame_rate,
            "channels": audio.channels,
            "file_size_kb": round(os.path.getsize(audio_path) / 1024, 1),
            "is_valid": True,
            "issues": [],
            "recommendations": []
        }

        if duration < 6:
            analysis["issues"].append("Audio too short (minimum 6 seconds)")
            analysis["is_valid"] = False
        elif duration < 15:
            analysis["recommendations"].append("30-60 seconds recommended.")
        elif duration > 120:
            analysis["recommendations"].append("Only first 60 seconds used effectively.")

        if audio.channels > 1:
            analysis["recommendations"].append("Stereo will be converted to mono.")

        if audio.frame_rate < 16000:
            analysis["issues"].append(f"Sample rate too low ({audio.frame_rate} Hz).")
            analysis["is_valid"] = False

        if audio.dBFS < -35:
            analysis["issues"].append("Volume very low")
        elif audio.dBFS > -3:
            analysis["issues"].append("Audio may be clipping")

        silence_ratio = self._calculate_silence_ratio(audio)
        if silence_ratio > 0.5:
            analysis["issues"].append(f"Too much silence ({silence_ratio:.0%}).")
            analysis["is_valid"] = False

        analysis["silence_ratio"] = round(silence_ratio, 2)
        analysis["volume_db"] = round(audio.dBFS, 1)
        return analysis

    # ========================================
    # VALIDATION & UTILITIES
    # ========================================

    def _validate_inputs(self, text, speaker_wav, language, mode):
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        if len(text) > 50000:
            raise ValueError(f"Text too long ({len(text)} chars). Max 50,000.")

        if isinstance(speaker_wav, str):
            if not os.path.exists(speaker_wav):
                raise FileNotFoundError(f"Speaker WAV not found: {speaker_wav}")
        elif isinstance(speaker_wav, list):
            for wav in speaker_wav:
                if not os.path.exists(wav):
                    raise FileNotFoundError(f"Speaker WAV not found: {wav}")
        else:
            raise ValueError("speaker_wav must be a file path or list of paths")

        if language not in self.all_supported_languages:
            raise ValueError(
                f"Language '{language}' not supported. "
                f"Supported: {sorted(self.all_supported_languages)}"
            )
        if mode not in self.configs:
            raise ValueError(f"Unknown mode: '{mode}'. Available: {list(self.configs.keys())}")

    def _calculate_silence_ratio(self, audio_segment):
        total_ms = len(audio_segment)
        if total_ms == 0:
            return 1.0
        from pydub.silence import detect_nonsilent
        try:
            nonsilent = detect_nonsilent(
                audio_segment, min_silence_len=300,
                silence_thresh=audio_segment.dBFS - 16
            )
            if not nonsilent:
                return 1.0
            return 1.0 - (sum(e - s for s, e in nonsilent) / total_ms)
        except Exception:
            return 0.0

    def get_gpu_info(self):
        if not torch.cuda.is_available():
            return {"device": "cpu", "gpu_available": False, "gpu_name": "N/A",
                    "vram_total_gb": 0, "vram_used_gb": 0, "vram_free_gb": 0}
        total = torch.cuda.get_device_properties(0).total_memory
        used = torch.cuda.memory_allocated(0)
        reserved = torch.cuda.memory_reserved(0)
        return {
            "device": "cuda", "gpu_available": True,
            "gpu_name": torch.cuda.get_device_name(0),
            "vram_total_gb": round(total / 1e9, 2),
            "vram_used_gb": round(used / 1e9, 2),
            "vram_reserved_gb": round(reserved / 1e9, 2),
            "vram_free_gb": round((total - reserved) / 1e9, 2)
        }

    def get_model_info(self):
        return {
            "engine": "VOXAR TTS Engine v1.0",
            "model": "XTTS v2 (Coqui)",
            "device": self.device,
            "xtts_native_languages": self.xtts_languages,
            "basic_only_languages": list(self.XTTS_BASIC_ONLY_LANGUAGES),
            "unsupported_languages": list(self.UNSUPPORTED_LANGUAGES),
            "total_supported": len(self.all_supported_languages),
            "modes": list(self.configs.keys()),
            "gpu_info": self.get_gpu_info()
        }

    def get_language_info(self, language):
        if language not in self.all_supported_languages:
            return {"supported": False, "language": language}
        engine, actual, basic, notes = self._resolve_language(language)
        return {
            "supported": True,
            "language": language,
            "name": self.LANGUAGE_NAMES.get(language, "Unknown"),
            "engine": engine,
            "actual_code": actual,
            "basic_call": basic,
            "voice_cloning": engine == "xtts",
            "notes": notes
        }

    def list_modes(self):
        print("\nAvailable VOXAR Modes:")
        print("-" * 60)
        for mode_id, config in self.configs.items():
            print(f"  {config.get('name', mode_id)} ({mode_id})")
            print(f"    {config.get('description', '')}")
            print(f"    Temperature: {config['temperature']} | Speed: {config.get('speed', 1.0)}")
            print(f"    Max chunk: {config.get('max_chunk_size', 350)} | Credits: {config.get('credit_multiplier', 1.0)}x")
            print()

    def list_languages(self):
        print("\nVOXAR Language Support:")
        print("-" * 60)
        print("\n  XTTS v2 Full Support (voice cloning + quality params):")
        for lang in sorted(self.xtts_languages):
            if lang not in self.XTTS_BASIC_ONLY_LANGUAGES:
                print(f"    [{lang}] {self.LANGUAGE_NAMES.get(lang, lang)}")

        print("\n  XTTS v2 Basic Support (voice cloning, no advanced tuning):")
        for lang in sorted(self.XTTS_BASIC_ONLY_LANGUAGES):
            print(f"    [{lang}] {self.LANGUAGE_NAMES.get(lang, lang)}")

        print("\n  Workaround via English tokenizer (romanized text):")
        for lang in sorted(self.UNSUPPORTED_LANGUAGES):
            print(f"    [{lang}] {self.LANGUAGE_NAMES.get(lang, lang)} (MMS-TTS coming Phase 4)")

        print(f"\n  Total: {len(self.all_supported_languages)} languages")