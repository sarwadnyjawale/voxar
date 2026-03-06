"""
VOXAR Phase 7 Verification Script
Speech-to-Text Engine (Whisper + Diarization + Subtitles)

Tests:
  - VoxarWhisperEngine class structure and methods
  - VoxarDiarizer class structure and methods
  - SubtitleExporter class structure and methods
  - EngineRouter transcribe() integration
  - API config STT settings
  - GPU queue STT job support
  - Transcribe API routes
  - App registration and dependencies
  - Data classes (TranscriptSegment, DiarizationSegment, etc.)
  - Subtitle format correctness (SRT/VTT timestamps)
  - Module imports and file structure
  - Regression checks

Run: python verify_phase7.py
"""

import os
import sys
import json
import inspect
import importlib
import ast
from pathlib import Path

# ── Test framework ──────────────────────────────────────────────────────

passed = 0
failed = 0
total = 0

def check(test_id, description, condition):
    global passed, failed, total
    total += 1
    if condition:
        passed += 1
        print(f"  [PASS] {test_id}: {description}")
    else:
        failed += 1
        print(f"  [FAIL] {test_id}: {description}")

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ========================================================================
# SECTION 1: VoxarWhisperEngine -- Class Structure
# ========================================================================
section("1. VoxarWhisperEngine - Class Structure")

from engine.whisper_engine import VoxarWhisperEngine, TranscriptionResult, TranscriptSegment, WordSegment

check("P7-001", "VoxarWhisperEngine class exists",
      inspect.isclass(VoxarWhisperEngine))

check("P7-002", "VALID_MODEL_SIZES contains large-v3",
      "large-v3" in VoxarWhisperEngine.VALID_MODEL_SIZES)

check("P7-003", "VALID_MODEL_SIZES contains at least 10 models",
      len(VoxarWhisperEngine.VALID_MODEL_SIZES) >= 10)

check("P7-004", "VALID_COMPUTE_TYPES includes int8 and float16",
      "int8" in VoxarWhisperEngine.VALID_COMPUTE_TYPES and
      "float16" in VoxarWhisperEngine.VALID_COMPUTE_TYPES)

check("P7-005", "SUPPORTED_LANGUAGES has 99 languages",
      len(VoxarWhisperEngine.SUPPORTED_LANGUAGES) == 99)

check("P7-006", "SUPPORTED_LANGUAGES includes Hindi (hi)",
      "hi" in VoxarWhisperEngine.SUPPORTED_LANGUAGES)

check("P7-007", "SUPPORTED_LANGUAGES includes English (en)",
      "en" in VoxarWhisperEngine.SUPPORTED_LANGUAGES)

check("P7-008", "SUPPORTED_LANGUAGES includes Tamil (ta)",
      "ta" in VoxarWhisperEngine.SUPPORTED_LANGUAGES)

check("P7-009", "MAX_AUDIO_DURATION is 7200 (2 hours)",
      VoxarWhisperEngine.MAX_AUDIO_DURATION == 7200)

check("P7-010", "MODEL_VRAM_MB has VRAM estimates",
      "large-v3" in VoxarWhisperEngine.MODEL_VRAM_MB)


# ========================================================================
# SECTION 2: VoxarWhisperEngine -- Methods
# ========================================================================
section("2. VoxarWhisperEngine - Methods")

whisper_methods = dir(VoxarWhisperEngine)

check("P7-011", "has __init__ method",
      "__init__" in whisper_methods)

check("P7-012", "has load_model method",
      "load_model" in whisper_methods)

check("P7-013", "has unload_model method",
      "unload_model" in whisper_methods)

check("P7-014", "has transcribe method",
      "transcribe" in whisper_methods)

check("P7-015", "has get_model_info method",
      "get_model_info" in whisper_methods)

check("P7-016", "has is_model_loaded property",
      "is_model_loaded" in whisper_methods)

# Check transcribe() signature
sig = inspect.signature(VoxarWhisperEngine.transcribe)
params = list(sig.parameters.keys())

check("P7-017", "transcribe accepts audio_path param",
      "audio_path" in params)

check("P7-018", "transcribe accepts language param",
      "language" in params)

check("P7-019", "transcribe accepts task param",
      "task" in params)

check("P7-020", "transcribe accepts beam_size param",
      "beam_size" in params)

check("P7-021", "transcribe accepts word_timestamps param",
      "word_timestamps" in params)

check("P7-022", "transcribe accepts vad_filter param",
      "vad_filter" in params)

check("P7-023", "transcribe accepts initial_prompt param",
      "initial_prompt" in params)


# ========================================================================
# SECTION 3: VoxarWhisperEngine -- Initialization
# ========================================================================
section("3. VoxarWhisperEngine - Initialization")

