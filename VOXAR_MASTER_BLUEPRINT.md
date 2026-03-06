VOXAR — FINAL 13-PHASE MASTER BLUEPRINT
THE DEFINITIVE REFERENCE DOCUMENT
HOW TO USE THIS DOCUMENT
text

1. Read the phase you want to start
2. Tell me: "Start Phase X"
3. Add any changes or modifications you want
4. I will give you exact code, exact commands, exact files
5. We complete that phase fully before moving to next
6. No shortcuts. No skipping. No half-work.
COMPLETE PROJECT STRUCTURE (FINAL)
text

voxar/
├── engine/                     (Python — AI Engine)
│   ├── tts_engine.py
│   ├── text_chunker.py
│   ├── audio_processor.py
│   ├── quality_validator.py
│   ├── clone_engine.py
│   ├── stt_engine.py
│   ├── preprocessor/
│   │   ├── script_preprocessor.py
│   │   ├── number_handler.py
│   │   ├── currency_handler.py
│   │   ├── abbreviation_handler.py
│   │   ├── hinglish_handler.py
│   │   ├── pause_controller.py
│   │   └── dictionaries/
│   ├── configs/
│   │   ├── flash.json
│   │   ├── cinematic.json
│   │   ├── longform.json
│   │   └── multilingual.json
│   ├── tests/
│   └── requirements.txt
│
├── api/                        (Python — FastAPI Server)
│   ├── main.py
│   ├── routes/
│   ├── middleware/
│   ├── queue/
│   ├── models/
│   └── utils/
│
├── voices/                     (Voice Library)
│   ├── raw_samples/
│   ├── cleaned_samples/
│   ├── embeddings/
│   ├── previews/
│   └── voices_catalog.json
│
├── voxar-backend/              (Node.js — Business Logic)
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
│
├── voxar-frontend/             (Next.js — Dashboard)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── public/
│
└── output/                     (Generated Files)
PHASE 1: XTTS ENGINE SETUP & STABILIZATION
text

DURATION:   5-7 Days
HARDWARE:   Your RTX 4060 (8GB VRAM), 24GB RAM, i7 LOQ
GOAL:       Get XTTS v2 running perfectly and understand
            its limits on your hardware
DEPENDS ON: Nothing — this is the foundation
DAY 1: Environment Foundation
text

TASKS:
├── Install Python 3.10.x (exact version — NOT 3.11 or 3.12)
│   └── XTTS v2 has compatibility issues with 3.11+
├── Create project folder: voxar/
├── Create virtual environment:
│   └── python -m venv venv
├── Activate virtual environment
├── Install PyTorch with CUDA support:
│   └── Must match your CUDA version (RTX 4060 = CUDA 12.x)
├── Install TTS library (Coqui TTS):
│   └── pip install TTS
├── Install additional dependencies:
│   ├── numpy
│   ├── scipy
│   ├── librosa
│   ├── soundfile
│   └── pydub
├── Verify GPU detection:
│   ├── import torch
│   ├── print(torch.cuda.is_available())  → must be True
│   ├── print(torch.cuda.get_device_name(0))  → RTX 4060
│   └── print(torch.cuda.get_device_properties(0).total_mem)
├── Download XTTS v2 model:
│   └── First run will auto-download (~1.8GB)
├── First test: Generate "Hello World" in English
├── Confirm:
│   ├── Audio file is created
│   ├── Audio sounds correct
│   ├── VRAM usage noted
│   └── Generation time noted
└── Document everything in a log file

FILES CREATED:
├── voxar/engine/tts_engine.py
├── voxar/requirements.txt
└── voxar/engine/tests/test_basic.py
DAY 2: Multi-Language Testing
text

TASKS:
├── Test English generation:
│   ├── Script 1: "Welcome to VOXAR Studio"
│   ├── Script 2: Short paragraph (100 chars)
│   ├── Script 3: Medium paragraph (300 chars)
│   ├── Script 4: Dialogue style text
│   └── Script 5: Technical/formal text
├── Test Hindi generation:
│   ├── Script 1: "VOXAR Studio mein aapka swagat hai"
│   ├── Script 2: Simple Hindi paragraph
│   ├── Script 3: Formal Hindi
│   ├── Script 4: Conversational Hindi
│   └── Script 5: Hindi with numbers/dates
├── Test Tamil generation (3 scripts)
├── Test Telugu generation (3 scripts)
├── Test Bengali generation (3 scripts)
├── Test Marathi generation (2 scripts)
├── For EACH test, document:
│   ├── Input text
│   ├── Output audio file name
│   ├── Generation time (seconds)
│   ├── VRAM usage during generation
│   ├── Audio quality rating (1-10)
│   ├── Pronunciation issues found
│   └── Any errors or crashes
├── Create spreadsheet/document:
│   └── Language | Quality | Speed | Issues
└── Identify which languages work well vs need work

FILES CREATED:
├── voxar/engine/tests/test_english.py
├── voxar/engine/tests/test_hindi.py
├── voxar/engine/tests/test_multilingual.py
├── voxar/output/english/
├── voxar/output/hindi/
└── voxar/docs/language_quality_report.md
DAY 3: Script Length Stress Testing
text

TASKS:
├── Test progressively longer scripts:
│   ├── 50 characters
│   ├── 100 characters
│   ├── 250 characters
│   ├── 500 characters
│   ├── 1,000 characters
│   ├── 2,000 characters
│   ├── 3,000 characters
│   ├── 5,000 characters
│   └── 10,000 characters (likely to crash)
├── For each length, record:
│   ├── Generation time
│   ├── VRAM peak usage
│   ├── Audio quality (does it degrade?)
│   ├── Any repetition/looping issues
│   ├── Any silence gaps
│   └── Crash? OOM error?
├── Find the BREAKING POINT:
│   ├── What is the maximum length before crash?
│   ├── What is the maximum length before quality drops?
│   ├── These two numbers are CRITICAL
│   └── Example: Crashes at 3000, quality drops at 2000
├── Design chunking strategy:
│   ├── If max safe length = 500 chars per chunk
│   ├── Split at sentence boundaries (period, question mark)
│   ├── Never split mid-sentence
│   ├── Each chunk generated separately
│   └── Concatenated after generation
├── Test RAM and system memory usage
│   └── 24GB RAM should be fine but monitor it
└── Document all findings

FILES CREATED:
├── voxar/engine/tests/test_stress.py
└── voxar/docs/stress_test_report.md
DAY 4: Text Chunking System
text

TASKS:
├── Build text_chunker.py:
│   ├── Function: split_text(text, max_chunk_size=500)
│   ├── Split rules:
│   │   ├── Primary split: at period (.)
│   │   ├── Secondary split: at comma (,) if sentence too long
│   │   ├── Tertiary split: at space if no punctuation
│   │   ├── Never split mid-word
│   │   └── Respect paragraph breaks (\n\n)
│   ├── Return: list of text chunks
│   └── Each chunk must be self-contained
├── Build audio concatenation:
│   ├── Generate audio for each chunk
│   ├── Add configurable pause between chunks (200-500ms)
│   ├── Concatenate all chunks into single audio file
│   ├── Ensure no clicks or artifacts at join points
│   └── Crossfade between chunks (optional, 50ms)
├── Test chunked generation:
│   ├── 2000 character script → chunked → single audio
│   ├── Compare: Does it sound natural?
│   ├── Are there awkward pauses?
│   ├── Is the voice consistent across chunks?
│   └── Rate quality vs single-generation
├── Edge cases:
│   ├── Script with no periods
│   ├── Script with very long sentences
│   ├── Script with bullet points
│   ├── Script with dialogue (quotes)
│   └── Empty or whitespace-only input
└── Chunker must be bulletproof

FILES CREATED:
├── voxar/engine/text_chunker.py
└── voxar/engine/tests/test_chunker.py
DAY 5: Voice Reference Testing
text

TASKS:
├── Collect 5 free voice samples:
│   ├── Source: LibriTTS dataset (English)
│   ├── Source: IndicTTS dataset (Hindi/Indian languages)
│   ├── Source: Common Voice (Mozilla)
│   ├── Source: Your own voice recording
│   └── Each sample: 10-30 seconds, clean audio
├── Test XTTS with each reference voice:
│   ├── Same text, different voice references
│   ├── Does the output match the reference voice?
│   ├── Rate similarity (1-10)
│   ├── Note: tone, pitch, speed consistency
│   └── Note: any artifacts or quality issues
├── Test cross-language voice consistency:
│   ├── English reference → Hindi generation
│   ├── Hindi reference → English generation
│   ├── Does voice character maintain?
│   └── Document results
├── Understand speaker_embedding:
│   ├── How XTTS extracts voice characteristics
│   ├── What is stored in the embedding
│   ├── How to save and reuse embeddings
│   ├── Embedding file format (.pth)
│   └── How embedding quality affects output
├── Build embedding extraction function:
│   ├── extract_speaker_embedding(audio_path)
│   ├── Returns embedding tensor
│   ├── Save to file
│   └── Load from file for reuse
└── This knowledge is critical for Phase 4 and Phase 6

FILES CREATED:
├── voxar/voices/raw_samples/ (5 voice files)
├── voxar/engine/tests/test_voices.py
└── voxar/docs/voice_reference_report.md
DAY 6-7: VOXAR Configuration Profiles
text

TASKS:
├── Build 4 configuration profiles:
│
│   VOXAR FLASH:
│   ├── Purpose: Quick generation, drafts, previews
│   ├── temperature: 0.75
│   ├── length_penalty: 1.0
│   ├── repetition_penalty: 5.0
│   ├── top_k: 50
│   ├── top_p: 0.85
│   ├── speed: 1.1
│   ├── chunk_size: 300 characters
│   └── Post-processing: minimal
│
│   VOXAR CINEMATIC:
│   ├── Purpose: High quality, dramatic, ads
│   ├── temperature: 0.3
│   ├── length_penalty: 1.0
│   ├── repetition_penalty: 10.0
│   ├── top_k: 30
│   ├── top_p: 0.8
│   ├── speed: 0.95
│   ├── chunk_size: 250 characters
│   └── Post-processing: full (reverb hint, warm EQ)
│
│   VOXAR LONGFORM:
│   ├── Purpose: Audiobooks, long narration, podcasts
│   ├── temperature: 0.5
│   ├── length_penalty: 1.0
│   ├── repetition_penalty: 8.0
│   ├── top_k: 50
│   ├── top_p: 0.85
│   ├── speed: 1.0
│   ├── chunk_size: 400 characters
│   └── Post-processing: breath smoothing, stable pacing
│
│   VOXAR MULTILINGUAL PRO:
│   ├── Purpose: Indian languages, code-mixed text
│   ├── temperature: 0.5
│   ├── length_penalty: 1.0
│   ├── repetition_penalty: 8.0
│   ├── top_k: 50
│   ├── top_p: 0.85
│   ├── speed: 1.0
│   ├── chunk_size: 300 characters
│   └── Post-processing: accent tuning, normalization
│
├── Save each as JSON config file
├── Build config loader in tts_engine.py:
│   ├── load_config(mode_name) → returns config dict
│   ├── apply_config(config) → sets XTTS parameters
│   └── Default mode: Flash
├── Test SAME script with ALL 4 modes:
│   ├── English test script
│   ├── Hindi test script
│   ├── Compare all 4 outputs side by side
│   ├── Rate each mode for its intended purpose
│   └── Adjust parameters if needed
├── Build tts_engine.py as complete class:
│   ├── class VoxarTTSEngine:
│   │   ├── __init__() → load model once
│   │   ├── generate(text, voice_ref, mode, language)
│   │   ├── generate_chunked(long_text, voice_ref, mode, lang)
│   │   ├── extract_embedding(audio_path)
│   │   ├── list_modes()
│   │   └── get_model_info()
│   └── This class is your core — treat it with respect
├── Integration test:
│   ├── Load engine
│   ├── Select voice reference
│   ├── Input text
│   ├── Select mode
│   ├── Generate audio
│   ├── Save output
│   └── Full pipeline works
└── Phase 1 COMPLETE

FILES CREATED:
├── voxar/engine/configs/flash.json
├── voxar/engine/configs/cinematic.json
├── voxar/engine/configs/longform.json
├── voxar/engine/configs/multilingual.json
├── voxar/engine/tts_engine.py (complete class)
└── voxar/engine/tests/test_modes.py

PHASE 1 DELIVERABLES:
├── ✅ XTTS v2 running stable on RTX 4060
├── ✅ 6 languages tested and documented
├── ✅ Breaking point identified
├── ✅ Chunking system for long scripts
├── ✅ Speaker embedding extraction working
├── ✅ 4 configuration profiles (Flash/Cinematic/Longform/Multi)
├── ✅ VoxarTTSEngine class complete
├── ✅ All benchmarks documented
└── ✅ Known issues listed
PHASE 2: AUDIO POST-PROCESSING PIPELINE
text

DURATION:   4-5 Days
HARDWARE:   Same laptop (CPU-based processing, no extra GPU needed)
GOAL:       Make every audio output sound studio-grade
DEPENDS ON: Phase 1 complete
DAY 1: Raw Audio Problem Analysis
text

TASKS:
├── Generate 10 raw audio samples from Phase 1:
│   ├── 3 English (different voices/modes)
│   ├── 3 Hindi
│   ├── 2 Tamil
│   ├── 2 Telugu
│   └── Various lengths (short, medium, long)
├── Listen to EACH raw sample carefully
├── Identify and document problems:
│   ├── Leading silence (dead air at start)
│   ├── Trailing silence (dead air at end)
│   ├── Volume inconsistency (loud then quiet)
│   ├── Background noise or hiss
│   ├── Clipping or distortion (too loud)
│   ├── Harsh frequencies (sibilance)
│   ├── Unnatural pauses
│   ├── Robotic artifacts
│   └── Mumbled or unclear words
├── Rate each problem severity (1-5):
│   └── This determines processing priority
├── Install processing libraries:
│   ├── pydub (audio manipulation)
│   ├── librosa (audio analysis)
│   ├── scipy (signal processing)
│   ├── numpy (numerical operations)
│   ├── pyloudnorm (loudness normalization)
│   ├── noisereduce (noise reduction)
│   └── FFmpeg (system install, required by pydub)
├── Verify all libraries work together
└── Create processing test environment

FILES CREATED:
├── voxar/engine/audio_processor.py (skeleton)
└── voxar/docs/audio_problems_report.md
DAY 2: Core Processing Functions
text

