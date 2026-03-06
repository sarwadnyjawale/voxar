# VOXAR – SYSTEM ARCHITECTURE DOCUMENT
Version: 2.0  
Status: Engine Core Complete – Pre-SaaS Deployment  
Last Updated: [Insert Date]

============================================================
1. SYSTEM VISION
============================================================

VOXAR is a GPU-powered AI Text-to-Speech SaaS platform optimized for Indian languages.

Core Differentiators:
- Advanced preprocessing pipeline (Hindi + Hinglish aware)
- Deterministic chunk-based XTTS inference
- Studio-grade mastering
- Controlled GPU governance
- Credit-based monetization system

The system must remain:
- Deterministic
- Modular
- GPU-safe
- Monetizable
- Scalable

============================================================
2. HIGH-LEVEL ARCHITECTURE
============================================================

ENGINE CORE (Phases 1–3)

User Script
    ↓
ScriptPreprocessor
    ↓
TTSEngine (XTTS / Future: MMS)
    ↓
AudioMaster
    ↓
QualityValidator
    ↓
Exporter
    ↓
Final Audio

--------------------------------------------

SAAS LAYER (Phase 5+)

Client Request
    ↓
FastAPI API Layer
    ↓
Authentication Middleware
    ↓
Rate Limiting
    ↓
Credit Validation
    ↓
GPU Job Queue
    ↓
Engine Layer
    ↓
Storage Layer
    ↓
Response Delivery

============================================================
3. ENGINE CORE COMPONENTS
============================================================

------------------------------------------------------------
3.1 ScriptPreprocessor (Phase 3)
------------------------------------------------------------

Responsibilities:
- Language detection
- Hinglish transliteration (dictionary-based only)
- Number expansion
- Currency expansion
- Abbreviation expansion
- URL/email parsing
- Phone/date/time normalization
- Pause marker extraction
- Emphasis extraction
- Deterministic chunking

Strict Rules:
- No audio logic
- No API logic
- No billing logic
- No nondeterministic transformations

Processing Order (Locked):
1. Whitespace cleanup
2. Language detection
3. Pause extraction
4. Emphasis extraction
5. Hinglish handling
6. URL/email protection
7. Phone numbers
8. Dates/times
9. Abbreviations
10. Restore URLs
11. Currency
12. Numbers
13. Pronunciation dictionary
14. Final cleanup
15. Chunking

------------------------------------------------------------
3.2 TTSEngine (Phase 1)
------------------------------------------------------------

Responsibilities:
- Load XTTS
- Perform chunk-based inference
- Route language correctly
- Return raw audio

Hindi Rule:
When lang="hi", use basic tts_to_file call only.
No temperature or advanced sampling parameters.

Chunk Limits:
- Hindi: 250 characters
- English: 350 characters

------------------------------------------------------------
3.3 AudioMaster (Phase 2)
------------------------------------------------------------

Responsibilities:
- LUFS normalization
- Silence trimming
- 50ms crossfade chunk merging
- Clipping removal
- Dynamic range correction

50ms crossfade is mandatory.
Hard concatenation is forbidden.

------------------------------------------------------------
3.4 QualityValidator
------------------------------------------------------------

Responsibilities:
- Loudness validation
- Silence ratio check
- Clipping detection
- Return quality metrics

------------------------------------------------------------
3.5 Exporter
------------------------------------------------------------

Responsibilities:
- MP3/WAV export
- Bitrate selection
- Future plan-based restrictions

============================================================
4. MULTI-ENGINE STRATEGY (PHASE 4)
============================================================

Primary Engine:
- XTTS v2 (~2GB VRAM)
- Languages: English, Hindi, Marathi (+ all XTTS-supported)
- Supports voice cloning via speaker reference audio

Secondary Engine:
- MMS-TTS (~0.5GB per language model)
- Languages: Tamil, Telugu, Bengali, Kannada, Malayalam, Gujarati, Punjabi, Odia
- Perfect native pronunciation, no voice cloning
- Per-language models loaded on demand

Tertiary Engine:
- OpenVoice Tone Color Converter (~0.5GB)
- Transfers voice identity from reference audio onto MMS output
- Enables voice cloning for ALL regional languages
- Used only after MMS generation (post-processing step)

Regional Language Pipeline (Approach B):
  Text → MMS (native pronunciation) → OpenVoice (voice identity transfer) → AudioMaster → Output

Engine Router (engine/engine_router.py):
- Routes by language automatically
- XTTS languages: direct generate with cloning
- MMS languages: MMS → OpenVoice → mastering
- Hot-swap protocol with GPU lock

Voice Library:
- 20 curated voices (10 male, 10 female)
- Same voices available in ALL 12 languages
- XTTS languages: direct cloning (90-95% quality)
- MMS languages: MMS + OpenVoice (75-85% quality)
- Total: 240 voice-language combinations