whisper = VoxarWhisperEngine(model_size="large-v3", compute_type="int8")

check("P7-024", "Initializes with model_size=large-v3",
      whisper._model_size == "large-v3")

check("P7-025", "Initializes with compute_type=int8",
      whisper._compute_type == "int8")

check("P7-026", "Model not loaded on init (lazy loading)",
      not whisper.is_model_loaded)

check("P7-027", "Device is set (cuda or cpu)",
      whisper._device in ("cuda", "cpu"))

# Test invalid model size
try:
    VoxarWhisperEngine(model_size="invalid-model")
    invalid_model_raised = False
except ValueError:
    invalid_model_raised = True

check("P7-028", "Raises ValueError for invalid model_size",
      invalid_model_raised)

# Test invalid compute type
try:
    VoxarWhisperEngine(compute_type="invalid-type")
    invalid_compute_raised = False
except ValueError:
    invalid_compute_raised = True

check("P7-029", "Raises ValueError for invalid compute_type",
      invalid_compute_raised)


# ========================================================================
# SECTION 4: Data Classes -- TranscriptionResult, TranscriptSegment, WordSegment
# ========================================================================
section("4. Data Classes - TranscriptionResult, TranscriptSegment, WordSegment")

# WordSegment
ws = WordSegment(word="hello", start=0.0, end=0.5, probability=0.95)
ws_dict = ws.to_dict()

check("P7-030", "WordSegment has word field",
      ws.word == "hello")

check("P7-031", "WordSegment has start field",
      ws.start == 0.0)

check("P7-032", "WordSegment has end field",
      ws.end == 0.5)

check("P7-033", "WordSegment has probability field",
      ws.probability == 0.95)

check("P7-034", "WordSegment.to_dict() returns dict with all fields",
      all(k in ws_dict for k in ("word", "start", "end", "probability")))

# TranscriptSegment
ts = TranscriptSegment(
    id=0, text="Hello world", start=0.0, end=2.0,
    words=[ws], avg_logprob=-0.5, no_speech_prob=0.01
)
ts_dict = ts.to_dict()

check("P7-035", "TranscriptSegment has id field",
      ts.id == 0)

check("P7-036", "TranscriptSegment has text field",
      ts.text == "Hello world")

check("P7-037", "TranscriptSegment has start/end fields",
      ts.start == 0.0 and ts.end == 2.0)

check("P7-038", "TranscriptSegment has words list",
      len(ts.words) == 1)

check("P7-039", "TranscriptSegment has speaker field (default None)",
      ts.speaker is None)

check("P7-040", "TranscriptSegment.to_dict() includes words when present",
      "words" in ts_dict)

check("P7-041", "TranscriptSegment.to_dict() includes avg_logprob",
      "avg_logprob" in ts_dict)

# TranscriptionResult
tr = TranscriptionResult(
    segments=[ts], text="Hello world", detected_language="en",
    language_probability=0.98, audio_duration=2.0,
    processing_time=0.5, task="transcribe", model_size="large-v3",
    word_timestamps=True
)
tr_dict = tr.to_dict()

check("P7-042", "TranscriptionResult has text field",
      tr.text == "Hello world")

check("P7-043", "TranscriptionResult has detected_language",
      tr.detected_language == "en")

check("P7-044", "TranscriptionResult has language_probability",
      tr.language_probability == 0.98)

check("P7-045", "TranscriptionResult has audio_duration",
      tr.audio_duration == 2.0)

check("P7-046", "TranscriptionResult has task field",
      tr.task == "transcribe")

check("P7-047", "TranscriptionResult has diarized field (default False)",
      tr.diarized == False)

check("P7-048", "TranscriptionResult.to_dict() has segment_count",
      "segment_count" in tr_dict and tr_dict["segment_count"] == 1)

check("P7-049", "TranscriptionResult.to_dict() has word_count",
      "word_count" in tr_dict)


# ========================================================================
# SECTION 5: VoxarDiarizer -- Class Structure
# ========================================================================
section("5. VoxarDiarizer - Class Structure")

from engine.diarizer import VoxarDiarizer, DiarizationSegment, DiarizationResult, check_pyannote_available

check("P7-050", "VoxarDiarizer class exists",
      inspect.isclass(VoxarDiarizer))

check("P7-051", "DiarizationSegment class exists",
      inspect.isclass(DiarizationSegment))

check("P7-052", "DiarizationResult class exists",
      inspect.isclass(DiarizationResult))

check("P7-053", "check_pyannote_available function exists",
      callable(check_pyannote_available))

check("P7-054", "PIPELINE_MODEL is pyannote/speaker-diarization-3.1",
      VoxarDiarizer.PIPELINE_MODEL == "pyannote/speaker-diarization-3.1")

