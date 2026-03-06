"""
VOXAR GPU Job Queue v1.1
Single-worker async job queue for GPU-bound TTS and STT tasks.

Design:
  - asyncio.Queue for job submission (bounded by MAX_QUEUE_SIZE)
  - Single background worker consuming jobs serially (1 GPU = 1 worker)
  - Jobs stored in dict with auto-TTL cleanup
  - Worker calls VoxarPipeline.process() or EngineRouter.transcribe() via asyncio.to_thread()
  - Job states: queued -> processing -> completed / failed
  - Supports two job types: "tts" (text-to-speech) and "stt" (speech-to-text)

RULES:
  - This module must NEVER contain credit/billing logic
  - No TTS/STT generation logic -- delegates to engine layer
  - Thread-safe job state management
"""

import os
import asyncio
import time
import uuid
import json
import logging
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

logger = logging.getLogger("VoxarQueue")


@dataclass
class JobResult:
    """Represents a TTS or STT job and its result."""

    job_id: str
    job_type: str = "tts"  # "tts" or "stt"
    status: str = "queued"  # queued, processing, completed, failed
    created_at: float = field(default_factory=time.time)
    started_at: Optional[float] = None
    completed_at: Optional[float] = None

    # TTS request parameters
    text: str = ""
    voice_id: str = ""
    language: str = "en"
    mode: str = "flash"
    speed: float = 1.0
    output_format: str = "mp3"

    # STT request parameters
    audio_path: Optional[str] = None  # Input audio file for STT
    stt_language: Optional[str] = None  # Language hint for STT (None = auto)
    stt_task: str = "transcribe"  # "transcribe" or "translate"
    diarize: bool = False
    word_timestamps: bool = True
    subtitle_format: str = "srt"  # "srt", "vtt", "json", "all"
    num_speakers: Optional[int] = None
    min_speakers: Optional[int] = None
    max_speakers: Optional[int] = None

    # TTS result data (populated on completion)
    tts_audio_path: Optional[str] = None
    duration: float = 0.0
    quality_score: int = 0
    quality_grade: str = ""
    character_count: int = 0
    processing_time: float = 0.0
    engine: str = ""
    error: Optional[str] = None

    # STT result data (populated on completion)
    stt_result_path: Optional[str] = None  # Path to JSON result file
    stt_subtitle_paths: Optional[dict] = None  # {"srt": path, "vtt": path}
    detected_language: str = ""
    language_probability: float = 0.0
    audio_duration: float = 0.0
    segment_count: int = 0
    word_count: int = 0
    num_speakers_detected: int = 0
    diarized: bool = False

    def to_dict(self):
        """Serialize job for API response."""
        result = {
            "job_id": self.job_id,
            "job_type": self.job_type,
            "status": self.status,
            "created_at": self.created_at,
        }

        if self.started_at:
            result["started_at"] = self.started_at
        if self.completed_at:
            result["completed_at"] = self.completed_at

        if self.job_type == "tts":
            result["text_preview"] = self.text[:80] + "..." if len(self.text) > 80 else self.text
            result["voice_id"] = self.voice_id
            result["language"] = self.language
            result["mode"] = self.mode
            result["character_count"] = self.character_count or len(self.text)

            if self.status == "completed":
                result.update({
                    "audio_url": f"/api/v1/jobs/{self.job_id}/audio",
                    "duration": self.duration,
                    "quality_score": self.quality_score,
                    "quality_grade": self.quality_grade,
                    "processing_time": self.processing_time,
                    "engine": self.engine,
                    "format": self.output_format,
                })

        elif self.job_type == "stt":
            result["task"] = self.stt_task
            result["language"] = self.stt_language or "auto"
            result["diarize"] = self.diarize

            if self.status == "completed":
                result.update({
                    "result_url": f"/api/v1/transcribe/{self.job_id}/result",
                    "detected_language": self.detected_language,
                    "language_probability": round(self.language_probability, 4),
                    "audio_duration": round(self.audio_duration, 2),
                    "processing_time": self.processing_time,
                    "segment_count": self.segment_count,
                    "word_count": self.word_count,
                    "diarized": self.diarized,
                    "num_speakers": self.num_speakers_detected,
                    "subtitle_formats": list(self.stt_subtitle_paths.keys()) if self.stt_subtitle_paths else [],
                })

        if self.status == "failed":
            result["error"] = self.error

        return result


