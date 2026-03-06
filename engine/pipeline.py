"""
VOXAR Pipeline Orchestrator v1.0
Chains all engine components into a single end-to-end pipeline.

Pipeline flow:
  1. ScriptPreprocessor.process(text) → ProcessedScript with chunks
  2. VoxarTTSEngine.generate(chunk) → raw audio per chunk
  3. VoxarAudioMaster.master() or .master_chunked() → mastered audio
  4. VoxarQualityValidator.validate() → quality score + grade
  5. VoxarExporter.export_for_plan() → final delivery files

This orchestrator resolves the double-chunking problem (H4):
  - Preprocessor owns text chunking (respects Hindi 250 char limit)
  - Engine receives individual pre-chunked text (won't re-chunk)
  - Engine's built-in chunking remains as safety fallback only

RULES:
  - This module must NEVER contain credit/billing/API logic
  - Credit enforcement belongs in the API layer (Phase 5)
  - Engine logic stays in engine modules
"""

import os
import time
import logging
from pathlib import Path

logger = logging.getLogger("VoxarPipeline")


class PipelineResult:
    """Result of a full pipeline run."""

    def __init__(self):
        self.original_text = ""
        self.processed_text = ""
        self.language = "en"
        self.detected_language = "en"
        self.chunks = []
        self.chunk_audio_paths = []
        self.raw_audio_path = None
        self.mastered_audio_path = None
        self.quality_score = 0
        self.quality_grade = "F"
        self.quality_passed = False
        self.exports = {}
        self.total_duration = 0.0
        self.total_time = 0.0
        self.character_count = 0
        self.processing_notes = []
        self.errors = []

    def to_dict(self):
        return {
            "original_text": self.original_text,
            "processed_text": self.processed_text,
            "language": self.language,
            "detected_language": self.detected_language,
            "chunk_count": len(self.chunks),
            "mastered_audio_path": self.mastered_audio_path,
            "quality_score": self.quality_score,
            "quality_grade": self.quality_grade,
            "quality_passed": self.quality_passed,
            "exports": self.exports,
            "total_duration": round(self.total_duration, 2),
            "total_time": round(self.total_time, 2),
            "character_count": self.character_count,
            "processing_notes": self.processing_notes,
            "errors": self.errors,
        }