check("P7-055", "DEFAULT_MIN_SPEAKERS is 1",
      VoxarDiarizer.DEFAULT_MIN_SPEAKERS == 1)

check("P7-056", "DEFAULT_MAX_SPEAKERS is 10",
      VoxarDiarizer.DEFAULT_MAX_SPEAKERS == 10)


# ========================================================================
# SECTION 6: VoxarDiarizer -- Methods
# ========================================================================
section("6. VoxarDiarizer - Methods")

diarizer_methods = dir(VoxarDiarizer)

check("P7-057", "has load_model method",
      "load_model" in diarizer_methods)

check("P7-058", "has unload_model method",
      "unload_model" in diarizer_methods)

check("P7-059", "has diarize method",
      "diarize" in diarizer_methods)

check("P7-060", "has merge_with_transcript method",
      "merge_with_transcript" in diarizer_methods)

check("P7-061", "has is_available property",
      "is_available" in diarizer_methods)

check("P7-062", "has is_model_loaded property",
      "is_model_loaded" in diarizer_methods)

check("P7-063", "has get_model_info method",
      "get_model_info" in diarizer_methods)

check("P7-064", "has _merge_adjacent_segments static method",
      "_merge_adjacent_segments" in diarizer_methods)

check("P7-065", "has _fill_unassigned_speakers static method",
      "_fill_unassigned_speakers" in diarizer_methods)


# ========================================================================
# SECTION 7: VoxarDiarizer -- Initialization & Data Classes
# ========================================================================
section("7. VoxarDiarizer - Initialization & Data Classes")

diarizer = VoxarDiarizer(hf_token="")

check("P7-066", "Diarizer initializes without error",
      diarizer is not None)

check("P7-067", "Model not loaded on init (lazy loading)",
      not diarizer.is_model_loaded)

# Without HF token, is_available should be False (unless pyannote is also missing)
pyannote_avail, _ = check_pyannote_available()
if not pyannote_avail:
    check("P7-068", "is_available is False when pyannote not installed",
          not diarizer.is_available)
else:
    check("P7-068", "is_available is False when no HF token",
          not diarizer.is_available)

check("P7-069", "unavailable_reason is non-empty when not available",
      len(diarizer.unavailable_reason) > 0)

# DiarizationSegment
ds = DiarizationSegment(speaker="SPEAKER_00", start=0.0, end=5.0)
ds_dict = ds.to_dict()

check("P7-070", "DiarizationSegment has speaker field",
      ds.speaker == "SPEAKER_00")

check("P7-071", "DiarizationSegment has duration property",
      ds.duration == 5.0)

check("P7-072", "DiarizationSegment.to_dict() has all fields",
      all(k in ds_dict for k in ("speaker", "start", "end", "duration")))

# DiarizationResult
dr = DiarizationResult(
    segments=[ds], num_speakers=1, speakers=["SPEAKER_00"],
    audio_duration=10.0, processing_time=1.5
)
dr_dict = dr.to_dict()

check("P7-073", "DiarizationResult has num_speakers",
      dr.num_speakers == 1)

check("P7-074", "DiarizationResult.to_dict() has segment_count",
      dr_dict["segment_count"] == 1)


# ========================================================================
# SECTION 8: VoxarDiarizer -- Merge Adjacent Segments
# ========================================================================
section("8. VoxarDiarizer - Merge Adjacent Segments")

segments_to_merge = [
    DiarizationSegment("SPEAKER_00", 0.0, 2.0),
    DiarizationSegment("SPEAKER_00", 2.3, 4.0),  # Gap < 0.5s, same speaker -> merge
    DiarizationSegment("SPEAKER_01", 4.5, 6.0),  # Different speaker -> no merge
    DiarizationSegment("SPEAKER_01", 6.2, 8.0),  # Gap < 0.5s, same speaker -> merge
]

merged = VoxarDiarizer._merge_adjacent_segments(segments_to_merge, gap_threshold=0.5)

check("P7-075", "Merges adjacent segments from same speaker",
      len(merged) == 2)

check("P7-076", "First merged segment has correct end time",
      merged[0].end == 4.0)

check("P7-077", "Second merged segment speaker is SPEAKER_01",
      merged[1].speaker == "SPEAKER_01")

check("P7-078", "Does not merge across different speakers",
      merged[0].speaker == "SPEAKER_00" and merged[1].speaker == "SPEAKER_01")

# Empty list
check("P7-079", "Handles empty segment list",
      VoxarDiarizer._merge_adjacent_segments([], 0.5) == [])


# ========================================================================
# SECTION 9: VoxarDiarizer -- Merge With Transcript
# ========================================================================
section("9. VoxarDiarizer - Merge With Transcript")