class GPUJobQueue:
    """
    Single-worker GPU job queue for async TTS and STT tasks.

    Usage:
        queue = GPUJobQueue(engine, voice_manager, settings)
        await queue.start()

        # TTS
        job_id = await queue.submit(text="Hello", voice_id="v001")

        # STT
        job_id = await queue.submit_transcription(audio_path="audio.wav")

        job = queue.get_job(job_id)
        await queue.stop()
    """

    def __init__(self, engine, voice_manager, settings, user_voice_manager=None):
        """
        Args:
            engine: EngineRouter instance (or VoxarTTSEngine)
            voice_manager: VoiceManager instance
            settings: Settings instance
            user_voice_manager: UserVoiceManager instance (for user-cloned voices)
        """
        self._engine = engine
        self._voice_manager = voice_manager
        self._user_voice_manager = user_voice_manager
        self._settings = settings

        self._queue = asyncio.Queue(maxsize=settings.MAX_QUEUE_SIZE)
        self._jobs = {}  # job_id -> JobResult
        self._jobs_lock = threading.Lock()
        self._worker_task = None
        self._running = False

        # Output directory for generated audio
        self._output_dir = Path(settings.OUTPUT_DIR)
        self._output_dir.mkdir(parents=True, exist_ok=True)

        logger.info(
            f"GPUJobQueue initialized: max_queue={settings.MAX_QUEUE_SIZE} "
            f"timeout={settings.JOB_TIMEOUT_SECONDS}s "
            f"ttl={settings.JOB_RESULT_TTL_SECONDS}s"
        )

    async def start(self):
        """Start the background worker and cleanup tasks."""
        if self._running:
            return
        self._running = True
        self._worker_task = asyncio.create_task(self._worker())
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())
        logger.info("GPU job queue worker started")

    async def stop(self):
        """Stop the background worker gracefully."""
        self._running = False

        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass

        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass

        logger.info("GPU job queue worker stopped")

    async def submit(self, text, voice_id, language="en", mode="flash",
                     speed=1.0, output_format="mp3"):
        """
        Submit a TTS generation job to the queue.

        Args:
            text: input text
            voice_id: voice ID from catalog
            language: language code
            mode: TTS mode
            speed: speed multiplier
            output_format: "mp3" or "wav"

        Returns:
            str: job_id

        Raises:
            asyncio.QueueFull: if queue is at max capacity
        """
        job_id = f"j_{uuid.uuid4().hex[:12]}"

        job = JobResult(
            job_id=job_id,
            text=text,
            voice_id=voice_id,
            language=language,
            mode=mode,
            speed=speed,
            output_format=output_format,
            character_count=len(text),
        )

        with self._jobs_lock:
            self._jobs[job_id] = job

        # This will raise asyncio.QueueFull if at capacity
        self._queue.put_nowait(job_id)

        logger.info(
            f"Job submitted: {job_id} | voice={voice_id} lang={language} "
            f"chars={len(text)} | queue_size={self._queue.qsize()}"
        )

        return job_id

    async def submit_transcription(self, audio_path, language=None,
                                   task="transcribe", diarize=False,
                                   word_timestamps=True, subtitle_format="all",
                                   num_speakers=None, min_speakers=None,
                                   max_speakers=None):
        """
        Submit an STT transcription job to the queue.

        Args:
            audio_path: path to the uploaded audio file
            language: language code (None = auto-detect)
            task: "transcribe" or "translate"
            diarize: perform speaker diarization
            word_timestamps: include word-level timestamps
            subtitle_format: "srt", "vtt", "json", or "all"
            num_speakers: exact speaker count (for diarization)
            min_speakers: minimum speakers (for diarization)
            max_speakers: maximum speakers (for diarization)

        Returns:
            str: job_id

        Raises:
            asyncio.QueueFull: if queue is at max capacity
        """
        job_id = f"stt_{uuid.uuid4().hex[:12]}"

        job = JobResult(
            job_id=job_id,
            job_type="stt",
            audio_path=audio_path,
            stt_language=language,
            stt_task=task,
            diarize=diarize,
            word_timestamps=word_timestamps,
            subtitle_format=subtitle_format,
            num_speakers=num_speakers,
            min_speakers=min_speakers,
            max_speakers=max_speakers,
        )

        with self._jobs_lock:
            self._jobs[job_id] = job

        self._queue.put_nowait(job_id)

        logger.info(
            f"STT job submitted: {job_id} | task={task} "
            f"lang={'auto' if not language else language} | "
            f"diarize={diarize} | queue_size={self._queue.qsize()}"
        )

        return job_id

    def get_job(self, job_id):
        """
        Get a job by ID.

        Returns:
            JobResult or None
        """
        with self._jobs_lock:
            return self._jobs.get(job_id)

    def get_queue_position(self, job_id):
        """Get the approximate position of a job in the queue."""
        # This is approximate since we can't peek into asyncio.Queue easily
        job = self.get_job(job_id)
        if not job or job.status != "queued":
            return 0
        return self._queue.qsize()

    def get_queue_stats(self):
        """Get current queue statistics."""
        with self._jobs_lock:
            statuses = {}
            for job in self._jobs.values():
                statuses[job.status] = statuses.get(job.status, 0) + 1

        return {
            "pending": self._queue.qsize(),
            "processing": statuses.get("processing", 0),
            "completed": statuses.get("completed", 0),
            "failed": statuses.get("failed", 0),
            "total_tracked": len(self._jobs),
            "max_size": self._settings.MAX_QUEUE_SIZE,
        }

    async def _worker(self):
        """Background worker that processes one job at a time."""
        logger.info("GPU worker started — waiting for jobs...")

        while self._running:
            try:
                # Wait for a job (with timeout to check _running flag)
                try:
                    job_id = await asyncio.wait_for(
                        self._queue.get(), timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue

                job = self.get_job(job_id)
                if not job:
                    logger.warning(f"Job {job_id} not found in registry, skipping")
                    continue

                # Mark as processing
                job.status = "processing"
                job.started_at = time.time()
                logger.info(f"Processing job: {job_id} (type={job.job_type})")

                # Run the blocking GPU task in a thread
                # STT jobs get a longer timeout (audio can be up to 2 hours)
                timeout = self._settings.JOB_TIMEOUT_SECONDS
                if job.job_type == "stt":
                    timeout = max(timeout, 600)  # At least 10 minutes for STT

                try:
                    if job.job_type == "stt":
                        await asyncio.wait_for(
                            asyncio.to_thread(self._process_stt_job, job),
                            timeout=timeout,
                        )
                    else:
                        await asyncio.wait_for(
                            asyncio.to_thread(self._process_job, job),
                            timeout=timeout,
                        )
                except asyncio.TimeoutError:
                    job.status = "failed"
                    job.error = f"Job timed out after {self._settings.JOB_TIMEOUT_SECONDS}s"
                    job.completed_at = time.time()
                    logger.error(f"Job {job_id} timed out")
                except Exception as e:
                    job.status = "failed"
                    job.error = str(e)
                    job.completed_at = time.time()
                    logger.error(f"Job {job_id} failed: {e}")

                self._queue.task_done()

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker error: {e}")
                await asyncio.sleep(1)

        logger.info("GPU worker stopped")

    def _process_job(self, job):
        """
        Process a single TTS job (blocking -- runs in thread).

        Uses VoxarPipeline for full pipeline (preprocess -> generate -> master -> export).
        Supports both library voices (v001-v020) and user-cloned voices (uv_*).
        """
        from engine.pipeline import VoxarPipeline
        from engine.user_voice_manager import UserVoiceManager

        # ── Resolve voice embedding path ──
        if UserVoiceManager.is_user_voice_id(job.voice_id):
            # User-cloned voice: resolve via UserVoiceManager
            if self._user_voice_manager is None:
                raise ValueError(
                    "User voice cloning is not configured on this server."
                )
            try:
                embedding_path = self._user_voice_manager.resolve_embedding_path(
                    job.voice_id
                )
            except (ValueError, FileNotFoundError) as e:
                raise ValueError(f"User voice error: {e}")

            # Increment usage counter
            self._user_voice_manager.increment_usage(job.voice_id)

        else:
            # Library voice: resolve via VoiceManager (existing behavior)
            voice = self._voice_manager.get_voice(job.voice_id)
            if not voice:
                raise ValueError(f"Voice '{job.voice_id}' not found in catalog")

            embedding_path = voice.get("embedding_path", "")
            if not os.path.isabs(embedding_path):
                embedding_path = os.path.join(self._settings.VOICES_DIR, embedding_path)

        if not os.path.exists(embedding_path):
            raise FileNotFoundError(
                f"Voice embedding not found: {embedding_path}"
            )

        # Create per-job output directory
        job_output_dir = self._output_dir / job.job_id
        job_output_dir.mkdir(parents=True, exist_ok=True)

        # Create pipeline
        pipeline = VoxarPipeline(
            engine=self._engine,
            speaker_wav=embedding_path,
            language=job.language,
            mode=job.mode,
            output_dir=str(job_output_dir),
        )

        # Run the full pipeline
        result = pipeline.process(
            raw_text=job.text,
            speed=job.speed if job.speed != 1.0 else None,
        )

        # Check for errors
        if result.errors:
            raise RuntimeError(
                f"Pipeline errors: {'; '.join(result.errors)}"
            )

        # Export to requested format
        final_audio_path = result.mastered_audio_path
        if job.output_format == "mp3" and final_audio_path:
            from engine.exporter import VoxarExporter
            exporter = VoxarExporter()
            mp3_path = str(job_output_dir / f"{job.job_id}.mp3")
            exporter.export_mp3(
                final_audio_path, mp3_path, quality="high"
            )
            final_audio_path = mp3_path

        # Update job result
        job.status = "completed"
        job.completed_at = time.time()
        job.tts_audio_path = final_audio_path
        job.duration = result.total_duration
        job.quality_score = result.quality_score
        job.quality_grade = result.quality_grade
        job.character_count = result.character_count
        job.processing_time = round(time.time() - job.started_at, 2)
        job.engine = "pipeline"

        # Cleanup temp chunk files
        pipeline.cleanup_temp_files()

        logger.info(
            f"Job {job.job_id} completed: {job.duration}s audio, "
            f"quality={job.quality_score} ({job.quality_grade}), "
            f"took {job.processing_time}s"
        )

    def _process_stt_job(self, job):
        """
        Process a single STT (speech-to-text) job (blocking -- runs in thread).

        Uses EngineRouter.transcribe() which handles the full hot-swap pipeline:
        XTTS unload -> Whisper transcribe -> optional diarize -> XTTS reload.
        """
        from engine.subtitle_exporter import SubtitleExporter

        if not job.audio_path or not os.path.exists(job.audio_path):
            raise FileNotFoundError(
                f"Audio file not found: {job.audio_path}"
            )

        # Create per-job output directory
        job_output_dir = self._output_dir / job.job_id
        job_output_dir.mkdir(parents=True, exist_ok=True)

        # Run the transcription pipeline via EngineRouter
        result = self._engine.transcribe(
            audio_path=job.audio_path,
            language=job.stt_language,
            task=job.stt_task,
            diarize=job.diarize,
            word_timestamps=job.word_timestamps,
            num_speakers=job.num_speakers,
            min_speakers=job.min_speakers,
            max_speakers=job.max_speakers,
        )

        transcription = result["transcription"]
        diarization = result.get("diarization")
        subtitles = result.get("subtitles", {})

        # Save JSON result
        result_json_path = str(job_output_dir / f"{job.job_id}_result.json")
        json_data = {
            "transcription": transcription.to_dict(),
            "diarization": diarization.to_dict() if diarization else None,
            "subtitles": subtitles.get("json", {}),
        }
        with open(result_json_path, "w", encoding="utf-8") as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)

        # Save subtitle files based on requested format
        subtitle_paths = {}
        fmt = job.subtitle_format

        if fmt in ("srt", "all") and "srt" in subtitles:
            srt_path = str(job_output_dir / f"{job.job_id}.srt")
            with open(srt_path, "w", encoding="utf-8") as f:
                f.write(subtitles["srt"])
            subtitle_paths["srt"] = srt_path

        if fmt in ("vtt", "all") and "vtt" in subtitles:
            vtt_path = str(job_output_dir / f"{job.job_id}.vtt")
            with open(vtt_path, "w", encoding="utf-8") as f:
                f.write(subtitles["vtt"])
            subtitle_paths["vtt"] = vtt_path

        if fmt in ("all",) and "word_srt" in subtitles:
            word_srt_path = str(job_output_dir / f"{job.job_id}_words.srt")
            with open(word_srt_path, "w", encoding="utf-8") as f:
                f.write(subtitles["word_srt"])
            subtitle_paths["word_srt"] = word_srt_path

        if fmt in ("all",) and "word_vtt" in subtitles:
            word_vtt_path = str(job_output_dir / f"{job.job_id}_words.vtt")
            with open(word_vtt_path, "w", encoding="utf-8") as f:
                f.write(subtitles["word_vtt"])
            subtitle_paths["word_vtt"] = word_vtt_path

        # Update job result
        job.status = "completed"
        job.completed_at = time.time()
        job.stt_result_path = result_json_path
        job.stt_subtitle_paths = subtitle_paths
        job.detected_language = transcription.detected_language
        job.language_probability = transcription.language_probability
        job.audio_duration = transcription.audio_duration
        job.segment_count = len(transcription.segments)
        job.word_count = sum(len(s.text.split()) for s in transcription.segments)
        job.processing_time = round(time.time() - job.started_at, 2)
        job.diarized = transcription.diarized

        if diarization:
            job.num_speakers_detected = diarization.num_speakers

        logger.info(
            f"STT Job {job.job_id} completed: "
            f"{job.audio_duration:.1f}s audio | "
            f"{job.segment_count} segments | "
            f"lang={job.detected_language} | "
            f"diarized={job.diarized} | "
            f"took {job.processing_time}s"
        )

    async def _cleanup_loop(self):
        """Periodically clean up expired job results."""
        while self._running:
            try:
                await asyncio.sleep(300)  # Check every 5 minutes
                self._cleanup_expired()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Cleanup error: {e}")

    def _cleanup_expired(self):
        """Remove job results older than TTL."""
        now = time.time()
        ttl = self._settings.JOB_RESULT_TTL_SECONDS
        expired = []

        with self._jobs_lock:
            for job_id, job in self._jobs.items():
                if job.status in ("completed", "failed"):
                    age = now - (job.completed_at or job.created_at)
                    if age > ttl:
                        expired.append(job_id)

            for job_id in expired:
                job = self._jobs.pop(job_id)
                # Clean up audio files
                job_dir = self._output_dir / job_id
                if job_dir.exists():
                    import shutil
                    shutil.rmtree(str(job_dir), ignore_errors=True)

        if expired:
            logger.info(f"Cleaned up {len(expired)} expired jobs")