class VoxarPipeline:
    """
    End-to-end TTS pipeline orchestrator.

    Usage:
        pipeline = VoxarPipeline(engine, speaker_wav="voice.wav")
        result = pipeline.process("Hello, this is VOXAR speaking.")
        print(result.mastered_audio_path)
        print(result.quality_grade)
    """

    def __init__(self, engine, speaker_wav, language="auto", mode="flash",
                 mastering_mode="flash", plan="free", output_dir="output"):
        """
        Args:
            engine: VoxarTTSEngine instance (must be pre-initialized)
            speaker_wav: path to speaker reference audio
            language: "auto", "en", "hi", etc.
            mode: TTS generation mode ("flash", "cinematic", "longform", "multilingual")
            mastering_mode: audio mastering profile
            plan: user plan for export format ("free", "starter", "creator", "pro", "ultra")
            output_dir: base output directory
        """
        self.engine = engine
        self.speaker_wav = speaker_wav
        self.language = language
        self.mode = mode
        self.mastering_mode = mastering_mode
        self.plan = plan
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Lazy-init components (avoid import overhead if not used)
        self._preprocessor = None
        self._master = None
        self._validator = None
        self._exporter = None

        logger.info(f"VoxarPipeline initialized: lang={language} mode={mode} "
                    f"mastering={mastering_mode} plan={plan}")

    @property
    def preprocessor(self):
        if self._preprocessor is None:
            from engine.preprocessor.script_preprocessor import ScriptPreprocessor
            self._preprocessor = ScriptPreprocessor(language=self.language)
        return self._preprocessor

    @property
    def master(self):
        if self._master is None:
            from engine.audio_processor import VoxarAudioMaster
            self._master = VoxarAudioMaster(mode=self.mastering_mode)
        return self._master

    @property
    def validator(self):
        if self._validator is None:
            from engine.quality_validator import VoxarQualityValidator
            self._validator = VoxarQualityValidator()
        return self._validator

    @property
    def exporter(self):
        if self._exporter is None:
            from engine.exporter import VoxarExporter
            self._exporter = VoxarExporter()
        return self._exporter

    def process(self, raw_text, speed=None, skip_mastering=False,
                skip_validation=False, skip_export=False):
        """
        Run the full pipeline: preprocess → generate → master → validate → export.

        Args:
            raw_text: raw user input text
            speed: TTS speed override (None = use mode default)
            skip_mastering: skip audio mastering (return raw TTS output)
            skip_validation: skip quality validation
            skip_export: skip final export (keep mastered WAV only)

        Returns:
            PipelineResult with all metadata and output paths
        """
        pipeline_start = time.time()
        result = PipelineResult()
        result.original_text = raw_text

        # ── Step 1: Preprocess text ──
        logger.info("Pipeline Step 1: Preprocessing text...")
        try:
            processed = self.preprocessor.process(
                raw_text, language=self.language
            )
            result.processed_text = processed.processed_text
            result.language = processed.language
            result.detected_language = processed.detected_language
            result.chunks = processed.chunks
            result.character_count = processed.character_count
            result.processing_notes.extend(processed.processing_notes)

            logger.info(f"  Preprocessed: {len(raw_text)} → {processed.character_count} chars, "
                        f"{len(processed.chunks)} chunks, lang={processed.language}")
        except Exception as e:
            result.errors.append(f"Preprocessing failed: {e}")
            logger.error(f"  Preprocessing failed: {e}")
            return result

        if not result.chunks:
            result.errors.append("No text to generate after preprocessing")
            return result

        # ── Step 2: Generate audio per chunk ──
        # Feeds individual pre-chunked text to engine (resolves H4 double-chunking)
        logger.info(f"Pipeline Step 2: Generating audio ({len(result.chunks)} chunks)...")
        chunk_audio_paths = []

        for i, chunk_text in enumerate(result.chunks):
            logger.info(f"  Generating chunk {i + 1}/{len(result.chunks)} "
                        f"({len(chunk_text)} chars)")
            try:
                gen_result = self.engine.generate(
                    text=chunk_text,
                    speaker_wav=self.speaker_wav,
                    language=result.language,
                    mode=self.mode,
                    speed=speed,
                    output_filename=f"_pipeline_chunk_{i}.wav"
                )
                chunk_audio_paths.append(gen_result["output_path"])
                logger.info(f"  Chunk {i + 1} done: {gen_result['duration']}s")

                if gen_result.get("quality_notes"):
                    result.processing_notes.extend(gen_result["quality_notes"])

            except Exception as e:
                error_msg = f"Chunk {i + 1} generation failed: {e}"
                result.errors.append(error_msg)
                logger.error(f"  {error_msg}")

        result.chunk_audio_paths = chunk_audio_paths

        if not chunk_audio_paths:
            result.errors.append("All chunks failed to generate")
            return result

        # ── Step 3: Master audio ──
        if skip_mastering:
            # Use raw audio as-is
            if len(chunk_audio_paths) == 1:
                result.mastered_audio_path = chunk_audio_paths[0]
            else:
                # Concatenate without mastering
                from engine.text_chunker import AudioConcatenator
                concat = AudioConcatenator()
                joined_path = str(self.output_dir / "_pipeline_joined.wav")
                concat.concatenate(chunk_audio_paths, joined_path, 400, 50)
                result.mastered_audio_path = joined_path
            result.processing_notes.append("Mastering skipped")
        else:
            logger.info("Pipeline Step 3: Mastering audio...")
            try:
                mastered_path = str(self.output_dir / "mastered_pipeline_output.wav")

                if len(chunk_audio_paths) == 1:
                    master_result = self.master.master(
                        chunk_audio_paths[0], output_path=mastered_path
                    )
                else:
                    master_result = self.master.master_chunked(
                        chunk_audio_paths, output_path=mastered_path
                    )

                result.mastered_audio_path = master_result["output_path"]
                result.total_duration = master_result.get("final_duration", 0)
                logger.info(f"  Mastered: {result.total_duration}s")

            except Exception as e:
                error_msg = f"Mastering failed: {e}"
                result.errors.append(error_msg)
                logger.error(f"  {error_msg}")
                # Fall back to raw audio
                result.mastered_audio_path = chunk_audio_paths[0] if len(chunk_audio_paths) == 1 else None
                if result.mastered_audio_path is None:
                    return result

        # ── Step 4: Validate quality ──
        if skip_validation or not result.mastered_audio_path:
            result.processing_notes.append("Quality validation skipped")
        else:
            logger.info("Pipeline Step 4: Validating quality...")
            try:
                val_result = self.validator.validate(
                    result.mastered_audio_path,
                    expected_text_length=result.character_count
                )
                result.quality_score = val_result["score"]
                result.quality_grade = val_result["grade"]
                result.quality_passed = val_result["passed"]

                logger.info(f"  Quality: {result.quality_score}/100 "
                            f"Grade {result.quality_grade} "
                            f"({'PASS' if result.quality_passed else 'FAIL'})")

                if not result.quality_passed:
                    result.processing_notes.append(
                        f"Quality below threshold: {result.quality_score}/100 "
                        f"({val_result['recommendation']})"
                    )
            except Exception as e:
                result.errors.append(f"Validation failed: {e}")
                logger.error(f"  Validation failed: {e}")

        # ── Step 5: Export ──
        if skip_export or not result.mastered_audio_path:
            result.processing_notes.append("Export skipped")
        else:
            logger.info(f"Pipeline Step 5: Exporting for plan '{self.plan}'...")
            try:
                export_dir = str(self.output_dir / "exports")
                exports = self.exporter.export_for_plan(
                    result.mastered_audio_path,
                    output_dir=export_dir,
                    filename_base="voxar_output",
                    plan=self.plan,
                    title=raw_text[:100] if raw_text else None
                )
                result.exports = exports
                logger.info(f"  Exported: {list(exports.keys())}")

            except Exception as e:
                result.errors.append(f"Export failed: {e}")
                logger.error(f"  Export failed: {e}")

        result.total_time = time.time() - pipeline_start
        logger.info(f"Pipeline complete: {result.total_time:.1f}s total | "
                    f"Quality: {result.quality_score}/100 ({result.quality_grade}) | "
                    f"Errors: {len(result.errors)}")

        return result

    def cleanup_temp_files(self):
        """Remove temporary chunk files created during pipeline run."""
        for pattern in ["_pipeline_chunk_*.wav", "_pipeline_joined.wav"]:
            for f in self.output_dir.glob(pattern):
                try:
                    f.unlink()
                except OSError:
                    pass