# Create test transcript segments
test_t_segments = [
    TranscriptSegment(id=0, text="Hello world", start=0.0, end=2.0),
    TranscriptSegment(id=1, text="How are you", start=2.5, end=4.0),
    TranscriptSegment(id=2, text="I am fine", start=5.0, end=7.0),
]

# Create diarization segments
test_d_segments = [
    DiarizationSegment("SPEAKER_00", 0.0, 3.5),
    DiarizationSegment("SPEAKER_01", 4.0, 8.0),
]

# Merge
diarizer_for_merge = VoxarDiarizer(hf_token="test")
merged_t = diarizer_for_merge.merge_with_transcript(test_d_segments, test_t_segments)

check("P7-080", "Merge assigns speakers to transcript segments",
      all(s.speaker is not None for s in merged_t))

check("P7-081", "First segment gets SPEAKER_00 (overlap match)",
      merged_t[0].speaker == "SPEAKER_00")

check("P7-082", "Last segment gets SPEAKER_01 (overlap match)",
      merged_t[2].speaker == "SPEAKER_01")


# ========================================================================
# SECTION 10: SubtitleExporter -- Class Structure
# ========================================================================
section("10. SubtitleExporter - Class Structure")

from engine.subtitle_exporter import SubtitleExporter

check("P7-083", "SubtitleExporter class exists",
      inspect.isclass(SubtitleExporter))

exporter_methods = dir(SubtitleExporter)

check("P7-084", "has to_srt static method",
      "to_srt" in exporter_methods)

check("P7-085", "has to_vtt static method",
      "to_vtt" in exporter_methods)

check("P7-086", "has to_json static method",
      "to_json" in exporter_methods)

check("P7-087", "has save_srt static method",
      "save_srt" in exporter_methods)

check("P7-088", "has save_vtt static method",
      "save_vtt" in exporter_methods)

check("P7-089", "has to_word_srt static method",
      "to_word_srt" in exporter_methods)

check("P7-090", "has to_word_vtt static method",
      "to_word_vtt" in exporter_methods)

check("P7-091", "DEFAULT_MAX_CHARS_PER_LINE is 42",
      SubtitleExporter.DEFAULT_MAX_CHARS_PER_LINE == 42)

check("P7-092", "DEFAULT_MAX_DURATION is 7.0",
      SubtitleExporter.DEFAULT_MAX_DURATION == 7.0)

check("P7-093", "MIN_SUBTITLE_DURATION is 0.5",
      SubtitleExporter.MIN_SUBTITLE_DURATION == 0.5)


# ========================================================================
# SECTION 11: SubtitleExporter -- SRT Format
# ========================================================================
section("11. SubtitleExporter - SRT Format")

test_segments = [
    TranscriptSegment(id=0, text="Hello world", start=0.0, end=2.0),
    TranscriptSegment(id=1, text="How are you", start=2.5, end=4.0),
]

srt = SubtitleExporter.to_srt(test_segments)

check("P7-094", "SRT output is non-empty string",
      isinstance(srt, str) and len(srt) > 0)

check("P7-095", "SRT starts with sequence number 1",
      srt.strip().startswith("1"))

check("P7-096", "SRT contains --> arrow separator",
      "-->" in srt)

check("P7-097", "SRT contains comma in timestamp (SRT format)",
      "," in srt.split("-->")[0])

check("P7-098", "SRT contains the test text",
      "Hello world" in srt)


# ========================================================================
# SECTION 12: SubtitleExporter -- VTT Format
# ========================================================================
section("12. SubtitleExporter - VTT Format")

vtt = SubtitleExporter.to_vtt(test_segments)

check("P7-099", "VTT output starts with WEBVTT header",
      vtt.strip().startswith("WEBVTT"))

check("P7-100", "VTT contains --> arrow separator",
      "-->" in vtt)

check("P7-101", "VTT uses dots in timestamps (not commas)",
      "." in vtt.split("-->")[1].split("\n")[0])

check("P7-102", "VTT contains the test text",
      "Hello world" in vtt)


# ========================================================================
# SECTION 13: SubtitleExporter -- Timestamp Formatting
# ========================================================================
section("13. SubtitleExporter - Timestamp Formatting")

check("P7-103", "SRT timestamp 0.0 -> 00:00:00,000",
      SubtitleExporter._format_timestamp_srt(0.0) == "00:00:00,000")

check("P7-104", "SRT timestamp 65.5 -> 00:01:05,500",
      SubtitleExporter._format_timestamp_srt(65.5) == "00:01:05,500")

check("P7-105", "SRT timestamp 3723.123 -> 01:02:03,123",
      SubtitleExporter._format_timestamp_srt(3723.123) == "01:02:03,123")