TASKS:
├── Function 1: trim_silence(audio, threshold_db=-40)
│   ├── Detect silence at start of audio
│   ├── Detect silence at end of audio
│   ├── Trim both but keep 100ms padding
│   ├── Preserve natural breath sounds at boundaries
│   ├── Handle edge case: entire audio is silent
│   └── Return trimmed audio
│
├── Function 2: normalize_loudness(audio, target_lufs=-16)
│   ├── Measure current loudness in LUFS
│   ├── Calculate gain needed
│   ├── Apply gain to reach target -16 LUFS
│   ├── -16 LUFS is podcast/streaming standard
│   ├── Ensures every output has same perceived volume
│   └── Return normalized audio
│
├── Function 3: remove_clipping(audio, ceiling_db=-1.0)
│   ├── Detect peaks above ceiling
│   ├── Apply soft limiter
│   ├── Preserve dynamics (don't squash everything)
│   ├── Prevent digital distortion
│   └── Return clean audio
│
├── Function 4: noise_reduction(audio, noise_profile=None)
│   ├── Use noisereduce library
│   ├── Auto-detect noise profile from first 500ms
│   ├── Apply spectral gating
│   ├── Be GENTLE — aggressive noise reduction sounds worse
│   ├── Preserve voice naturalness
│   └── Return denoised audio
│
├── Test each function individually:
│   ├── Before/after comparison
│   ├── Listen test
│   └── Verify no quality degradation
└── Each function must be independent and testable

FILES UPDATED:
├── voxar/engine/audio_processor.py (4 functions added)
└── voxar/engine/tests/test_audio_processing.py
DAY 3: Advanced Processing Functions
text

TASKS:
├── Function 5: apply_compression(audio, ratio=2.5, threshold=-20)
│   ├── Dynamic range compression
│   ├── Makes quiet parts louder, loud parts quieter
│   ├── Ratio: 2:1 to 3:1 (gentle)
│   ├── Threshold: -20dB
│   ├── Soft knee for natural sound
│   ├── Attack: 10ms
│   ├── Release: 100ms
│   ├── Result: fuller, more professional voice
│   └── Return compressed audio
│
├── Function 6: apply_eq(audio, preset="voice_clarity")
│   ├── High-pass filter at 80Hz:
│   │   └── Remove low rumble, room noise
│   ├── Slight boost at 2-4kHz (+2dB):
│   │   └── Adds clarity and presence
│   ├── Slight boost at 8-10kHz (+1.5dB):
│   │   └── Adds air and brightness
│   ├── Low-pass filter at 16kHz:
│   │   └── Remove harsh high frequencies
│   ├── Presets:
│   │   ├── "voice_clarity" — standard
│   │   ├── "warm" — more low-mid, less high
│   │   ├── "bright" — more high, crisp
│   │   └── "cinematic" — warm + slight presence
│   └── Return EQ'd audio
│
├── Function 7: smooth_breaths(audio)
│   ├── Detect breath sounds
│   ├── Reduce breath volume by 6-10dB (don't remove)
│   ├── Natural breaths sound human
│   ├── Removed breaths sound robotic
│   └── Return audio with smoothed breaths
│
├── Function 8: remove_artifacts(audio)
│   ├── Detect repeated audio segments (XTTS loop bug)
│   ├── Detect unnatural clicks or pops
│   ├── Smooth transitions between chunks
│   ├── Remove DC offset
│   └── Return clean audio
│
├── Test each function
├── Test combinations of functions
└── Document which combinations sound best

FILES UPDATED:
├── voxar/engine/audio_processor.py (8 functions total)
DAY 4: Complete Mastering Pipeline
text

TASKS:
├── Build VoxarAudioMaster class:
│   ├── class VoxarAudioMaster:
│   │   ├── __init__(self, config)
│   │   ├── master(self, raw_audio_path, output_path, format):
│   │   │   ├── Step 1: Load raw audio
│   │   │   ├── Step 2: Noise reduction (gentle)
│   │   │   ├── Step 3: Trim silence
│   │   │   ├── Step 4: Remove artifacts
│   │   │   ├── Step 5: Apply compression
│   │   │   ├── Step 6: Apply EQ (based on mode)
│   │   │   ├── Step 7: Smooth breaths
│   │   │   ├── Step 8: Normalize loudness (-16 LUFS)
│   │   │   ├── Step 9: Remove clipping (final safety)
│   │   │   ├── Step 10: Export
│   │   │   │   ├── MP3 (320kbps for paid, 128kbps for free)
│   │   │   │   └── WAV (16-bit, 44100Hz for paid users)
│   │   │   └── Return: output file path + metadata
│   │   ├── get_audio_info(self, audio_path):
│   │   │   ├── Duration
│   │   │   ├── Sample rate
│   │   │   ├── Loudness (LUFS)
│   │   │   ├── Peak level
│   │   │   └── File size
│   │   └── master_chunked(self, chunk_paths, output_path):
│   │       ├── Process each chunk
│   │       ├── Concatenate with crossfade
│   │       ├── Final master pass
│   │       └── Export single file
│
├── Mode-specific mastering profiles:
│   ├── Flash: Minimal processing (speed priority)
│   │   └── Steps: trim + normalize + export
│   ├── Cinematic: Full processing
│   │   └── Steps: ALL steps + warm EQ preset
│   ├── Longform: Stability focused
│   │   └── Steps: ALL steps + breath smoothing priority
│   └── Multilingual: Standard processing
│       └── Steps: ALL steps + voice clarity EQ
│
├── Test complete pipeline:
│   ├── Generate raw audio → master → compare
│   ├── Test with all 4 modes
│   ├── Test with all languages
│   ├── A/B comparison: raw vs mastered
│   └── The difference should be DRAMATIC
│
├── Benchmark processing time:
│   ├── 10 second audio → mastering time?
│   ├── 30 second audio → mastering time?
│   ├── 60 second audio → mastering time?
│   ├── Target: < 2 seconds for 30 second audio
│   └── This runs on CPU, not GPU
│
└── Mastering pipeline is COMPLETE

FILES CREATED/UPDATED:
├── voxar/engine/audio_processor.py (complete class)
├── voxar/engine/mastering_profiles/
│   ├── flash.json
│   ├── cinematic.json
│   ├── longform.json
│   └── multilingual.json
DAY 5: Quality Validator + Export System
text

TASKS:
├── Build VoxarQualityValidator class:
│   ├── validate(self, audio_path):
│   │   ├── Check 1: Duration
│   │   │   ├── Is it > 0.5 seconds?
│   │   │   ├── Is it reasonable for input text length?
│   │   │   └── Flag if suspiciously short
│   │   ├── Check 2: Silence ratio
│   │   │   ├── What percentage is silence?
│   │   │   ├── Flag if > 30% silence
│   │   │   └── Indicates generation failure
│   │   ├── Check 3: Volume levels
│   │   │   ├── Is loudness within -20 to -12 LUFS?
│   │   │   ├── Any clipping detected?
│   │   │   └── Flag if outside range
│   │   ├── Check 4: Repetition detection
│   │   │   ├── Are there repeated audio segments?
│   │   │   ├── XTTS sometimes loops
│   │   │   └── Flag if repetition found
│   │   ├── Check 5: Artifacts
│   │   │   ├── Unusual frequency spikes?
│   │   │   ├── Click/pop detection
│   │   │   └── Flag if artifacts found
│   │   └── Return:
│   │       ├── quality_score (0-100)
│   │       ├── passed (boolean)
│   │       ├── issues (list of problems)
│   │       └── recommendation ("retry" or "accept")
│   │
│   ├── Thresholds:
│   │   ├── Score >= 80: Accept
│   │   ├── Score 60-79: Accept with warning
│   │   ├── Score < 60: Auto-retry once
│   │   └── Score < 40: Reject, refund credits
│
├── Build export functions:
│   ├── export_mp3(audio, quality="high"):
│   │   ├── quality="high" → 320kbps (paid users)
│   │   ├── quality="standard" → 128kbps (free users)
│   │   ├── Proper ID3 tags:
│   │   │   ├── Title: script first 50 chars
│   │   │   ├── Artist: "VOXAR Studio"
│   │   │   ├── Album: "VOXAR Generation"
│   │   │   └── Year: current year
│   │   └── Return file path + file size
│   ├── export_wav(audio):
│   │   ├── 16-bit, 44100Hz (CD quality)
│   │   ├── No compression
│   │   ├── Studio-grade output
│   │   ├── Available for paid plans only
│   │   └── Return file path + file size
│   └── Both exports must work flawlessly
│
├── Build audio watermark (for free tier):
│   ├── Add subtle "Powered by VOXAR" at end
│   ├── 2 second spoken watermark
│   ├── Pre-generate watermark audio once
│   ├── Append to free user outputs only
│   ├── Paid users: no watermark
│   └── This drives upgrades
│
├── Integration test:
│   ├── Raw audio → Master → Validate → Export
│   ├── Test with quality score > 80
│   ├── Test with intentionally bad audio
│   ├── Test MP3 export at both qualities
│   ├── Test WAV export
│   └── Test watermark append
│
└── Phase 2 COMPLETE

FILES CREATED:
├── voxar/engine/quality_validator.py
├── voxar/engine/exporter.py
├── voxar/engine/assets/watermark.mp3
└── voxar/engine/tests/test_quality.py

PHASE 2 DELIVERABLES:
├── ✅ 8 audio processing functions
├── ✅ VoxarAudioMaster pipeline class
├── ✅ Mode-specific mastering profiles
├── ✅ VoxarQualityValidator
├── ✅ MP3 export (128kbps + 320kbps)
├── ✅ WAV export (16-bit 44100Hz)
├── ✅ Audio watermark for free tier
├── ✅ Before/after quality difference is DRAMATIC
├── ✅ Processing time < 2 seconds
└── ✅ Every output sounds professional
PHASE 3: TEXT PREPROCESSOR & LANGUAGE INTELLIGENCE
text

DURATION:   4-5 Days
HARDWARE:   Same laptop (CPU-only, no GPU needed)
GOAL:       Handle every possible text input before sending to XTTS
DEPENDS ON: Phase 1 complete
DAY 1: Number & Currency Handling
text

TASKS:
├── Build number_to_words.py:
│   ├── English:
│   │   ├── "100" → "one hundred"
│   │   ├── "1,234" → "one thousand two hundred thirty four"
│   │   ├── "3.14" → "three point one four"
│   │   ├── "1st" → "first"
│   │   ├── "2nd" → "second"
│   │   ├── "100%" → "one hundred percent"
│   │   └── Support up to billions
│   ├── Hindi:
│   │   ├── "100" → "sau" (सौ)
│   │   ├── "1,00,000" → "ek lakh"
│   │   ├── "50,00,000" → "pachaas lakh"
│   │   └── Indian numbering system (lakh, crore)
│   └── Auto-detect language context for number format
│
├── Build currency_handler.py:
│   ├── "₹500" → "five hundred rupees" (EN)
│   ├── "₹500" → "paanch sau rupaye" (HI)
│   ├── "$100" → "one hundred dollars"
│   ├── "₹1.5Cr" → "one point five crore rupees"
│   ├── "₹10L" → "ten lakh rupees"
│   ├── "₹1,00,000" → "one lakh rupees"
│   ├── "€50" → "fifty euros"
│   └── Handle decimal amounts: "₹99.99" → "ninety nine rupees and ninety nine paise"
│
├── Test with 30+ examples covering edge cases
└── All tests passing

FILES CREATED:
├── voxar/engine/preprocessor/number_handler.py
├── voxar/engine/preprocessor/currency_handler.py
└── voxar/engine/preprocessor/tests/test_numbers.py
DAY 2: Abbreviations & Special Text
text

TASKS:
├── Build abbreviation_handler.py:
│   ├── Common abbreviations:
│   │   ├── "Dr." → "Doctor"
│   │   ├── "Mr." → "Mister"
│   │   ├── "Mrs." → "Missus"
│   │   ├── "Ms." → "Miss"
│   │   ├── "govt" → "government"
│   │   ├── "govt." → "government"
│   │   ├── "etc." → "etcetera"
│   │   ├── "vs" → "versus"
│   │   ├── "vs." → "versus"
│   │   ├── "Sr." → "Senior"
│   │   ├── "Jr." → "Junior"
│   │   ├── "St." → "Saint" (context-dependent)
│   │   ├── "Ave." → "Avenue"
│   │   └── 50+ common abbreviations
│   ├── Indian specific:
│   │   ├── "MLA" → "M L A"
│   │   ├── "BJP" → "B J P"
│   │   ├── "IIT" → "I I T"
│   │   ├── "ISRO" → "ISRO" (spoken as word)
│   │   └── Detect: acronym vs abbreviation
│   └── Expandable JSON dictionary
│
├── Build special_text_handler.py:
│   ├── URLs:
│   │   ├── "https://voxar.in" → "voxar dot in"
│   │   └── Option: skip URLs entirely
│   ├── Emails:
│   │   └── "hello@voxar.in" → "hello at voxar dot in"
│   ├── Phone numbers:
│   │   ├── "+91 98765 43210" → "plus ninety one, nine eight seven six five, four three two one zero"
│   │   └── Read digit by digit
│   ├── Dates:
│   │   ├── "15/01/2025" → "fifteenth January twenty twenty five"
│   │   ├── "Jan 15, 2025" → "January fifteenth, twenty twenty five"
│   │   └── Handle Indian date formats
│   ├── Times:
│   │   ├── "3:30 PM" → "three thirty PM"
│   │   ├── "14:00" → "two PM" or "fourteen hundred hours"
│   │   └── Configurable format
│   ├── Mathematical:
│   │   ├── "+" → "plus"
│   │   ├── "=" → "equals"
│   │   ├── ">" → "greater than"
│   │   └── Common math symbols
│   └── Emojis:
│       └── Remove or replace with description
│
├── Test with real-world scripts (news articles, blog posts)
└── Handle every edge case gracefully

FILES CREATED:
├── voxar/engine/preprocessor/abbreviation_handler.py
├── voxar/engine/preprocessor/special_text_handler.py
├── voxar/engine/preprocessor/dictionaries/abbreviations.json
└── voxar/engine/preprocessor/dictionaries/indian_abbreviations.json
DAY 3: Hinglish & Code-Mixing Intelligence
text

TASKS:
├── Build hinglish_handler.py:
│   ├── THIS IS CRITICAL FOR INDIAN MARKET
│   ├── Detect language per sentence:
│   │   ├── "Yeh bahut amazing hai" → Hinglish
│   │   ├── "This is great" → English
│   │   ├── "यह बहुत अच्छा है" → Hindi (Devanagari)
│   │   └── Use character analysis + word frequency
│   ├── Transliteration support:
│   │   ├── "namaste" → treated as Hindi word
│   │   ├── "accha" → treated as Hindi word
│   │   └── Common Romanized Hindi word dictionary
│   ├── Language tag per segment:
│   │   ├── Split text into segments
│   │   ├── Tag each: [EN], [HI], [HINGLISH]
│   │   └── Pass correct language to XTTS per segment
│   ├── Script detection:
│   │   ├── Devanagari (Hindi, Marathi)
│   │   ├── Latin (English, Romanized Hindi)
│   │   ├── Tamil script
│   │   ├── Telugu script
│   │   ├── Bengali script
│   │   └── Auto-detect and route correctly
│   └── Hinglish word dictionary:
│       ├── 500+ common Hinglish words
│       ├── "achha" → Hindi pronunciation
│       ├── "bahut" → Hindi pronunciation
│       └── Expandable JSON file
│
├── Test with 20 Hinglish scripts:
│   ├── "Bhai yeh product bahut amazing hai"
│   ├── "Aaj ka weather kaisa hai"
│   ├── "Meeting cancel ho gayi hai"
│   ├── "Yeh VOXAR ka new feature hai"
│   └── Mixed Devanagari + Latin text
│
└── This is your COMPETITIVE ADVANTAGE over ElevenLabs

FILES CREATED:
├── voxar/engine/preprocessor/hinglish_handler.py
├── voxar/engine/preprocessor/language_detector.py
├── voxar/engine/preprocessor/dictionaries/hinglish_words.json
└── voxar/engine/preprocessor/tests/test_hinglish.py
DAY 4: Pause & Emphasis Controls
text

TASKS:
├── Build pause_controller.py:
│   ├── Punctuation-based pauses:
│   │   ├── "." (period) → 500ms pause
│   │   ├── "," (comma) → 200ms pause
│   │   ├── ";" (semicolon) → 350ms pause
│   │   ├── ":" (colon) → 300ms pause
│   │   ├── "..." (ellipsis) → 800ms pause
│   │   ├── "!" (exclamation) → 400ms pause + emphasis
│   │   ├── "?" (question) → 400ms pause + rising tone hint
│   │   └── "\n\n" (paragraph break) → 1000ms pause
│   ├── Custom pause markers:
│   │   ├── "[pause:0.5s]" → 500ms pause
│   │   ├── "[pause:1s]" → 1 second pause
│   │   ├── "[pause:2s]" → 2 second pause
│   │   ├── "[breath]" → insert natural breath sound
│   │   └── Strip markers before sending to XTTS
│   └── Apply pauses by inserting silence in audio
│
├── Build emphasis_handler.py:
│   ├── Detect emphasis markers:
│   │   ├── *word* → slight emphasis
│   │   ├── **word** → strong emphasis
│   │   ├── ALLCAPS → emphatic delivery
│   │   └── _word_ → softer, whisper-like
│   ├── Implementation:
│   │   ├── Strip markers from text
│   │   ├── Store emphasis map: {word_index: emphasis_type}
│   │   ├── Adjust XTTS parameters per segment
│   │   └── OR apply post-processing emphasis
│   └── This is advanced — basic version first
│
├── Test natural flow:
│   ├── Text with many commas vs periods
│   ├── Text with custom pauses
│   ├── Dialogue text with quotes
│   └── Compare: with vs without pause control
│
└── Result should sound more natural and human

FILES CREATED:
├── voxar/engine/preprocessor/pause_controller.py
├── voxar/engine/preprocessor/emphasis_handler.py
└── voxar/engine/preprocessor/tests/test_pauses.py
DAY 5: Complete Preprocessor Pipeline
text

TASKS:
├── Build ScriptPreprocessor class (master pipeline):
│   ├── class ScriptPreprocessor:
│   │   ├── __init__(self, language="auto"):
│   │   │   ├── Load all sub-modules
│   │   │   ├── Load dictionaries
│   │   │   └── Set default language
│   │   ├── process(self, raw_text, language="auto"):
│   │   │   ├── Step 1: Clean whitespace/formatting
│   │   │   ├── Step 2: Detect language (if auto)
│   │   │   ├── Step 3: Handle Hinglish/code-mixing
│   │   │   ├── Step 4: Expand numbers
│   │   │   ├── Step 5: Expand currency
│   │   │   ├── Step 6: Expand abbreviations
│   │   │   ├── Step 7: Handle special text (URLs, emails)
│   │   │   ├── Step 8: Apply pronunciation dictionary
│   │   │   ├── Step 9: Process pause markers
│   │   │   ├── Step 10: Process emphasis markers
│   │   │   ├── Step 11: Split into chunks (if long)
│   │   │   └── Return: ProcessedScript object
│   │   ├── ProcessedScript:
│   │   │   ├── chunks: list of text chunks
│   │   │   ├── language: detected language
│   │   │   ├── pause_map: where to add pauses
│   │   │   ├── emphasis_map: where to add emphasis
│   │   │   ├── original_text: unchanged input
│   │   │   ├── processed_text: fully processed
│   │   │   └── character_count: for credit calculation
│   │   └── add_pronunciation(self, word, phonetic):
│   │       └── Add custom pronunciation rule
│
├── Build pronunciation dictionary:
│   ├── JSON file structure:
│   │   {
│   │     "VOXAR": "VOK-SAR",
│   │     "Bengaluru": "BEN-ga-LOO-ru",
│   │     "AI": "A.I.",
│   │     "API": "A.P.I.",
│   │     "WiFi": "why-fye"
│   │   }
│   ├── Per-language dictionaries:
│   │   ├── pronunciations_en.json
│   │   ├── pronunciations_hi.json
│   │   └── pronunciations_ta.json
│   └── Users can add custom rules (Phase 8 UI)
│
├── End-to-end integration test:
│   ├── Raw text → Preprocessor → XTTS → Mastering → Export
│   ├── Test 10 different real-world scripts
│   ├── Compare: with vs without preprocessing
│   ├── The improvement should be significant
│   └── Document any remaining issues
│
└── Phase 3 COMPLETE

FILES CREATED:
├── voxar/engine/preprocessor/script_preprocessor.py (master class)
├── voxar/engine/preprocessor/dictionaries/pronunciations_en.json
├── voxar/engine/preprocessor/dictionaries/pronunciations_hi.json
└── voxar/engine/preprocessor/tests/test_full_pipeline.py

PHASE 3 DELIVERABLES:
├── ✅ Number-to-words (English + Hindi + Indian numbering)
├── ✅ Currency handling (₹, $, €)
├── ✅ 50+ abbreviation expansions
├── ✅ Special text handling (URLs, emails, dates, times)
├── ✅ Hinglish detection and handling
├── ✅ Language auto-detection
├── ✅ Pause controls (punctuation + custom markers)
├── ✅ Emphasis markers (basic)
├── ✅ Pronunciation dictionary (expandable)
├── ✅ Complete ScriptPreprocessor pipeline
├── ✅ End-to-end integration tested
└── ✅ Real-world scripts sound natural
PHASE 4: VOICE LIBRARY CREATION
text

DURATION:   5-7 Days
HARDWARE:   Same laptop + good internet for downloading datasets
GOAL:       Create 25 premium, curated, production-ready voices
DEPENDS ON: Phase 1 + Phase 2 complete
DAY 1-2: Voice Sample Collection
text

TASKS:
├── Source 1: Free voice datasets (download):
│   ├── LibriTTS (English — high quality):
│   │   └── Select 6-8 diverse English speakers
│   ├── IndicTTS (Indian languages):
│   │   ├── Hindi speakers
│   │   ├── Tamil speakers
│   │   ├── Telugu speakers
│   │   └── Bengali speakers
│   ├── Common Voice by Mozilla:
│   │   ├── Marathi speakers
│   │   └── Additional Indian languages
│   └── OpenSLR:
│       └── Additional clean samples
│
├── Source 2: Self-recorded samples:
│   ├── Record your own voice (if suitable)
│   ├── Ask friends/family to record
│   ├── Requirements:
│   │   ├── Quiet room (no echo, no fan noise)
│   │   ├── Phone close to mouth (6-12 inches)
│   │   ├── Read a scripted paragraph clearly
│   │   ├── 30-60 seconds of continuous speech
│   │   ├── Natural pace, not rushed
│   │   └── Single speaker only
│   └── Record in best quality available
│
├── For each potential voice, collect:
│   ├── 30-60 second clean audio clip
│   ├── Speaker gender
│   ├── Estimated age range
│   ├── Language(s) spoken
│   ├── Accent description
│   ├── Emotional style (warm, neutral, energetic)
│   └── Overall quality assessment (1-10)
│
├── Target: 30-35 raw samples:
│   └── We will select the best 25 after testing
│
├── Voice distribution target:
│   ├── English:  6 voices (3 male, 3 female)
│   ├── Hindi:    8 voices (4 male, 4 female)
│   ├── Tamil:    3 voices (2 male, 1 female)
│   ├── Telugu:   3 voices (1 male, 2 female)
│   ├── Bengali:  3 voices (2 male, 1 female)
│   └── Marathi:  2 voices (1 male, 1 female)
│   └── TOTAL:    25 voices (13 male, 12 female)
│
├── Style distribution:
│   ├── Narration:      8 voices
│   ├── Ad/Commercial:  5 voices
│   ├── Calm/Soothing:  4 voices
│   ├── Energetic:      4 voices
│   └── Cinematic:      4 voices
│
└── Organize files in voices/raw_samples/

FILES CREATED:
├── voxar/voices/raw_samples/ (30-35 audio files)
└── voxar/voices/collection_log.md
DAY 3: Voice Sample Cleaning
text

TASKS:
├── For EACH raw sample (all 30-35):
│   ├── Step 1: Convert to WAV 22050Hz mono
│   │   └── FFmpeg command or pydub
│   ├── Step 2: Apply noise reduction
│   │   ├── Use noisereduce library
│   │   ├── Aggressive but not destructive
│   │   └── Remove background hum/hiss
│   ├── Step 3: Trim silence from start and end
│   │   └── Keep 200ms padding
│   ├── Step 4: Normalize volume to -16 LUFS
│   │   └── Consistent across all samples
│   ├── Step 5: Remove any music or effects
│   │   └── Manual if needed
│   ├── Step 6: Trim to 30-60 seconds
│   │   ├── Select the clearest portion
│   │   └── Avoid sections with errors or unclear speech
│   ├── Step 7: Quality check
│   │   ├── Listen to cleaned sample
│   │   ├── Rate quality (1-10)
│   │   ├── Is speech clear?
│   │   ├── Is there only one speaker?
│   │   └── Any remaining noise?
│   └── Step 8: Accept or reject
│       ├── Quality >= 7: Accept
│       ├── Quality 5-6: Try re-cleaning
│       └── Quality < 5: Reject, find replacement
│
├── Build automated cleaning script:
│   ├── clean_voice_sample(input_path, output_path)
│   ├── Batch process all samples
│   └── Manual review after automated cleaning
│
├── After cleaning:
│   ├── 25-30 cleaned samples should pass
│   └── Select final 25 best voices
│
└── Save cleaned samples in voices/cleaned_samples/

FILES CREATED:
├── voxar/voices/cleaned_samples/ (25-30 clean files)
├── voxar/engine/voice_cleaner.py
└── voxar/voices/cleaning_report.md
DAY 4: Speaker Embedding Extraction
text

TASKS:
├── For EACH of the final 25 cleaned samples:
│   ├── Step 1: Load cleaned audio
│   ├── Step 2: Extract speaker embedding using XTTS
│   │   └── Use extract_embedding() from Phase 1
│   ├── Step 3: Save embedding as .pth file
│   │   └── Format: v{id}_{name}.pth
│   ├── Step 4: Test — generate sample text with this embedding
│   │   ├── English: "Welcome to VOXAR Studio"
│   │   └── If multi-language voice: test in each language
│   ├── Step 5: Compare output voice with original sample
│   │   ├── Does it sound like the same person?
│   │   ├── Rate similarity (1-10)
│   │   ├── Similarity >= 7: Accept
│   │   ├── Similarity 5-6: Re-extract with different sample section
│   │   └── Similarity < 5: Replace voice
│   ├── Step 6: Document voice characteristics
│   │   ├── Pitch: low / medium / high
│   │   ├── Speed: slow / medium / fast
│   │   ├── Warmth: warm / neutral / cool
│   │   ├── Energy: calm / moderate / energetic
│   │   └── Best suited for: narration / ads / meditation / etc
│   └── Step 7: Assign voice ID
│       └── v001 through v025
│
├── Batch extraction script:
│   ├── Process all 25 voices
│   ├── Save embeddings
│   ├── Generate test outputs
│   └── Report results
│
└── All 25 embeddings saved and tested

FILES CREATED:
├── voxar/voices/embeddings/ (25 .pth files)
├── voxar/voices/test_outputs/ (test generations)
└── voxar/voices/embedding_report.md
DAY 5: Preview Generation
text

TASKS:
├── Design preview scripts (SHORT — 5-8 seconds of audio):
│   ├── English Preview Script:
│   │   "Welcome to VOXAR Studio. Every voice tells a story.
│   │    Let yours be heard."
│   ├── Hindi Preview Script:
│   │   "VOXAR Studio mein aapka swagat hai.
│   │    Har awaaz ek kahani sunati hai."
│   ├── Tamil Preview Script:
│   │   "VOXAR Studio-ku varavergiren.
│   │    Ungal kural oru kadhai solkiradhu."
│   ├── Telugu Preview Script:
│   │   "VOXAR Studio ki swaagatham.
│   │    Mee gonthu oka katha chepthundhi."
│   ├── Bengali Preview Script:
│   │   "VOXAR Studio-te apnake swagotom.
│   │    Apnar kontho ekti golpo bole."
│   └── Marathi Preview Script:
│       "VOXAR Studio madhye aapla swagat aahe.
│        Tumcha awaaz ek katha sangto."
│
├── Generate previews:
│   ├── For each voice:
│   │   ├── Generate preview in primary language
│   │   ├── If bilingual: generate in both languages
│   │   ├── Use VOXAR Cinematic mode (best quality)
│   │   ├── Apply full mastering pipeline
│   │   └── Export as MP3 (320kbps)
│   ├── File naming:
│   │   ├── v001_arjun_en_preview.mp3
│   │   ├── v001_arjun_hi_preview.mp3
│   │   └── Consistent naming convention
│   └── Listen to EVERY preview
│       ├── Does it represent the voice well?
│       ├── Is quality premium?
│       └── Re-generate if not perfect
│
├── These previews are PRE-CACHED:
│   ├── Generated ONCE during this phase
│   ├── Stored as static files
│   ├── Served instantly when user clicks Preview
│   ├── NEVER generated on-demand
│   └── This is why previews feel instant
│
└── All 25 voices have at least 1 preview each

FILES CREATED:
├── voxar/voices/previews/ (25-50 preview MP3 files)
└── voxar/voices/preview_scripts.json
DAY 6: Voice Catalog Creation
text

TASKS:
├── Build voices_catalog.json:
│   ├── Complete metadata for all 25 voices
│   ├── Structure per voice:
│   │   {
│   │     "id": "v001",
│   │     "name": "Arjun",
│   │     "display_name": "Arjun — The Narrator",
│   │     "gender": "male",
│   │     "age_range": "25-35",
│   │     "languages": ["en", "hi"],
│   │     "primary_language": "en",
│   │     "accent": "neutral_indian",
│   │     "styles": ["narration", "calm"],
│   │     "description": "Warm, authoritative voice perfect
│   │                      for documentaries and podcasts",
│   │     "tags": ["deep", "warm", "professional", "storytelling"],
│   │     "pitch": "medium-low",
│   │     "energy": "calm",
│   │     "warmth": "warm",
│   │     "preview_urls": {
│   │       "en": "previews/v001_arjun_en_preview.mp3",
│   │       "hi": "previews/v001_arjun_hi_preview.mp3"
│   │     },
│   │     "embedding_path": "embeddings/v001_arjun.pth",
│   │     "is_premium": false,
│   │     "quality_score": 92,
│   │     "usage_count": 0,
│   │     "created_at": "2025-01-15T00:00:00Z"
│   │   }
│   └── Repeat for all 25 voices
│
├── Create naming theme:
│   ├── Give each voice a character name
│   ├── Indian names for Indian voices
│   ├── International names for English voices
│   ├── Examples:
│   │   ├── v001: Arjun — The Narrator (Male, EN/HI)
│   │   ├── v002: Priya — The Storyteller (Female, HI)
│   │   ├── v003: Kabir — The Presenter (Male, HI)
│   │   ├── v004: Aisha — The Anchor (Female, EN)
│   │   ├── v005: Rohan — The Advertiser (Male, EN)
│   │   ├── v006: Meera — Calm & Soothing (Female, HI)
│   │   └── ... (all 25)
│   └── Names create emotional connection
│
├── Mark premium voices:
│   ├── 5 voices marked as "is_premium: true"
│   ├── These require Starter+ plan
│   ├── Free users can preview but not generate
│   └── Creates upgrade incentive
│
├── Validate catalog:
│   ├── All 25 voices have complete metadata
│   ├── All embedding paths exist
│   ├── All preview files exist
│   ├── No duplicate IDs
│   └── All languages covered
│
└── Voice catalog is COMPLETE

FILES CREATED:
├── voxar/voices/voices_catalog.json (complete)
└── voxar/voices/catalog_validation.py
DAY 7: End-to-End Voice Library Test
text

TASKS:
├── For EACH of the 25 voices:
│   ├── Generate 3 different scripts:
│   │   ├── Short script (50 chars)
│   │   ├── Medium script (200 chars)
│   │   └── Long script (500 chars)
│   ├── Test in all applicable VOXAR modes:
│   │   ├── Flash
│   │   ├── Cinematic
│   │   ├── Longform
│   │   └── Multilingual (if multi-language voice)
│   ├── Apply full pipeline:
│   │   ├── Preprocessor → XTTS → Mastering → Validate → Export
│   │   └── Complete end-to-end flow
│   ├── Rate each combination:
│   │   ├── Quality score
│   │   ├── Voice consistency
│   │   ├── Pronunciation accuracy
│   │   └── Overall rating
│   ├── Document issues:
│   │   ├── Voice X has issues with Hindi numbers
│   │   ├── Voice Y sounds robotic in Cinematic mode
│   │   └── Voice Z has inconsistent pitch
│   └── Fix or replace problem voices
│
├── Create "VOXAR Voice Library v1.0" summary:
│   ├── 25 voices total
│   ├── Quality scores for each
│   ├── Best use case for each voice
│   ├── Known issues per voice
│   └── Recommended mode per voice
│
├── Everything is ready for API integration
│
└── Phase 4 COMPLETE

PHASE 4 DELIVERABLES:
├── ✅ 25 premium voices curated and tested
├── ✅ All voice samples cleaned to studio standard
├── ✅ Speaker embeddings extracted and saved
├── ✅ Preview audio for each voice (pre-generated)
├── ✅ Complete voice catalog JSON with metadata
├── ✅ 5 premium voices marked (upgrade incentive)
├── ✅ Each voice tested across all modes
├── ✅ Quality scores assigned (all >= 75)
├── ✅ Diverse: gender, language, style, age
├── ✅ Character names assigned
└── ✅ Voice Library v1.0 COMPLETE
PHASE 5: FASTAPI AI ENGINE SERVER
text

DURATION:   5-6 Days
HARDWARE:   Same laptop for development
GOAL:       Wrap all AI engines into production-ready API
DEPENDS ON: Phase 1 + 2 + 3 + 4 complete
DAY 1: FastAPI Foundation
text

TASKS:
├── Install FastAPI + dependencies:
│   ├── fastapi
│   ├── uvicorn (ASGI server)
│   ├── python-multipart (file uploads)
│   ├── pydantic (data validation)
│   └── aiofiles (async file handling)
│
├── Create api/main.py:
│   ├── FastAPI app initialization
│   ├── CORS middleware (allow frontend origin)
│   ├── Load XTTS model ONCE at startup:
│   │   ├── @app.on_event("startup")
│   │   ├── Load model into GPU memory
│   │   ├── Load voice catalog
│   │   ├── Initialize preprocessor
│   │   ├── Initialize audio master
│   │   └── Log: "VOXAR Engine loaded successfully"
│   └── App is ready to receive requests
│
├── Basic endpoints:
│   ├── GET / → {"status": "VOXAR Engine running", "version": "1.0"}
│   ├── GET /health → {"gpu": true, "model": "loaded", "vram_free": "3.2GB"}
│   ├── GET /model/info → model details and capabilities
│   └── All return JSON
│
├── Request/Response models (Pydantic):
│   ├── TTSRequest:
│   │   ├── text: str (required, max 5000 chars)
│   │   ├── voice_id: str (required)
│   │   ├── mode: str (flash/cinematic/longform/multilingual)
│   │   ├── language: str (auto/en/hi/ta/te/bn/mr)
│   │   ├── output_format: str (mp3/wav)
│   │   └── speed: float (0.5 to 2.0, default 1.0)
│   ├── TTSResponse:
│   │   ├── job_id: str
│   │   ├── status: str
│   │   ├── audio_url: str
│   │   ├── duration: float
│   │   ├── characters_used: int
│   │   ├── processing_time: float
│   │   └── quality_score: int
│   └── ErrorResponse:
│       ├── error: str
│       ├── code: int
│       └── detail: str
│
├── API key middleware:
│   ├── Simple API key authentication
│   ├── X-API-Key header required
│   ├── Key stored in environment variable
│   └── Protects engine from unauthorized access
│
├── Test server starts without errors
│   └── uvicorn api.main:app --host 0.0.0.0 --port 8000
│
└── FastAPI docs available at /docs

FILES CREATED:
├── voxar/api/main.py
├── voxar/api/models/requests.py
├── voxar/api/models/responses.py
├── voxar/api/middleware/auth.py
└── voxar/api/.env
DAY 2: TTS Generation Endpoint
text

TASKS:
├── Build POST /api/v1/generate:
│   ├── Receive TTSRequest
│   ├── Validate input:
│   │   ├── Text not empty
│   │   ├── Text within character limit
│   │   ├── voice_id exists in catalog
│   │   ├── mode is valid
│   │   ├── language is supported
│   │   └── Return 400 with clear error if invalid
│   ├── Processing pipeline:
│   │   ├── 1. Preprocess text (ScriptPreprocessor)
│   │   ├── 2. Load voice embedding
│   │   ├── 3. Load mode config
│   │   ├── 4. Generate audio (XTTS)
│   │   │   ├── If text > chunk_size: use chunked generation
│   │   │   └── If text <= chunk_size: single generation
│   │   ├── 5. Master audio (VoxarAudioMaster)
│   │   ├── 6. Validate quality (VoxarQualityValidator)
│   │   │   ├── If quality < 60: retry once
│   │   │   └── If retry also fails: return error
│   │   ├── 7. Export to requested format (MP3/WAV)
│   │   ├── 8. Save file with unique name
│   │   └── 9. Return response with audio URL
│   ├── File naming:
│   │   └── {timestamp}_{job_id}_{voice_id}.{format}
│   ├── Serve generated files:
│   │   ├── Static file serving from output directory
│   │   └── Or return file directly in response
│   └── Measure and return processing_time
│
├── Test with multiple scenarios:
│   ├── Short English text + Flash mode
│   ├── Long Hindi text + Longform mode
│   ├── Hinglish text + Multilingual mode
│   ├── Various voices from library
│   ├── MP3 output
│   ├── WAV output
│   ├── Invalid voice_id (should return 400)
│   ├── Empty text (should return 400)
│   ├── Text too long (should return 413)
│   └── All tests pass
│
└── Core endpoint WORKING

FILES CREATED:
├── voxar/api/routes/tts.py
└── voxar/api/tests/test_tts_endpoint.py
DAY 3: Voice Library + File Serving Endpoints
text

TASKS:
├── Build voice library endpoints:
│   ├── GET /api/v1/voices
│   │   ├── Return complete voice catalog
│   │   ├── Query parameters:
│   │   │   ├── language (filter by language)
│   │   │   ├── gender (filter by gender)
│   │   │   ├── style (filter by style)
│   │   │   └── premium (true/false)
│   │   └── Return: list of voice objects
│   │
│   ├── GET /api/v1/voices/{voice_id}
│   │   ├── Return single voice details
│   │   ├── Include all metadata
│   │   └── 404 if voice not found
│   │
│   ├── GET /api/v1/voices/{voice_id}/preview/{language}
│   │   ├── Stream preview audio file
│   │   ├── Content-Type: audio/mpeg
│   │   ├── Directly playable in browser
│   │   └── 404 if preview not available
│   │
│   └── GET /api/v1/modes
│       ├── Return available VOXAR modes
│       ├── Include description for each
│       └── Include credit multiplier for each
│
├── Build file serving:
│   ├── GET /api/v1/files/{filename}
│   │   ├── Serve generated audio files
│   │   ├── Proper Content-Type headers
│   │   ├── Content-Disposition for download
│   │   └── 404 if file not found
│   ├── File cleanup:
│   │   ├── Delete files older than 24 hours
│   │   ├── Run as background task
│   │   └── Prevents disk from filling up
│   └── File size limit monitoring
│
├── Test all endpoints:
│   ├── List all voices
│   ├── Filter voices by language
│   ├── Get single voice
│   ├── Play preview
│   ├── Download generated file
│   └── All respond correctly
│
└── All read endpoints working

FILES CREATED:
├── voxar/api/routes/voices.py
├── voxar/api/routes/files.py
└── voxar/api/tests/test_voices_endpoint.py
DAY 4: Job Queue System
text

TASKS:
├── Build job queue (in-memory for development):
│   ├── class JobQueue:
│   │   ├── __init__(self, max_concurrent=1, max_queue_size=10):
│   │   ├── add_job(self, job_data) → job_id
│   │   │   ├── If queue full: return 429 (Queue Full)
│   │   │   ├── Create job with status "queued"
│   │   │   ├── Add to queue
│   │   │   └── Return job_id and queue position
│   │   ├── process_next(self):
│   │   │   ├── Take next job from queue
│   │   │   ├── Set status "processing"
│   │   │   ├── Execute generation
│   │   │   ├── Set status "completed" or "failed"
│   │   │   └── Store result
│   │   ├── get_job_status(self, job_id):
│   │   │   ├── Return current status
│   │   │   ├── If queued: return position
│   │   │   ├── If processing: return progress estimate
│   │   │   ├── If completed: return audio URL
│   │   │   └── If failed: return error message
│   │   ├── cancel_job(self, job_id)
│   │   └── cleanup_old_jobs(self, max_age_minutes=60)
│   │
│   ├── Job states:
│   │   ├── queued → waiting in line
│   │   ├── processing → GPU is working on it
│   │   ├── completed → audio ready
│   │   ├── failed → error occurred
│   │   └── cancelled → user cancelled
│   │
│   └── Concurrency control:
│       ├── RTX 4060 (dev): max_concurrent = 1
│       ├── RTX 3090 (prod): max_concurrent = 2
│       ├── Process jobs sequentially
│       └── Queue overflow protection
│
├── Update POST /api/v1/generate:
│   ├── Now returns immediately with job_id
│   ├── Job is added to queue
│   ├── Processing happens asynchronously
│   └── Client polls for status
│
├── Build status endpoint:
│   ├── GET /api/v1/jobs/{job_id}
│   │   ├── Return job status
│   │   ├── If completed: include audio_url
│   │   └── If failed: include error details
│   │
│   └── Optional: WebSocket /ws/jobs/{job_id}
│       ├── Real-time status updates
│       ├── Push notification when complete
│       └── Better UX than polling
│
├── Test queue behavior:
│   ├── Submit 1 job → processes immediately
│   ├── Submit 3 jobs → first processes, others queue
│   ├── Submit 15 jobs → queue full error for 11th+
│   ├── Job completes → next job starts automatically
│   ├── Job fails → error stored, next job starts
│   └── All queue scenarios handled
│
└── Queue system prevents GPU crashes

FILES CREATED:
├── voxar/api/queue/job_queue.py
├── voxar/api/routes/jobs.py
└── voxar/api/tests/test_queue.py
DAY 5: Error Handling & Logging
text

TASKS:
├── Global exception handler:
│   ├── Catch all unhandled exceptions
│   ├── Return clean JSON error response
│   ├── Log full traceback
│   └── Never expose internal errors to client
│
├── Custom error responses:
│   ├── 400 Bad Request:
│   │   ├── Invalid input text
│   │   ├── Invalid voice_id
│   │   ├── Invalid mode
│   │   └── Missing required fields
│   ├── 401 Unauthorized:
│   │   └── Invalid or missing API key
│   ├── 404 Not Found:
│   │   ├── Voice not found
│   │   ├── Job not found
│   │   └── File not found
│   ├── 413 Payload Too Large:
│   │   └── Text exceeds character limit
│   ├── 429 Too Many Requests:
│   │   ├── Queue full
│   │   └── Rate limit exceeded
│   ├── 500 Internal Server Error:
│   │   ├── Generation failed
│   │   ├── GPU error
│   │   └── Model error
│   └── 503 Service Unavailable:
│       ├── Model not loaded
│       └── GPU out of memory
│
├── Logging system:
│   ├── Use Python logging module
│   ├── Log to file: voxar_engine.log
│   ├── Log to console: for development
│   ├── Log levels:
│   │   ├── INFO: Every request received
│   │   ├── INFO: Generation completed (with timing)
│   │   ├── WARNING: Quality score low
│   │   ├── WARNING: Queue getting full
│   │   ├── ERROR: Generation failed
│   │   ├── ERROR: GPU error
│   │   └── CRITICAL: Model crashed
│   ├── Log format:
│   │   └── [2025-01-15 10:30:00] [INFO] [tts] Generated v001 | 250 chars | 3.2s | quality: 88
│   └── Log rotation (max 50MB per file)
│
├── Rate limiting:
│   ├── Max 10 requests per minute per API key
│   ├── Max text length: 5000 characters per request
│   ├── Max file upload: 20MB
│   └── Return 429 when exceeded
│
├── GPU monitoring:
│   ├── Log VRAM usage after each generation
│   ├── Warn if VRAM > 80% usage
│   ├── Auto cleanup GPU cache if needed
│   └── torch.cuda.empty_cache() after generation
│
└── Engine is robust and debuggable

FILES CREATED:
├── voxar/api/middleware/error_handler.py
├── voxar/api/middleware/rate_limiter.py
├── voxar/api/utils/logger.py
├── voxar/api/utils/gpu_monitor.py
└── voxar/api/tests/test_error_handling.py
DAY 6: Testing & Documentation
text

TASKS:
├── Complete test suite:
│   ├── test_generate_english.py
│   ├── test_generate_hindi.py
│   ├── test_generate_multilingual.py
│   ├── test_long_text.py
│   ├── test_invalid_input.py
│   ├── test_all_voices.py
│   ├── test_all_modes.py
│   ├── test_queue_overflow.py
│   ├── test_rate_limiting.py
│   ├── test_file_serving.py
│   └── All tests pass
│
├── API documentation:
│   ├── FastAPI auto-docs at /docs (Swagger)
│   ├── Custom API reference document
│   ├── Example requests and responses
│   └── Error code reference
│
├── Benchmark report:
│   ├── Average generation time per 100 characters
│   ├── VRAM usage per mode
│   ├── Queue throughput (jobs per minute)
│   ├── Error rate
│   ├── Quality score distribution
│   └── Save as performance_benchmark.md
│
├── Create Postman collection:
│   ├── All endpoints documented
│   ├── Example payloads
│   └── Easy testing for anyone
│
└── Phase 5 COMPLETE

PHASE 5 DELIVERABLES:
├── ✅ FastAPI server running on port 8000
├── ✅ POST /generate endpoint (async, queued)
├── ✅ GET /voices endpoints (library, filter, preview)
├── ✅ GET /jobs/{id} (status checking)
├── ✅ Job queue (max 1 concurrent, max 10 queued)
├── ✅ Rate limiting
├── ✅ Error handling for every scenario
├── ✅ Logging system
├── ✅ GPU monitoring
├── ✅ API key authentication
├── ✅ File serving and cleanup
├── ✅ Complete test suite
├── ✅ API documentation
└── ✅ Engine is PRODUCTION READY
PHASE 6: VOICE CLONING ENGINE
text

DURATION:   4-5 Days
HARDWARE:   Same laptop
GOAL:       Let users clone their voice with 30-60 second sample
DEPENDS ON: Phase 5 complete
DAY 1: Cloning Pipeline Design
text

TASKS:
├── Understand XTTS v2 cloning capabilities:
│   ├── How XTTS uses reference audio for voice cloning
│   ├── Minimum audio required (6 seconds minimum, 30+ recommended)
│   ├── Maximum useful audio (60 seconds, more isn't better)
│   ├── What affects clone quality:
│   │   ├── Audio clarity (most important)
│   │   ├── Speaker consistency (same tone throughout)
│   │   ├── No background noise
│   │   ├── No music
│   │   └── Single speaker only
│   └── Embedding extraction process
│
├── Define input requirements:
│   ├── Supported formats: WAV, MP3, M4A, OGG, FLAC, WEBM
│   ├── Minimum duration: 10 seconds
│   ├── Optimal duration: 30-60 seconds
│   ├── Maximum duration: 120 seconds (trim to 60)
│   ├── Maximum file size: 20MB
│   ├── Must be single speaker
│   └── Must be primarily speech (not singing/music)
│
├── Build input validation checklist:
│   ├── File type check
│   ├── File size check
│   ├── Duration check
│   ├── Audio content check (is there speech?)
│   ├── Volume level check
│   └── Return clear error messages for each failure
│
└── Design complete cloning flow

FILES CREATED:
├── voxar/engine/clone_engine.py (skeleton)
└── voxar/docs/cloning_requirements.md
DAY 2: Audio Cleaning for Cloning
text

TASKS:
├── Build clone_audio_cleaner.py:
│   ├── Function: prepare_for_cloning(input_path):
│   │   ├── Step 1: Convert to WAV 22050Hz mono
│   │   ├── Step 2: Aggressive noise reduction
│   │   │   └── Cloning needs VERY clean audio
│   │   ├── Step 3: Remove all silence (keep only speech)
│   │   ├── Step 4: Normalize volume to -16 LUFS
│   │   ├── Step 5: Trim to max 60 seconds
│   │   │   └── Select portion with most speech
│   │   ├── Step 6: Apply light high-pass filter (remove rumble)
│   │   └── Return: cleaned audio path
│   │
│   ├── Function: validate_clone_audio(audio_path):
│   │   ├── Check 1: Is there actual speech?
│   │   │   ├── Use energy detection
│   │   │   ├── Speech should be > 60% of audio
│   │   │   └── Reject if mostly silence/noise
│   │   ├── Check 2: Is volume acceptable?
│   │   │   ├── Not too quiet (below -30 LUFS)
│   │   │   └── Not clipping
│   │   ├── Check 3: Duration after cleaning
│   │   │   └── Must be at least 10 seconds of speech
│   │   ├── Check 4: Estimate speaker count
│   │   │   ├── Basic: check for major voice changes
│   │   │   └── Warn if multiple speakers detected
│   │   └── Return:
│   │       ├── is_valid: boolean
│   │       ├── issues: list of problems
│   │       ├── quality_estimate: 1-10
│   │       └── recommendations: list of tips
│
├── Test with diverse audio inputs:
│   ├── Clean studio recording
│   ├── Phone recording (noisy)
│   ├── Recording with background music
│   ├── Very short audio (5 seconds)
│   ├── Very long audio (3 minutes)
│   ├── Multiple speakers
│   ├── Non-speech audio
│   └── Document results for each
│
└── Cleaning pipeline handles all edge cases

FILES CREATED:
├── voxar/engine/clone_audio_cleaner.py
└── voxar/engine/tests/test_clone_cleaning.py
DAY 3: Embedding Extraction & Clone Storage
text

TASKS:
├── Build VoxarCloneEngine class:
│   ├── class VoxarCloneEngine:
│   │   ├── clone_voice(self, audio_path, voice_name, user_id):
│   │   │   ├── Step 1: Validate input audio
│   │   │   ├── Step 2: Clean audio (clone_audio_cleaner)
│   │   │   ├── Step 3: Extract speaker embedding (XTTS)
│   │   │   ├── Step 4: Generate unique clone ID
│   │   │   │   └── Format: cv_{user_id}_{timestamp}
│   │   │   ├── Step 5: Save embedding file
│   │   │   │   └── Path: clones/{user_id}/{clone_id}.pth
│   │   │   ├── Step 6: Generate preview audio
│   │   │   │   ├── Use standard preview script
│   │   │   │   ├── Apply mastering
│   │   │   │   └── Save as preview MP3
│   │   │   ├── Step 7: Calculate quality score
│   │   │   │   ├── Compare preview output vs input
│   │   │   │   └── Rate similarity
│   │   │   └── Step 8: Return clone profile
│   │   │
│   │   ├── Clone profile structure:
│   │   │   {
│   │   │     "clone_id": "cv_user123_1705300000",
│   │   │     "user_id": "user123",
│   │   │     "name": "My Voice",
│   │   │     "embedding_path": "clones/user123/cv_user123_1705300000.pth",
│   │   │     "preview_url": "clones/user123/preview_cv_user123_1705300000.mp3",
│   │   │     "quality_score": 85,
│   │   │     "source_duration": 45.2,
│   │   │     "language_detected": "en",
│   │   │     "created_at": "2025-01-15T10:30:00Z"
│   │   │   }
│   │   │
│   │   ├── delete_clone(self, clone_id, user_id):
│   │   │   ├── Delete embedding file
│   │   │   ├── Delete preview file
│   │   │   └── Remove from storage
│   │   │
│   │   └── list_clones(self, user_id):
│   │       └── Return all clones for user
│
├── Test complete clone flow:
│   ├── Upload audio → Clean → Extract → Save → Preview
│   ├── Use cloned voice to generate new audio
│   ├── Compare clone output with original voice
│   ├── Test with 5 different voices
│   └── Rate quality for each
│
└── Clone engine works end-to-end

FILES CREATED:
├── voxar/engine/clone_engine.py (complete class)
├── voxar/clones/ (directory for user clones)
└── voxar/engine/tests/test_clone_engine.py
DAY 4: Clone API Endpoints
text

TASKS:
├── Build clone API endpoints:
│   ├── POST /api/v1/clone
│   │   ├── Multipart form upload
│   │   ├── Fields:
│   │   │   ├── file: audio file (required)
│   │   │   ├── name: voice name (required)
│   │   │   ├── user_id: user identifier (required)
│   │   │   └── consent: boolean (required, must be true)
│   │   ├── Validate:
│   │   │   ├── File type check
│   │   │   ├── File size check (< 20MB)
│   │   │   ├── Consent must be true
│   │   │   └── User hasn't exceeded clone limit
│   │   ├── Process through VoxarCloneEngine
│   │   ├── Return: clone profile + quality score
│   │   └── Show tips if quality < 70
│   │
│   ├── GET /api/v1/clones/{user_id}
│   │   └── List all clones for this user
│   │
│   ├── GET /api/v1/clones/{user_id}/{clone_id}
│   │   └── Get specific clone details
│   │
│   ├── DELETE /api/v1/clones/{user_id}/{clone_id}
│   │   ├── Delete clone embedding and preview
│   │   └── Confirm deletion
│   │
│   └── GET /api/v1/clones/{user_id}/{clone_id}/preview
│       └── Stream clone preview audio
│
├── Update POST /api/v1/generate:
│   ├── Now accepts EITHER voice_id OR clone_id
│   ├── If voice_id: load from voice library
│   ├── If clone_id: load from user clones
│   ├── Validate user owns the clone
│   └── Rest of pipeline unchanged
│
├── Test complete flow:
│   ├── Upload audio → Create clone → Generate with clone
│   ├── List user clones
│   ├── Delete clone
│   ├── Invalid file upload (wrong format)
│   ├── File too large
│   ├── Consent not checked
│   └── All tests pass
│
└── Clone API COMPLETE

FILES CREATED:
├── voxar/api/routes/clones.py
└── voxar/api/tests/test_clone_endpoints.py
DAY 5: Quality Testing & Edge Cases
text

TASKS:
├── Test with diverse audio inputs:
│   ├── Clean studio microphone recording → expect quality 85+
│   ├── Phone recording (quiet room) → expect quality 70-85
│   ├── Phone recording (noisy room) → expect quality 50-70
│   ├── Laptop microphone recording → expect quality 60-75
│   ├── Recording with music in background → expect low quality
│   ├── Recording of different accents → test consistency
│   └── Recording in different languages → test cross-language
│
├── Quality scoring system:
│   ├── A (85-100): "Excellent — Studio-quality clone"
│   ├── B (70-84):  "Good — Clear and usable"
│   ├── C (55-69):  "Fair — Usable but could be better"
│   ├── D (40-54):  "Poor — Try uploading clearer audio"
│   └── F (below 40): "Failed — Audio quality too low"
│   ├── Show grade to user with specific tips
│   └── Tips examples:
│       ├── "Record in a quieter environment"
│       ├── "Speak closer to the microphone"
│       ├── "Record at least 30 seconds"
│       └── "Remove background music"
│
├── Edge cases handled:
│   ├── User uploads video file → extract audio only
│   ├── User uploads stereo → convert to mono
│   ├── User uploads 44100Hz → resample to 22050Hz
│   ├── User uploads very quiet audio → normalize
│   ├── User uploads 5 minute audio → trim to 60 seconds
│   └── User uploads corrupted file → clear error message
│
└── Phase 6 COMPLETE

PHASE 6 DELIVERABLES:
├── ✅ Voice cloning pipeline working
├── ✅ Audio cleaning for clone inputs
├── ✅ Speaker embedding extraction
├── ✅ Clone API endpoints (CRUD)
├── ✅ Quality scoring with user tips
├── ✅ Preview generation for cloned voices
├── ✅ Multiple audio format support
├── ✅ Edge cases handled gracefully
├── ✅ Generate endpoint supports both library + cloned voices
└── ✅ Clone engine COMPLETE
PHASE 7: SPEECH-TO-TEXT ENGINE (WHISPER)
text

DURATION:   4-5 Days
HARDWARE:   Same laptop (VRAM management critical)
GOAL:       Add Whisper Large-v3 for transcription
DEPENDS ON: Phase 5 complete
NOTE:       CANNOT run XTTS + Whisper simultaneously on 8GB VRAM
DAY 1: Whisper Setup & Basic Testing
text

TASKS:
├── Install faster-whisper (NOT openai-whisper):
│   ├── faster-whisper uses CTranslate2
│   ├── 4x faster than original
│   ├── Less VRAM usage
│   ├── Same quality output
│   └── pip install faster-whisper
│
├── VRAM Management Strategy:
│   ├── XTTS uses ~4-6GB VRAM
│   ├── Whisper Large-v3 uses ~4-5GB VRAM
│   ├── RTX 4060 has 8GB VRAM
│   ├── CANNOT run both at same time
│   ├── Solution options:
│   │   ├── Option A: Separate processes
│   │   │   ├── TTS process (loads XTTS)
│   │   │   ├── STT process (loads Whisper)
│   │   │   ├── Only one runs at a time
│   │   │   └── Queue manages which model is active
│   │   ├── Option B: Dynamic loading
│   │   │   ├── Unload XTTS → Load Whisper
│   │   │   ├── Process STT job
│   │   │   ├── Unload Whisper → Load XTTS
│   │   │   ├── Slow switching (~30 seconds)
│   │   │   └── Not great UX but works
│   │   └── Option C: Use smaller Whisper model
│   │       ├── Whisper Medium (~2GB VRAM)
│   │       ├── Can run alongside XTTS
│   │       ├── Slightly lower quality
│   │       └── Good for development
│   └── For development: Use Option C
│       For production (24GB GPU): Run both simultaneously
│
├── Load Whisper and test:
│   ├── English audio → transcript
│   ├── Hindi audio → transcript
│   ├── Tamil audio → transcript
│   ├── Mixed language audio → transcript
│   ├── Verify auto language detection
│   └── Benchmark: speed and accuracy
│
└── Whisper running successfully

FILES CREATED:
├── voxar/engine/stt_engine.py (skeleton)
└── voxar/engine/tests/test_whisper_basic.py
DAY 2: Transcription Pipeline
text

TASKS:
├── Build VoxarSTTEngine class:
│   ├── class VoxarSTTEngine:
│   │   ├── __init__(self, model_size="large-v3"):
│   │   │   └── Load faster-whisper model
│   │   ├── transcribe(self, audio_path, language=None):
│   │   │   ├── Load audio file
│   │   │   ├── Auto detect language (if not specified)
│   │   │   ├── Run transcription
│   │   │   ├── Extract:
│   │   │   │   ├── Full text
│   │   │   │   ├── Segments with timestamps
│   │   │   │   ├── Word-level timestamps
│   │   │   │   ├── Detected language
│   │   │   │   ├── Language confidence
│   │   │   │   └── Total duration
│   │   │   └── Return TranscriptionResult object
│   │   │
│   │   ├── TranscriptionResult:
│   │   │   {
│   │   │     "text": "Full transcript text here...",
│   │   │     "language": "hi",
│   │   │     "language_confidence": 0.95,
│   │   │     "duration": 125.5,
│   │   │     "segments": [
│   │   │       {
│   │   │         "id": 0,
│   │   │         "start": 0.0,
│   │   │         "end": 3.5,
│   │   │         "text": "Namaste doston"
│   │   │       },
│   │   │       {
│   │   │         "id": 1,
│   │   │         "start": 3.5,
│   │   │         "end": 7.2,
│   │   │         "text": "Aaj hum baat karenge AI ke baare mein"
│   │   │       }
│   │   │     ],
│   │   │     "words": [
│   │   │       {"word": "Namaste", "start": 0.0, "end": 0.8},
│   │   │       {"word": "doston", "start": 0.9, "end": 1.5}
│   │   │     ]
│   │   │   }
│   │   │
│   │   └── get_model_info(self):
│   │       └── Return model details
│
├── Test with various audio files:
│   ├── Short audio (30 seconds)
│   ├── Medium audio (5 minutes)
│   ├── Long audio (30 minutes)
│   ├── Different languages
│   ├── Noisy audio
│   ├── Multiple speakers
│   └── Document accuracy for each
│
└── Core transcription working

FILES UPDATED:
├── voxar/engine/stt_engine.py (complete class)
└── voxar/engine/tests/test_stt_engine.py
DAY 3: Export Formats
text

TASKS:
├── Build export functions:
│   ├── export_txt(result):
│   │   ├── Plain text transcript
│   │   ├── Clean, readable format
│   │   ├── Paragraph breaks at long pauses
│   │   └── UTF-8 encoding
│   │
│   ├── export_srt(result):
│   │   ├── Standard SRT subtitle format:
│   │   │   1
│   │   │   00:00:00,000 --> 00:00:03,500
│   │   │   Namaste doston
│   │   │
│   │   │   2
│   │   │   00:00:03,500 --> 00:00:07,200
│   │   │   Aaj hum baat karenge AI ke baare mein
│   │   ├── Proper timestamp formatting
│   │   └── Ready for YouTube/video editors
│   │
│   ├── export_vtt(result):
│   │   ├── WebVTT format (web-friendly subtitles)
│   │   ├── WEBVTT header
│   │   └── Similar to SRT but different format
│   │
│   ├── export_json(result):
│   │   ├── Full structured JSON
│   │   ├── Includes segments + words + metadata
│   │   └── Machine-readable
│   │
│   └── export_csv(result):
│       ├── Word-level CSV:
│       │   word, start_time, end_time
│       │   Namaste, 0.00, 0.80
│       │   doston, 0.90, 1.50
│       └── Useful for analysis/editing
│
├── Test all export formats:
│   ├── Generate transcript
│   ├── Export in all 5 formats
│   ├── Verify format correctness
│   ├── Verify timestamp accuracy
│   └── Verify special characters (Hindi, Tamil etc.)
│
└── All export formats working

FILES CREATED:
├── voxar/engine/stt_exporter.py
└── voxar/engine/tests/test_stt_exports.py
DAY 4: STT API Endpoints
text

TASKS:
├── Build STT API endpoints:
│   ├── POST /api/v1/transcribe
│   │   ├── Multipart file upload
│   │   ├── Fields:
│   │   │   ├── file: audio/video file (required)
│   │   │   ├── language: language hint (optional, auto-detect)
│   │   │   └── output_format: txt/srt/vtt/json/csv (default: json)
│   │   ├── Validate:
│   │   │   ├── File type (audio/video formats)
│   │   │   ├── File size (< 100MB)
│   │   │   └── Duration check
│   │   ├── Add to STT queue (separate from TTS queue)
│   │   └── Return: job_id
│   │
│   ├── GET /api/v1/transcriptions/{job_id}
│   │   ├── Return transcription status
│   │   ├── If completed:
│   │   │   ├── Full transcript
│   │   │   ├── Download links for all formats
│   │   │   └── Metadata (duration, language, word count)
│   │   └── If processing: estimated time remaining
│   │
│   └── GET /api/v1/transcriptions/{job_id}/download/{format}
│       ├── Download transcript in specific format
│       ├── Content-Type appropriate for format
│       └── Content-Disposition for file download
│
├── Duration calculation for credits:
│   ├── Calculate audio duration in minutes
│   ├── Round up to nearest minute
│   ├── Return to backend for credit deduction
│   └── Example: 2.5 minutes → charge for 3 minutes
│
├── Separate STT queue:
│   ├── STT jobs queued separately from TTS
│   ├── On dev laptop: TTS and STT cannot run simultaneously
│   ├── Priority: TTS jobs have priority over STT
│   └── On production (24GB GPU): can run in parallel
│
├── Test all endpoints
└── STT API working

FILES CREATED:
├── voxar/api/routes/stt.py
└── voxar/api/tests/test_stt_endpoints.py
DAY 5: Edge Cases & Optimization
text

TASKS:
├── Test edge cases:
│   ├── Very short audio (5 seconds)
│   ├── Very long audio (1 hour) → chunk processing
│   ├── Poor quality audio
│   ├── Music-heavy audio (song with lyrics)
│   ├── Multiple speakers
│   ├── Heavy accent
│   ├── Whispered speech
│   ├── Background noise
│   └── Document quality for each
│
├── Optimization:
│   ├── Use faster-whisper with int8 quantization:
│   │   ├── Half the VRAM usage
│   │   ├── Slightly lower quality
│   │   └── Much faster processing
│   ├── For very long audio:
│   │   ├── Process in 5-minute chunks
│   │   ├── Merge transcripts
│   │   ├── Show progress updates
│   │   └── Prevent memory issues
│   └── Cache model (don't reload for every request)
│
└── Phase 7 COMPLETE

PHASE 7 DELIVERABLES:
├── ✅ Faster-Whisper running on RTX 4060
├── ✅ Auto language detection (all Indian languages)
├── ✅ Word-level timestamps
├── ✅ Export: TXT, SRT, VTT, JSON, CSV
├── ✅ API endpoints for transcription
├── ✅ Separate STT queue
├── ✅ VRAM management (XTTS/Whisper switching)
├── ✅ Long audio chunking
├── ✅ Duration-based credit calculation
└── ✅ Edge cases handled
PHASE 8: NEXT.JS FRONTEND & DASHBOARD
text

DURATION:   10-14 Days
HARDWARE:   Same laptop (no GPU needed for frontend)
GOAL:       Build premium, Apple-quality dashboard
DEPENDS ON: Phase 5 (API ready to integrate with)
WEEK 1: Foundation & Core Pages
text

DAY 1: PROJECT SETUP
├── Create Next.js 14 project (App Router)
│   └── npx create-next-app@latest voxar-frontend
├── Install dependencies:
│   ├── Tailwind CSS (styling)
│   ├── Framer Motion (animations)
│   ├── Lucide React (icons)
│   ├── Axios (API calls)
│   ├── React Hot Toast (notifications)
│   ├── Zustand (state management)
│   ├── React Query / TanStack Query (data fetching)
│   └── next-themes (dark mode)
├── Configure Tailwind:
│   ├── Custom colors (VOXAR brand palette):
│   │   ├── Primary: Deep purple or electric blue
│   │   ├── Accent: Vibrant gradient
│   │   ├── Background: Near-black (#0a0a0a)
│   │   ├── Surface: Dark gray (#141414)
│   │   ├── Border: Subtle gray (#2a2a2a)
│   │   └── Text: White + Gray-400
│   ├── Custom fonts:
│   │   ├── Heading: Cabinet Grotesk or Satoshi
│   │   └── Body: Inter
│   └── Custom spacing and border-radius
├── Create global styles (globals.css)
├── Build base layout:
│   ├── Root layout with font + theme
│   ├── Metadata (title, description, OG tags)
│   └── Smooth page transitions setup
├── Set up folder structure
└── Verify: npm run dev works

DAY 2: LANDING PAGE
├── Hero Section:
│   ├── Large bold headline:
│   │   └── "Your Voice. Perfected by AI."
│   ├── Subtitle:
│   │   └── "Studio-grade text-to-speech, voice cloning,
│   │        and transcription in 10+ Indian languages"
│   ├── Two CTA buttons:
│   │   ├── "Try Free" (primary, glowing)
│   │   └── "Watch Demo" (secondary, outline)
│   ├── Live audio demo:
│   │   ├── Mini audio player
│   │   ├── Play a sample voice
│   │   ├── Voice name displayed
│   │   └── Switch between sample voices
│   ├── Entrance animation (fade up + scale)
│   └── Background: subtle gradient or grid pattern
│
├── Features Section:
│   ├── Feature cards (3-4 cards):
│   │   ├── 🎙️ Text-to-Speech
│   │   │   └── "25 premium voices. 10+ languages. 4 modes."
│   │   ├── 🧬 Voice Cloning
│   │   │   └── "Clone any voice in 30 seconds."
│   │   ├── 📝 Transcription
│   │   │   └── "Speech-to-text with word-level timestamps."
│   │   └── ⚡ Pro Studio
│   │       └── "Director mode. Per-segment control. Premium exports."
│   ├── Hover animation on each card
│   └── Icon + title + description
│
├── Voice Showcase Section:
│   ├── 4-6 sample voices displayed
│   ├── Play button for each
│   ├── Voice name + language badge
│   ├── Language tab switcher (English / Hindi / Tamil)
│   └── "Explore All Voices →" link
│
├── Social Proof Section (later — placeholder):
│   ├── "Trusted by X creators"
│   ├── Testimonial cards (placeholder)
│   └── Logo strip (placeholder)
│
├── Pricing Section (preview):
│   ├── Plan cards (3 visible):
│   │   ├── Starter ₹499
│   │   ├── Creator ₹999
│   │   └── Pro ₹1,999
│   ├── Feature comparison
│   ├── "Start Free" for free tier
│   └── "Coming Soon" for Ultra
│
├── Footer:
│   ├── VOXAR logo
│   ├── Links: Features, Pricing, Blog, API (soon)
│   ├── Social links (Twitter, YouTube, LinkedIn)
│   ├── Legal: Terms, Privacy, Refund Policy
│   └── "Made in India 🇮🇳" (subtle)
│
├── Fully responsive (mobile + tablet + desktop)
└── Premium feel: dark, clean, no clutter

DAY 3: AUTHENTICATION PAGES
├── Sign Up page (/signup):
│   ├── Clean form:
│   │   ├── Full name
│   │   ├── Email
│   │   ├── Password
│   │   ├── Confirm password
│   │   └── "Create Account" button
│   ├── Password requirements shown
│   ├── Validation messages (inline)
│   ├── "Already have account? Login" link
│   ├── Google OAuth button (placeholder, implement later)
│   └── Terms checkbox
│
├── Login page (/login):
│   ├── Email + Password
│   ├── "Remember me" checkbox
│   ├── "Forgot password?" link (placeholder)
│   ├── "Login" button
│   ├── "Don't have account? Sign Up" link
│   └── Google OAuth button (placeholder)
│
├── Auth logic:
│   ├── Use Zustand for auth state
│   ├── JWT token storage:
│   │   ├── Store in httpOnly cookie (most secure)
│   │   └── OR localStorage (simpler for now)
│   ├── Auth context provider
│   ├── Protected route wrapper:
│   │   ├── Check if user is logged in
│   │   ├── If not: redirect to /login
│   │   └── If yes: show dashboard
│   ├── Auto-attach JWT to API requests
│   └── Handle token expiry
│
├── Password reset (placeholder page):
│   └── "Coming soon — contact support"
│
└── Auth flow working end-to-end

DAY 4-5: DASHBOARD LAYOUT
├── Dashboard layout (/dashboard/layout.tsx):
│   ├── Sidebar (left, collapsible):
│   │   ├── VOXAR logo (top)
│   │   ├── Navigation items:
│   │   │   ├── 🏠 Dashboard (home/overview)
│   │   │   ├── 🎙️ Studio (TTS generation)
│   │   │   ├── 📚 Voice Library
│   │   │   ├── 🧬 Clone Voice
│   │   │   ├── 📝 Transcribe
│   │   │   ├── 📁 History
│   │   │   ├── ⚙️ Settings
│   │   │   └── 💳 Billing & Plans
│   │   ├── Active page highlighted
│   │   ├── Collapse button (icon-only mode)
│   │   └── Plan badge at bottom: "Free Plan"
│   │
│   ├── Top bar:
│   │   ├── Page title (dynamic)
│   │   ├── Credits badge:
│   │   │   ├── "⚡ 450 credits"
│   │   │   ├── Click → go to billing
│   │   │   └── Color changes when low (green→yellow→red)
│   │   ├── Notification bell (placeholder)
│   │   └── User avatar + dropdown:
│   │       ├── Profile
│   │       ├── Settings
│   │       └── Logout
│   │
│   └── Main content area:
│       ├── Smooth page transitions
│       └── Loading skeletons during navigation
│
├── Dashboard Home (/dashboard):
│   ├── Welcome message: "Welcome back, [Name]"
│   ├── Quick stats cards:
│   │   ├── Credits Remaining
│   │   ├── Generations This Month
│   │   ├── Voices Used
│   │   └── Clone Slots (used/total)
│   ├── Quick action buttons:
│   │   ├── "Generate Voice" → /dashboard/studio
│   │   ├── "Clone Voice" → /dashboard/clone
│   │   └── "Transcribe Audio" → /dashboard/transcribe
│   ├── Recent generations list (last 5)
│   │   ├── Title, voice, date, play button
│   │   └── "View All →" link
│   └── Announcement banner (optional)
│
├── Mobile responsive:
│   ├── Sidebar → bottom navigation bar
│   ├── OR hamburger menu
│   └── Touch-friendly buttons
│
└── Dashboard layout polished and premium

DAY 6-7: TTS STUDIO PAGE (MOST IMPORTANT PAGE)
├── This is the CORE of your product
├── Route: /dashboard/studio
│
├── Layout (3-column on desktop):
│   │
│   ├── LEFT PANEL: Voice Selection
│   │   ├── Tab switcher: "Library" | "My Clones"
│   │   ├── Search bar: search voices by name
│   │   ├── Filter chips:
│   │   │   ├── Language: All, English, Hindi, Tamil...
│   │   │   ├── Gender: All, Male, Female
│   │   │   └── Style: All, Narration, Ad, Calm, Energetic
│   │   ├── Voice cards (scrollable list):
│   │   │   ┌─────────────────────────────┐
│   │   │   │  🎙️ Arjun                   │
│   │   │   │  Male • EN, HI • Narration  │
│   │   │   │                             │
│   │   │   │  ▶️ Preview    ✅ Selected   │
│   │   │   └─────────────────────────────┘
│   │   │   ├── Click preview: instant playback
│   │   │   ├── Click card: select voice
│   │   │   ├── Selected voice highlighted
│   │   │   ├── Premium badge on locked voices
│   │   │   └── Scroll to see all 25 voices
│   │   └── "My Clones" tab:
│   │       ├── Shows user's cloned voices
│   │       ├── Same card format
│   │       └── "Clone New Voice +" button
│   │
│   ├── CENTER PANEL: Script Editor
│   │   ├── BASIC EDITOR (all users):
│   │   │   ├── Large textarea
│   │   │   ├── Placeholder: "Type or paste your script here..."
│   │   │   ├── Min height: 200px
│   │   │   ├── Auto-resize as user types
│   │   │   └── Toolbar:
│   │   │       ├── Clear button
│   │   │       ├── Paste from clipboard
│   │   │       ├── Import from file (.txt)
│   │   │       ├── Character count: "245 / 5,000"
│   │   │       └── Credit cost: "⚡ 245 credits"
│   │   │
│   │   ├── PRO EDITOR (Creator+ plans — locked for free):
│   │   │   ├── 🔒 "Upgrade to Creator to unlock Pro Editor"
│   │   │   ├── When unlocked:
│   │   │   │   ├── Script split into segments (by paragraph)
│   │   │   │   ├── Per-segment voice selector
│   │   │   │   ├── Per-segment mode selector
│   │   │   │   ├── Custom pause insertion [pause:1s]
│   │   │   │   ├── Pronunciation override per word
│   │   │   │   ├── Speed slider per segment
│   │   │   │   └── Preview individual segments
│   │   │   └── This is MAJOR upgrade incentive
│   │   │
│   │   └── Language detection badge:
│   │       └── Auto-detects: "🌐 Detected: Hindi"
│   │
│   └── RIGHT PANEL: Settings & Output
│       ├── Mode Selector:
│       │   ├── 4 mode cards:
│       │   │   ├── ⚡ Flash (1x credits)
│       │   │   ├── 🎬 Cinematic (1.2x credits)
│       │   │   ├── 📖 Longform (1x credits)
│       │   │   └── 🌐 Multilingual Pro (1.3x credits)
│       │   ├── Selected mode highlighted
│       │   └── Credit multiplier shown
│       │
│       ├── Output format:
│       │   ├── MP3 (default, all users)
│       │   └── WAV (Creator+ only, premium badge)
│       │
│       ├── Speed slider (optional):
│       │   ├── 0.5x to 2.0x
│       │   └── Default: 1.0x
│       │
│       ├── GENERATE BUTTON:
│       │   ├── Large, prominent, glowing
│       │   ├── "🎙️ Generate Voice"
│       │   ├── Shows credit cost on button
│       │   ├── Disabled if:
│       │   │   ├── No voice selected
│       │   │   ├── No text entered
│       │   │   └── Insufficient credits
│       │   └── Loading state during generation
│       │
│       ├── Progress indicator:
│       │   ├── Shows during generation
│       │   ├── "Preprocessing text..."
│       │   ├── "Generating voice..."
│       │   ├── "Mastering audio..."
│       │   ├── "Almost done..."
│       │   └── Smooth progress bar
│       │
│       └── Output section (after generation):
│           ├── Audio player:
│           │   ├── Play/Pause button
│           │   ├── Waveform visualization
│           │   ├── Time display
│           │   ├── Volume control
│           │   └── Premium feel
│           ├── Download buttons:
│           │   ├── "📥 Download MP3" (always)
│           │   └── "📥 Download WAV" (paid only)
│           ├── Action buttons:
│           │   ├── "🔄 Regenerate" (new generation)
│           │   ├── "📋 Copy settings" (copy config)
│           │   └── "💾 Save to history"
│           └── Quality badge: "Quality: 92/100 ⭐"
│
└── This page must feel smooth, fast, and premium
WEEK 2: Additional Pages
text

DAY 8: VOICE LIBRARY PAGE
├── Route: /dashboard/voices
├── Grid / List view toggle
├── Voice cards (larger than in Studio):
│   ├── Voice avatar/icon (gradient circle with initial)
│   ├── Name + "The Narrator" subtitle
│   ├── Language badges
│   ├── Style tags
│   ├── Quality score bar
│   ├── Preview play button (large)
│   ├── "Use This Voice" button → redirects to Studio
│   └── Premium lock badge
├── Filters sidebar:
│   ├── Language checkboxes
│   ├── Gender radio buttons
│   ├── Style checkboxes
│   └── Sort: Popular, New, Quality, Name
├── Search bar at top
└── Responsive grid (4 col → 2 col → 1 col)

DAY 9: VOICE CLONING PAGE
├── Route: /dashboard/clone
├── Clone limit display: "Clone Slots: 1/3 used"
│
├── Upload Section:
│   ├── Large drag & drop zone
│   │   ├── "Drag audio file here or click to upload"
│   │   ├── Supported formats listed
│   │   ├── Max file size: 20MB
│   │   └── Visual feedback on drag hover
│   ├── OR "Record Voice" button:
│   │   ├── Opens browser microphone
│   │   ├── Recording timer
│   │   ├── Waveform during recording
│   │   ├── Stop button
│   │   └── "Minimum 10 seconds"
│   └── Audio preview after upload:
│       ├── Play uploaded audio
│       ├── Duration display
│       └── "Change File" option
│
├── Clone Name Input:
│   └── "Give your voice a name" text field
│
├── Consent Section:
│   ├── ☐ "I confirm this is my voice or I have explicit
│   │      permission from the voice owner to create this clone"
│   ├── Must be checked to proceed
│   └── Link to Terms of Service
│
├── "🧬 Clone Voice" button:
│   ├── Disabled until file + name + consent
│   └── Shows processing state
│
├── Processing States:
│   ├── "Uploading..." (progress bar)
│   ├── "Cleaning audio..." 
│   ├── "Analyzing voice..."
│   ├── "Creating clone..."
│   └── "Done!"
│
├── Result Screen:
│   ├── Quality grade: "A — Excellent" (with color)
│   ├── Preview player (hear your clone)
│   ├── Tips if quality < 70:
│   │   ├── "Record in a quieter room"
│   │   ├── "Speak closer to microphone"
│   │   └── "Try a longer recording"
│   ├── "Use in Studio" button
│   └── "Try Again" button
│
├── My Clones List:
│   ├── Clone cards:
│   │   ├── Name
│   │   ├── Created date
│   │   ├── Quality grade
│   │   ├── Play preview
│   │   ├── Use in Studio
│   │   └── Delete button (with confirmation)
│   └── Empty state: "No clones yet. Create your first!"
│
└── Page complete and polished

DAY 10: TRANSCRIPTION PAGE
├── Route: /dashboard/transcribe
│
├── Upload Section:
│   ├── Drag & drop zone
│   ├── "Upload audio or video file"
│   ├── Supported: MP3, WAV, M4A, MP4, MOV, WebM
│   ├── Max size: 100MB
│   └── Duration estimate after upload
│
├── Settings:
│   ├── Language: Auto-detect / Manual select
│   └── Credit cost estimate: "⚡ ~300 credits (3 min)"
│
├── "📝 Transcribe" button
│
├── Processing:
│   ├── Progress bar with percentage
│   ├── "Transcribing... (estimated 2 min remaining)"
│   └── Cancel button
│
├── Results:
│   ├── Full transcript in editable text area
│   ├── Timestamp view toggle:
│   │   ├── Off: plain text
│   │   └── On: text with timestamps
│   ├── Segment list:
│   │   ├── Each segment with start/end time
│   │   ├── Click segment → highlight in text
│   │   └── Click segment → play that portion
│   ├── Language detected badge
│   ├── Duration + word count stats
│   └── Download buttons:
│       ├── 📄 TXT
│       ├── 📺 SRT (for subtitles)
│       ├── 🌐 VTT (for web)
│       ├── 📊 JSON (structured)
│       └── 📋 CSV (word timestamps)
│
└── Page complete

DAY 11: HISTORY & SETTINGS PAGES
├── History page (/dashboard/history):
│   ├── Tab switcher: "TTS" | "STT" | "All"
│   ├── Generation list:
│   │   ├── Each entry shows:
│   │   │   ├── Type icon (🎙️ or 📝)
│   │   │   ├── Text preview (first 100 chars)
│   │   │   ├── Voice used
│   │   │   ├── Mode used
│   │   │   ├── Date/time
│   │   │   ├── Credits used
│   │   │   ├── Play button
│   │   │   ├── Download button
│   │   │   └── Delete button
│   │   └── Paginated (20 per page)
│   ├── Search history
│   ├── Date range filter
│   └── "Clear All History" button (with confirmation)
│
├── Settings page (/dashboard/settings):
│   ├── Profile section:
│   │   ├── Name (editable)
│   │   ├── Email (read-only)
│   │   ├── Avatar (placeholder)
│   │   └── Save button
│   ├── Password section:
│   │   ├── Current password
│   │   ├── New password
│   │   ├── Confirm new password
│   │   └── Update button
│   ├── Preferences:
│   │   ├── Default voice
│   │   ├── Default mode
│   │   ├── Default output format
│   │   └── Default language
│   ├── Notifications:
│   │   ├── Email on low credits
│   │   ├── Email on new features
│   │   └── Toggle switches
│   └── Danger Zone:
│       ├── Delete all data
│       └── Delete account (with confirmation)
│
└── Both pages complete

DAY 12-14: POLISH & RESPONSIVE
├── Animation polish:
│   ├── Page transitions (Framer Motion):
│   │   ├── Fade + slide for page changes
│   │   ├── Scale for modals
│   │   └── Smooth sidebar toggle
│   ├── Button interactions:
│   │   ├── Hover: scale(1.02) + glow
│   │   ├── Click: scale(0.98)
│   │   └── Loading: spinner or pulse
│   ├── Loading states:
│   │   ├── Skeleton loaders for lists
│   │   ├── Spinner for buttons
│   │   └── Progress bars for generation
│   ├── Toast notifications:
│   │   ├── Success: "Audio generated successfully!"
│   │   ├── Error: "Generation failed. Credits refunded."
│   │   ├── Warning: "Low credits — upgrade plan"
│   │   └── Info: "New feature available!"
│   └── Micro-interactions:
│       ├── Voice card hover lift
│       ├── Toggle switches animation
│       └── Credit counter animation
│
├── Responsive design:
│   ├── Desktop (>1280px): Full 3-column layout
│   ├── Tablet (768-1280px): 2-column, collapsible sidebar
│   ├── Mobile (<768px):
│   │   ├── Bottom navigation bar
│   │   ├── Studio: single column, stacked panels
│   │   ├── Voice cards: single column
│   │   └── Full-width buttons
│   └── Test on actual devices
│
├── Performance:
│   ├── Lazy loading for voice previews
│   ├── Image optimization (Next.js Image)
│   ├── Code splitting (automatic with App Router)
│   ├── Lighthouse score target: > 90
│   └── First Contentful Paint: < 1.5s
│
├── Accessibility:
│   ├── Keyboard navigation (Tab, Enter, Escape)
│   ├── Screen reader labels (aria-labels)
│   ├── Focus indicators
│   ├── Color contrast compliance
│   └── Alt text for images
│
├── Cross-browser testing:
│   ├── Chrome
│   ├── Firefox
│   ├── Safari
│   └── Edge
│
└── Phase 8 COMPLETE

PHASE 8 DELIVERABLES:
├── ✅ Landing page (premium, dark, responsive)
├── ✅ Authentication (signup/login/JWT)
├── ✅ Dashboard layout (sidebar + topbar)
├── ✅ Dashboard home (stats + quick actions)
├── ✅ TTS Studio page (voice select + editor + generate + player)
├── ✅ Pro Editor (locked for free users)
├── ✅ Voice Library page (grid, filters, previews)
├── ✅ Voice Cloning page (upload + record + consent + results)
├── ✅ Transcription page (upload + process + export)
├── ✅ History page (list + filter + download)
├── ✅ Settings page (profile + password + preferences)
├── ✅ Smooth animations (Framer Motion)
├── ✅ Responsive (mobile + tablet + desktop)
├── ✅ API integration with FastAPI engine
├── ✅ Premium Apple-like feel
└── ✅ Lighthouse score > 90
PHASE 9: NODE.JS BACKEND & CREDIT SYSTEM
text

DURATION:   7-8 Days
HARDWARE:   Same laptop
GOAL:       Build business logic layer — auth, credits, plans, proxy
DEPENDS ON: Phase 8 (frontend to connect with)
DAY 1: Backend Foundation
text

TASKS:
├── Initialize Node.js project
├── Install dependencies:
│   ├── express (server)
│   ├── prisma (ORM)
│   ├── @prisma/client
│   ├── bcryptjs (password hashing)
│   ├── jsonwebtoken (JWT)
│   ├── cors
│   ├── helmet (security headers)
│   ├── express-rate-limit
│   ├── multer (file uploads)
│   ├── axios (call FastAPI engine)
│   ├── dotenv
│   └── morgan (request logging)
│
├── Database schema (Prisma):
│
│   model User {
│     id                  String   @id @default(uuid())
│     email               String   @unique
│     password_hash       String
│     name                String
│     plan_type           String   @default("free")
│     voice_credits       Int      @default(500)
│     stt_credits         Int      @default(0)
│     media_credits       Int      @default(0)
│     total_credits_used  Int      @default(0)
│     max_clones          Int      @default(0)
│     clones_used         Int      @default(0)
│     created_at          DateTime @default(now())
│     updated_at          DateTime @updatedAt
│     generations         Generation[]
│     transactions        Transaction[]
│     clones              UserClone[]
│   }
│
│   model Generation {
│     id                String   @id @default(uuid())
│     user_id           String
│     user              User     @relation(fields: [user_id])
│     type              String   // "tts" or "stt"
│     input_text        String?
│     input_file_url    String?
│     voice_id          String?
│     clone_id          String?
│     mode              String?
│     language          String?
│     output_url        String?
│     output_format     String?
│     characters_used   Int?
│     duration_seconds  Float?
│     credits_deducted  Int
│     quality_score     Int?
│     status            String   // completed/failed/refunded
│     created_at        DateTime @default(now())
│   }
│
│   model Transaction {
│     id                  String   @id @default(uuid())
│     user_id             String
│     user                User     @relation(fields: [user_id])
│     amount_inr          Int
│     plan_type           String
│     credits_added       Int
│     credit_type         String   // voice/stt/media
│     razorpay_order_id   String?
│     razorpay_payment_id String?
│     status              String   // pending/success/failed
│     created_at          DateTime @default(now())
│   }
│
│   model UserClone {
│     id              String   @id @default(uuid())
│     user_id         String
│     user            User     @relation(fields: [user_id])
│     name            String
│     embedding_path  String
│     preview_url     String?
│     quality_score   Int?
│     created_at      DateTime @default(now())
│   }
│
├── Run: npx prisma migrate dev
├── Seed with test user
└── Database ready

FILES CREATED:
├── voxar-backend/src/index.js
├── voxar-backend/src/app.js
├── voxar-backend/prisma/schema.prisma
├── voxar-backend/.env
└── voxar-backend/package.json
DAY 2: Authentication System
text

TASKS:
├── POST /auth/signup
├── POST /auth/login
├── GET /auth/me
├── JWT middleware
├── Password hashing with bcrypt
├── Token refresh logic
├── Input validation
└── All auth tests passing
DAY 3: Credit Middleware (MOST CRITICAL)
text

TASKS:
├── Build creditMiddleware:
│   ├── Runs before ANY generation request
│   ├── Calculates credits needed
│   ├── Checks balance
│   ├── Deducts IMMEDIATELY
│   ├── Refunds on failure
│   └── Logs every transaction
├── Credit calculation rules:
│   ├── TTS: characters × mode_multiplier
│   │   ├── Flash: 1.0x
│   │   ├── Cinematic: 1.2x
│   │   ├── Longform: 1.0x
│   │   └── Multilingual: 1.3x
│   ├── STT: minutes × 100
│   └── Media: fixed per generation
├── Separate credit pools enforced
├── Refund service for failed jobs
└── Test all credit scenarios
DAY 4-5: Generation Proxy Routes
text

TASKS:
├── POST /api/generations/tts
│   (Auth → Credits → Proxy to FastAPI → Save → Return)
├── POST /api/generations/stt
├── POST /api/clone
├── GET /api/generations/history
├── GET /api/user/credits
├── File management (upload to R2/S3)
├── Signed download URLs
└── Complete flow tested
DAY 6-7: Plan Management & Rate Limiting
text

TASKS:
├── Plan limits enforcer:
│   ├── Free:    500 credits, 0 clones, MP3 128kbps, 5 gen/hour
│   ├── Starter: 10,000 credits, 1 clone, MP3 320kbps, 20/hour
│   ├── Creator: 50,000 credits, 3 clones, MP3+WAV, 50/hour
│   ├── Pro:     200,000 credits, 10 clones, MP3+WAV, 100/hour
│   └── Ultra:   500,000 credits, unlimited, MP3+WAV, 200/hour
├── Rate limiting per plan
├── Daily caps for media credits
├── Usage statistics API
├── Watermark enforcement (free tier)
└── All limits tested

PHASE 9 DELIVERABLES:
├── ✅ Express.js backend running
├── ✅ PostgreSQL with Prisma ORM
├── ✅ JWT authentication
├── ✅ Credit system (3 pools, deduction, refund)
├── ✅ Generation proxy to FastAPI
├── ✅ File management (R2/S3)
├── ✅ Plan limits enforcement
├── ✅ Rate limiting per plan
├── ✅ Usage statistics API
└── ✅ Backend is PRODUCTION READY
PHASE 10: PAYMENT INTEGRATION (RAZORPAY)
text

DURATION:   4-5 Days
HARDWARE:   Same laptop
GOAL:       Accept payments and manage subscriptions
DEPENDS ON: Phase 9 complete
text

DAY 1: Razorpay Setup & Understanding
├── Create Razorpay account
├── Get test API keys
├── Study Razorpay flow:
│   ├── Backend creates ORDER → Frontend opens checkout → 
│   │   User pays → Webhook verifies → Credits added
│   └── NEVER trust frontend callback alone
└── Test mode configured

DAY 2: Backend Payment Routes
├── POST /api/payments/create-order
├── POST /api/payments/verify (signature verification)
├── POST /api/webhooks/razorpay (webhook handler)
├── Idempotency (prevent double credits)
└── Test with Razorpay test cards

DAY 3: Frontend Payment UI
├── Pricing page with plan cards
├── Razorpay checkout modal integration
├── Payment success/failure screens
├── Payment history page
└── Complete flow tested

DAY 4: Invoice & Email
├── PDF invoice generation
├── Payment confirmation email
├── Credits added notification
└── Test invoice delivery

DAY 5: Edge Cases & Go Live
├── Handle: double payment, timeout, refund
├── Switch to Razorpay LIVE mode
├── Test with real ₹1 payment
└── Payment system PRODUCTION READY

PHASE 10 DELIVERABLES:
├── ✅ Razorpay fully integrated
├── ✅ Order → Checkout → Verify → Credits flow
├── ✅ Webhook safety net
├── ✅ Pricing page in frontend
├── ✅ Payment history
├── ✅ Invoice generation
├── ✅ Email notifications
├── ✅ Security hardened
└── ✅ Live mode working
PHASE 11: CLOUD DEPLOYMENT & SCALING
text

DURATION:   5-7 Days
HARDWARE:   Cloud servers (Vercel, Railway, Vast.ai)
GOAL:       Deploy everything to production
DEPENDS ON: Phase 1-10 complete
text

DAY 1: Frontend → Vercel
├── Deploy Next.js to Vercel
├── Connect GitHub repo
├── Custom domain: voxar.in
├── Hostinger domain → Cloudflare DNS → Vercel
├── SSL auto-configured
└── Test: https://voxar.in works

DAY 2: Backend → Railway/VPS
├── Deploy Node.js to Railway
├── PostgreSQL database (Neon/Supabase)
├── Run migrations
├── Connect: api.voxar.in
├── Cloudflare R2 for file storage
└── Test all API routes

DAY 3: AI Engine → Vast.ai/RunPod
├── RTX 3090 or RTX 4090 (24GB VRAM)
├── Deploy FastAPI engine
├── Load XTTS + Whisper (both fit in 24GB)
├── Load voice embeddings
├── Cost optimization (auto start/stop)
└── Test full pipeline

DAY 4: Monitoring & Logging
├── UptimeRobot (uptime monitoring)
├── Sentry (error tracking)
├── Centralized logging
├── GPU utilization monitoring
├── Database backups (daily)
└── Alert system (email/Telegram)

DAY 5-6: Security & Load Testing
├── HTTPS everywhere
├── CORS properly configured
├── Rate limiting at all levels
├── Input validation hardened
├── API key for engine (not public)
├── Load test: 10-50 concurrent users
├── Identify and fix bottlenecks
└── System is PRODUCTION READY

DAY 7: Final Checks
├── End-to-end test:
│   ├── Signup → Login → Generate → Download → Pay → Upgrade
│   └── Everything works smoothly
├── Mobile test on real devices
├── Performance benchmarks documented
└── SYSTEM IS LIVE

PHASE 11 DELIVERABLES:
├── ✅ Frontend live at voxar.in
├── ✅ Backend live at api.voxar.in
├── ✅ AI Engine on cloud GPU
├── ✅ R2 storage configured
├── ✅ SSL/HTTPS everywhere
├── ✅ Monitoring and alerts
├── ✅ Database backups
├── ✅ Security hardened
├── ✅ Load tested
└── ✅ VOXAR IS LIVE 🚀
PHASE 12: MARKETING & LAUNCH
text

DURATION:   Ongoing (start 2 weeks before public launch)
GOAL:       Get first 100 users and 20 paying customers
DEPENDS ON: Phase 11 complete
text

PRE-LAUNCH (2 weeks before):
├── Waitlist page on voxar.in
├── Social media accounts (Twitter, YouTube, LinkedIn)
├── Demo videos created (using VOXAR itself)
├── Blog posts for SEO
├── Product Hunt upcoming page
├── Target: 500 waitlist signups
└── Build in public content (Twitter threads)

LAUNCH WEEK:
├── Product Hunt launch
├── Invite 50 beta testers (free Creator access for 7 days)
├── Collect feedback
├── Fix critical bugs immediately
├── Share on Reddit, IndieHackers, Hacker News
└── Personal outreach to YouTubers/podcasters

POST-LAUNCH (Ongoing):
├── SEO content (2 blog posts/week)
├── YouTube (2 videos/week)
├── Twitter/X (daily)
├── Instagram Reels / YouTube Shorts
├── Referral program ("Invite friend → 5000 credits")
├── Email marketing (welcome sequence, tips, updates)
├── Discord community
├── Partnership outreach (creators, agencies)
└── Track: DAU, signups, conversion rate, ARPU, churn

PHASE 12 DELIVERABLES:
├── ✅ 500+ waitlist signups
├── ✅ Product Hunt launched
├── ✅ 50 beta testers onboarded
├── ✅ Feedback collected and acted on
├── ✅ SEO and content strategy active
├── ✅ Social media presence established
├── ✅ Referral program live
├── ✅ First 20 paying customers
└── ✅ Growth engine running
PHASE 13: AI VOICE AGENTS (FUTURE)
text

DURATION:   TBD (post-revenue, post-stability)
GOAL:       Real-time AI voice agents for businesses
DEPENDS ON: Phase 1-12 complete + stable revenue
text

WHAT THIS INCLUDES:
├── Real-time streaming TTS (low latency)
├── LLM integration (GPT-4 / Claude / Llama)
├── Telephony integration (Exotel for India / Twilio)
├── Conversation flow builder (visual)
├── Business dashboard
├── Use cases:
│   ├── Customer support calls (Hindi/English)
│   ├── Appointment booking
│   ├── Order confirmation
│   ├── Survey and feedback
│   └── Lead qualification
├── Pricing: Per-minute billing
├── Enterprise sales model
└── THIS ALONE COULD BE A SEPARATE COMPANY

DO NOT BUILD THIS UNTIL:
├── Phase 1-12 fully stable
├── At least 100 paying customers
├── Monthly revenue covers all costs
├── Team of at least 2-3 people
└── Clear demand signals from businesses
📋 MASTER SUMMARY TABLE
text

PHASE │ NAME                        │ DAYS   │ DEPENDS ON
──────┼─────────────────────────────┼────────┼──────────
  1   │ XTTS Engine Setup           │ 5-7    │ Nothing
  2   │ Audio Post-Processing       │ 4-5    │ Phase 1 
  3   │ Text Preprocessor           │ 4-5    │ Phase 1
  4   │ Voice Library (25 voices)   │ 5-7    │ Phase 1,2
  5   │ FastAPI AI Server           │ 5-6    │ Phase 1,2,3,4
  6   │ Voice Cloning Engine        │ 4-5    │ Phase 5
  7   │ Speech-to-Text (Whisper)    │ 4-5    │ Phase 5
  8   │ Next.js Frontend            │ 10-14  │ Phase 5
  9   │ Node.js Backend + Credits   │ 7-8    │ Phase 8
  10  │ Razorpay Payments           │ 4-5    │ Phase 9
  11  │ Cloud Deployment            │ 5-7    │ All above
  12  │ Marketing & Launch          │ Ongoing│ Phase 11
  13  │ AI Voice Agents (FUTURE)    │ TBD    │ Revenue
──────┼─────────────────────────────┼────────┼──────────
      │ TOTAL                       │ 10-14  │
      │                             │ WEEKS  │
🎯 HOW TO START
text

Tell me:

"Start Phase 1"

And optionally add:
"But I want to change X to Y"
"And also add Z"

I will then give you:
├── Exact terminal commands
├── Exact files to create
├── Exact code for each file
├── What to test after each step
└── How to verify everything works

We build VOXAR together.
One phase at a time.
No shortcuts.