GPU Strategy:
- Never load XTTS and MMS simultaneously on dev hardware
- Prefer hot-swapping with sequential load/unload
- Always call torch.cuda.empty_cache()
- On production 24GB GPU: MMS + OpenVoice can stay loaded together

Concurrency:
- Max 1 GPU worker initially
- Job queue required before scaling

============================================================
5. GPU & MEMORY GOVERNANCE
============================================================

Hardware:
RTX 4060 Laptop
~8.59GB VRAM

Rules:
- Prevent OOM at all cost
- Enforce job queue before concurrent inference
- Measure VRAM before loading additional models
- Limit request size
- Gracefully fail when memory insufficient

Future:
- Dedicated inference worker process
- Queue-based GPU scheduling
- Timeout protection

============================================================
6. CREDIT SYSTEM ARCHITECTURE (MONETIZATION CORE)
============================================================

VOXAR uses a credit-based subscription model.

------------------------------------------------------------
6.1 Credit Unit Definition
------------------------------------------------------------

Primary billing metric:
Characters processed AFTER preprocessing.

Reason:
- Deterministic
- Predictable
- Hard to exploit
- Simple enforcement

------------------------------------------------------------
6.2 Credit Flow
------------------------------------------------------------

Request Received
    ↓
Authenticate User
    ↓
Calculate Required Credits
    ↓
Validate Balance
    ↓
Process Engine
    ↓
Deduct Credits
    ↓
Store Usage Record
    ↓
Return Audio

Credits validated BEFORE inference.
Credits deducted AFTER successful generation.

------------------------------------------------------------
6.3 Database Model (Future SaaS)
------------------------------------------------------------

Users:
- id
- email
- hashed_password
- subscription_plan
- credit_balance
- created_at

CreditTransactions:
- id
- user_id
- type (debit/credit)
- amount
- reason
- reference_id
- timestamp

UsageLogs:
- id
- user_id
- characters_processed
- engine_used
- language
- gpu_time_ms
- timestamp

------------------------------------------------------------
6.4 Subscription Plans
------------------------------------------------------------

Free:
- Limited monthly credits
- Low queue priority
- Lower export bitrate

Pro:
- Higher credits
- Faster queue priority
- Full quality export

Enterprise:
- Custom credits
- Dedicated concurrency
- SLA-based processing

------------------------------------------------------------
6.5 Abuse Prevention
------------------------------------------------------------

- Max characters per request
- Rate limiting per minute
- Hard stop if insufficient credits
- Logging of abnormal usage patterns

Engine must never access credit logic.

============================================================
7. API LAYER (PHASE 5)
============================================================

Framework:
FastAPI

Responsibilities:
- Routing
- Authentication
- Credit enforcement
- Queue submission
- Response formatting

Engine layer must remain isolated.

API calls engine as a service module.

============================================================
8. DIRECTORY STRUCTURE (TARGET)
============================================================

engine/
    preprocessor/
    audio/
    mastering/
    engines/
        xtts_engine.py
        mms_engine.py
    utils/

api/
    app.py
    routes/
    middleware/
    auth/
    rate_limit/

queue/
    gpu_queue.py

billing/
    credit_service.py

storage/
    file_manager.py

database/
    models.py
    migrations/

============================================================
9. OBSERVABILITY & LOGGING
============================================================

Must include:
- Structured logging
- Error tracking
- GPU memory logging
- Request duration logging
- Usage metrics

Future:
- Prometheus metrics
- Alerting on OOM or failures

============================================================
10. SECURITY PRINCIPLES
============================================================

- Never expose raw engine functions publicly
- Validate all input lengths
- Sanitize file names
- Protect against infinite input loops
- Strict authentication required for generation

============================================================
11. SCALING ROADMAP
============================================================

Stage 1:
Single GPU
Single worker
Manual monitoring

Stage 2:
Queue-based concurrency
Background worker process

Stage 3:
Multi-GPU scaling
Horizontal scaling via containerization

============================================================
12. CURRENT MATURITY STATUS
============================================================

Engine Core: Stable
Audio Pipeline: Stable
Preprocessor: Advanced
Credit System: Designed (not implemented)
API Layer: Not implemented
Concurrency: Not implemented

============================================================
13. NEXT PHASE EXECUTION ORDER
============================================================

Phase 4:
- MMS integration
- Engine hot-swap controller
- Voice registry

Phase 5:
- FastAPI server
- Credit middleware
- Rate limiting
- GPU job queue

Phase 6:
- User voice cloning (upload your own voice)

Phase 10.5 (post-payments):
- Voice Marketplace — community voice uploads
- Creator royalties: ₹0.50/₹0.75/₹1.00 per generation (tiered)
- Quality gate: VoiceSampleCleaner score ≥ 80 to go public
- Consent framework for public voice usage
- Redemption: full as VOXAR credits or bank transfer (flat ₹10 fee)
- Minimum payout: ₹200

============================================================
END OF DOCUMENT
============================================================