check("P7-106", "VTT timestamp 0.0 -> 00:00:00.000",
      SubtitleExporter._format_timestamp_vtt(0.0) == "00:00:00.000")

check("P7-107", "VTT timestamp 65.5 -> 00:01:05.500",
      SubtitleExporter._format_timestamp_vtt(65.5) == "00:01:05.500")

check("P7-108", "Negative time clamped to 0",
      SubtitleExporter._format_timestamp_srt(-5.0) == "00:00:00,000")


# ========================================================================
# SECTION 14: SubtitleExporter -- JSON Format
# ========================================================================
section("14. SubtitleExporter - JSON Format")

json_output = SubtitleExporter.to_json(test_segments, include_words=False)

check("P7-109", "JSON output has segments key",
      "segments" in json_output)

check("P7-110", "JSON output has text key",
      "text" in json_output)

check("P7-111", "JSON segments count matches input",
      json_output["segment_count"] == 2)

check("P7-112", "JSON output has word_count",
      "word_count" in json_output)

check("P7-113", "JSON output has speakers list",
      "speakers" in json_output)

check("P7-114", "JSON output has duration",
      "duration" in json_output)


# ========================================================================
# SECTION 15: SubtitleExporter -- Speaker Labels
# ========================================================================
section("15. SubtitleExporter - Speaker Labels")

speaker_segments = [
    TranscriptSegment(id=0, text="Hello", start=0.0, end=1.0, speaker="SPEAKER_00"),
    TranscriptSegment(id=1, text="Hi there", start=1.5, end=3.0, speaker="SPEAKER_01"),
]

srt_with_speakers = SubtitleExporter.to_srt(speaker_segments, include_speakers=True)
vtt_with_speakers = SubtitleExporter.to_vtt(speaker_segments, include_speakers=True)

check("P7-115", "SRT includes speaker labels in brackets",
      "[SPEAKER_00]" in srt_with_speakers)

check("P7-116", "VTT includes speaker labels via <v> tags",
      "<v SPEAKER_00>" in vtt_with_speakers or "<v SPEAKER_01>" in vtt_with_speakers)

srt_no_speakers = SubtitleExporter.to_srt(speaker_segments, include_speakers=False)

check("P7-117", "SRT without speaker labels omits brackets",
      "[SPEAKER" not in srt_no_speakers)


# ========================================================================
# SECTION 16: SubtitleExporter -- Text Wrapping
# ========================================================================
section("16. SubtitleExporter - Text Wrapping")

short_text = "Short text"
wrapped_short = SubtitleExporter._wrap_text(short_text, 42, 2)

check("P7-118", "Short text returned unchanged",
      wrapped_short == short_text)

long_text = "This is a really long subtitle text that should definitely be wrapped onto two lines"
wrapped_long = SubtitleExporter._wrap_text(long_text, 42, 2)

check("P7-119", "Long text gets wrapped to multiple lines",
      "\n" in wrapped_long)

check("P7-120", "Wrapped text has at most 2 lines",
      wrapped_long.count("\n") <= 1)  # 1 newline = 2 lines


# ========================================================================
# SECTION 17: EngineRouter -- Transcribe Method
# ========================================================================
section("17. EngineRouter - Transcribe Method")

from engine.engine_router import EngineRouter

router_methods = dir(EngineRouter)

check("P7-121", "EngineRouter has transcribe method",
      "transcribe" in router_methods)

check("P7-122", "EngineRouter has whisper property",
      "whisper" in router_methods)

check("P7-123", "EngineRouter has diarizer property",
      "diarizer" in router_methods)

check("P7-124", "EngineRouter has is_diarization_available property",
      "is_diarization_available" in router_methods)

# Check transcribe() signature
sig = inspect.signature(EngineRouter.transcribe)
params = list(sig.parameters.keys())

check("P7-125", "transcribe() has audio_path param",
      "audio_path" in params)

check("P7-126", "transcribe() has language param",
      "language" in params)

check("P7-127", "transcribe() has task param",
      "task" in params)

check("P7-128", "transcribe() has diarize param",
      "diarize" in params)

check("P7-129", "transcribe() has word_timestamps param",
      "word_timestamps" in params)

check("P7-130", "transcribe() has num_speakers param",
      "num_speakers" in params)


# ========================================================================
# SECTION 18: EngineRouter -- __init__ accepts Whisper/diarizer config
# ========================================================================
section("18. EngineRouter - __init__ accepts STT config")

init_sig = inspect.signature(EngineRouter.__init__)
init_params = list(init_sig.parameters.keys())

check("P7-131", "__init__ accepts whisper_model_size param",
      "whisper_model_size" in init_params)

check("P7-132", "__init__ accepts whisper_compute_type param",
      "whisper_compute_type" in init_params)

check("P7-133", "__init__ accepts hf_token param",
      "hf_token" in init_params)


# ========================================================================
# SECTION 19: API Config -- STT Settings
# ========================================================================
section("19. API Config - STT Settings")

from api.config import Settings

settings = Settings()

check("P7-134", "Settings has WHISPER_MODEL_SIZE",
      hasattr(settings, "WHISPER_MODEL_SIZE"))

check("P7-135", "WHISPER_MODEL_SIZE default is large-v3",
      settings.WHISPER_MODEL_SIZE == "large-v3")

check("P7-136", "Settings has WHISPER_COMPUTE_TYPE",
      hasattr(settings, "WHISPER_COMPUTE_TYPE"))

check("P7-137", "WHISPER_COMPUTE_TYPE default is int8",
      settings.WHISPER_COMPUTE_TYPE == "int8")

check("P7-138", "Settings has HF_TOKEN",
      hasattr(settings, "HF_TOKEN"))

check("P7-139", "Settings has MAX_AUDIO_UPLOAD_DURATION",
      hasattr(settings, "MAX_AUDIO_UPLOAD_DURATION"))

check("P7-140", "MAX_AUDIO_UPLOAD_DURATION default is 7200",
      settings.MAX_AUDIO_UPLOAD_DURATION == 7200)

check("P7-141", "Settings has MAX_AUDIO_UPLOAD_SIZE_MB",
      hasattr(settings, "MAX_AUDIO_UPLOAD_SIZE_MB"))

check("P7-142", "MAX_AUDIO_UPLOAD_SIZE_MB default is 100",
      settings.MAX_AUDIO_UPLOAD_SIZE_MB == 100)

check("P7-143", "Settings has MAX_SYNC_AUDIO_DURATION",
      hasattr(settings, "MAX_SYNC_AUDIO_DURATION"))

check("P7-144", "MAX_SYNC_AUDIO_DURATION default is 60",
      settings.MAX_SYNC_AUDIO_DURATION == 60)

# Check to_dict includes STT settings
settings_dict = settings.to_dict()

check("P7-145", "to_dict includes whisper_model_size",
      "whisper_model_size" in settings_dict)

check("P7-146", "to_dict includes hf_token_set",
      "hf_token_set" in settings_dict)

check("P7-147", "to_dict includes max_audio_upload_size_mb",
      "max_audio_upload_size_mb" in settings_dict)


# ========================================================================
# SECTION 20: GPU Queue -- STT Job Support
# ========================================================================
section("20. GPU Queue - STT Job Support")

from api.gpu_queue import GPUJobQueue, JobResult

# Check JobResult has STT fields
jr = JobResult(job_id="test_001")

check("P7-148", "JobResult has job_type field",
      hasattr(jr, "job_type"))

check("P7-149", "JobResult default job_type is 'tts'",
      jr.job_type == "tts")

check("P7-150", "JobResult has audio_path field (STT input)",
      hasattr(jr, "audio_path"))

check("P7-151", "JobResult has stt_language field",
      hasattr(jr, "stt_language"))

check("P7-152", "JobResult has stt_task field",
      hasattr(jr, "stt_task"))

check("P7-153", "JobResult has diarize field",
      hasattr(jr, "diarize"))

check("P7-154", "JobResult has word_timestamps field",
      hasattr(jr, "word_timestamps"))

check("P7-155", "JobResult has subtitle_format field",
      hasattr(jr, "subtitle_format"))

check("P7-156", "JobResult has stt_result_path field",
      hasattr(jr, "stt_result_path"))

check("P7-157", "JobResult has stt_subtitle_paths field",
      hasattr(jr, "stt_subtitle_paths"))

check("P7-158", "JobResult has detected_language field",
      hasattr(jr, "detected_language"))

check("P7-159", "JobResult has num_speakers_detected field",
      hasattr(jr, "num_speakers_detected"))

check("P7-160", "JobResult has tts_audio_path field",
      hasattr(jr, "tts_audio_path"))

# STT JobResult
stt_jr = JobResult(job_id="stt_test_001", job_type="stt")

check("P7-161", "STT JobResult has job_type='stt'",
      stt_jr.job_type == "stt")

# Check to_dict for STT
stt_jr.status = "completed"
stt_jr.detected_language = "en"
stt_jr.language_probability = 0.98
stt_jr.audio_duration = 10.5
stt_jr.processing_time = 3.2
stt_jr.segment_count = 5
stt_jr.word_count = 25
stt_jr.stt_subtitle_paths = {"srt": "/path/to.srt", "vtt": "/path/to.vtt"}

stt_dict = stt_jr.to_dict()

check("P7-162", "STT to_dict has job_type field",
      stt_dict.get("job_type") == "stt")

check("P7-163", "STT to_dict has detected_language",
      "detected_language" in stt_dict)

check("P7-164", "STT to_dict has result_url",
      "result_url" in stt_dict)

check("P7-165", "STT to_dict has subtitle_formats list",
      "subtitle_formats" in stt_dict)

# Check GPUJobQueue has submit_transcription
check("P7-166", "GPUJobQueue has submit_transcription method",
      hasattr(GPUJobQueue, "submit_transcription"))

check("P7-167", "GPUJobQueue has _process_stt_job method",
      hasattr(GPUJobQueue, "_process_stt_job"))


# ========================================================================
# SECTION 21: API Routes -- Transcribe
# ========================================================================
section("21. API Routes - Transcribe")

from api.routes import transcribe as transcribe_routes

check("P7-168", "transcribe module has router",
      hasattr(transcribe_routes, "router"))

check("P7-169", "transcribe router has routes",
      len(transcribe_routes.router.routes) > 0)

# Check route paths
route_paths = [r.path for r in transcribe_routes.router.routes]

check("P7-170", "/transcribe route exists",
      "/transcribe" in route_paths)

check("P7-171", "/transcribe/sync route exists",
      "/transcribe/sync" in route_paths)

check("P7-172", "/transcribe/{job_id} route exists",
      "/transcribe/{job_id}" in route_paths)

check("P7-173", "/transcribe/{job_id}/result route exists",
      "/transcribe/{job_id}/result" in route_paths)

# Check route functions exist
check("P7-174", "transcribe_async function exists",
      hasattr(transcribe_routes, "transcribe_async"))

check("P7-175", "transcribe_sync function exists",
      hasattr(transcribe_routes, "transcribe_sync"))

check("P7-176", "get_transcription_status function exists",
      hasattr(transcribe_routes, "get_transcription_status"))

check("P7-177", "download_transcription_result function exists",
      hasattr(transcribe_routes, "download_transcription_result"))

# Check helper functions
check("P7-178", "_validate_audio_upload function exists",
      hasattr(transcribe_routes, "_validate_audio_upload"))

check("P7-179", "_save_upload_to_temp function exists",
      hasattr(transcribe_routes, "_save_upload_to_temp"))

check("P7-180", "ALLOWED_AUDIO_EXTENSIONS is defined",
      hasattr(transcribe_routes, "ALLOWED_AUDIO_EXTENSIONS") and
      len(transcribe_routes.ALLOWED_AUDIO_EXTENSIONS) >= 8)


# ========================================================================
# SECTION 22: App Registration
# ========================================================================
section("22. App Registration")

# Read app.py source
app_source = open("api/app.py", "r").read()

check("P7-181", "app.py imports transcribe routes",
      "from api.routes import transcribe" in app_source)

check("P7-182", "app.py registers transcribe router",
      "transcribe.router" in app_source)

check("P7-183", "app.py passes whisper_model_size to EngineRouter",
      "whisper_model_size" in app_source)

check("P7-184", "app.py passes whisper_compute_type to EngineRouter",
      "whisper_compute_type" in app_source)

check("P7-185", "app.py passes hf_token to EngineRouter",
      "hf_token" in app_source)

check("P7-186", "API version updated to 1.2.0",
      "1.2.0" in app_source)

# Count routers (should be at least 6 now)
router_includes = app_source.count("include_router")
check("P7-187", "At least 6 routers registered",
      router_includes >= 6)


# ========================================================================
# SECTION 23: File Structure
# ========================================================================
section("23. File Structure")

check("P7-188", "engine/whisper_engine.py exists",
      os.path.exists("engine/whisper_engine.py"))

check("P7-189", "engine/diarizer.py exists",
      os.path.exists("engine/diarizer.py"))

check("P7-190", "engine/subtitle_exporter.py exists",
      os.path.exists("engine/subtitle_exporter.py"))

check("P7-191", "api/routes/transcribe.py exists",
      os.path.exists("api/routes/transcribe.py"))


# ========================================================================
# SECTION 24: Engine Router -- Source Verification
# ========================================================================
section("24. Engine Router - Source Verification")

router_source = open("engine/engine_router.py", "r").read()

check("P7-192", "engine_router.py version is v1.2",
      "v1.2" in router_source)

check("P7-193", "engine_router.py mentions Whisper in docstring",
      "Whisper" in router_source)

check("P7-194", "engine_router.py imports VoxarWhisperEngine lazily",
      "VoxarWhisperEngine" in router_source)

check("P7-195", "engine_router.py imports VoxarDiarizer lazily",
      "VoxarDiarizer" in router_source)

check("P7-196", "engine_router.py imports SubtitleExporter",
      "SubtitleExporter" in router_source)

check("P7-197", "engine_router transcribe() uses _gpu_lock",
      "self._gpu_lock" in router_source)

check("P7-198", "engine_router transcribe() unloads XTTS before Whisper",
      "unloading xtts" in router_source.lower() or "unload xtts" in router_source.lower())


# ========================================================================
# SECTION 25: GPU Queue -- Source Verification
# ========================================================================
section("25. GPU Queue - Source Verification")

queue_source = open("api/gpu_queue.py", "r").read()

check("P7-199", "gpu_queue.py version is v1.1",
      "v1.1" in queue_source)

check("P7-200", "gpu_queue.py mentions STT in docstring",
      "STT" in queue_source or "stt" in queue_source)

check("P7-201", "gpu_queue.py has submit_transcription method",
      "submit_transcription" in queue_source)

check("P7-202", "gpu_queue.py has _process_stt_job method",
      "_process_stt_job" in queue_source)

check("P7-203", "gpu_queue.py dispatches by job_type in worker",
      "job.job_type" in queue_source)

check("P7-204", "gpu_queue.py imports json module",
      "import json" in queue_source)

check("P7-205", "STT job ID prefix is 'stt_'",
      'stt_' in queue_source)


# ========================================================================
# SECTION 26: Jobs Route -- TTS Audio Path Update
# ========================================================================
section("26. Jobs Route - TTS Audio Path")

jobs_source = open("api/routes/jobs.py", "r").read()

check("P7-206", "jobs.py uses tts_audio_path (not audio_path)",
      "tts_audio_path" in jobs_source)


# ========================================================================
# SECTION 27: Module Imports
# ========================================================================
section("27. Module Imports")

try:
    import engine.whisper_engine
    whisper_import = True
except Exception:
    whisper_import = False
check("P7-207", "engine.whisper_engine imports cleanly",
      whisper_import)

try:
    import engine.diarizer
    diarizer_import = True
except Exception:
    diarizer_import = False
check("P7-208", "engine.diarizer imports cleanly",
      diarizer_import)

try:
    import engine.subtitle_exporter
    subtitle_import = True
except Exception:
    subtitle_import = False
check("P7-209", "engine.subtitle_exporter imports cleanly",
      subtitle_import)

try:
    import api.routes.transcribe
    transcribe_import = True
except Exception:
    transcribe_import = False
check("P7-210", "api.routes.transcribe imports cleanly",
      transcribe_import)


# ========================================================================
# SECTION 28: Regression -- Phase 5/6 Compatibility
# ========================================================================
section("28. Regression - Phase 5/6 Compatibility")

# Check that generate routes still work
from api.routes import generate as generate_routes
check("P7-211", "generate routes module still importable",
      generate_routes is not None)

check("P7-212", "generate router still has routes",
      len(generate_routes.router.routes) > 0)

# Check TTS JobResult still works
tts_job = JobResult(
    job_id="tts_test",
    job_type="tts",
    status="completed",
    text="Hello",
    voice_id="v001",
    tts_audio_path="/path/to/audio.mp3",
    duration=2.0,
    quality_score=85,
    quality_grade="A",
)
tts_dict = tts_job.to_dict()

check("P7-213", "TTS JobResult to_dict still has audio_url",
      "audio_url" in tts_dict)

check("P7-214", "TTS JobResult to_dict still has quality_score",
      "quality_score" in tts_dict)

check("P7-215", "TTS JobResult to_dict still has voice_id",
      "voice_id" in tts_dict)

# Check voices route still works
from api.routes import voices
check("P7-216", "voices route still importable",
      voices is not None)

# Check user_voices route still works
from api.routes import user_voices
check("P7-217", "user_voices route still importable",
      user_voices is not None)

# Check config backward compat
check("P7-218", "Settings still has MAX_TEXT_LENGTH",
      hasattr(settings, "MAX_TEXT_LENGTH"))

check("P7-219", "Settings still has MAX_USER_VOICES",
      hasattr(settings, "MAX_USER_VOICES"))

check("P7-220", "Settings still has OUTPUT_DIR",
      hasattr(settings, "OUTPUT_DIR"))


# ========================================================================
# SUMMARY
# ========================================================================
print(f"\n{'='*60}")
print(f"  PHASE 7 VERIFICATION SUMMARY")
print(f"{'='*60}")
print(f"  Passed: {passed}/{total}")
print(f"  Failed: {failed}/{total}")

if failed == 0:
    print(f"\n  ALL {total} CHECKS PASSED!")
else:
    print(f"\n  {failed} CHECKS FAILED -- review output above")

print(f"{'='*60}")

sys.exit(0 if failed == 0 else 1)
