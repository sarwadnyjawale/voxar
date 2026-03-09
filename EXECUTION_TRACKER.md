# EXECUTION TRACKER

## Completed
- [x] Phase 1: XTTS Engine Setup (Chunking, Hindi fixes, Mode profiles)
- [x] Phase 2: Audio Post-Processing (8-step mastering, 50ms crossfade, MP3/WAV export)
- [x] Phase 3: Text Preprocessor (Numbers, Currency, Dictionary-Hinglish, Pauses/Emphasis)
- [x] Pre-Phase-4 Stabilization: Forensic audit + all CRITICAL/HIGH fixes (v1.1.0)
- [x] Phase 4 Infrastructure: MMS engine, engine router, voice library tooling (v1.2.0)
- [x] Phase 4 Voice Samples: 24 collected, 23 cleaned, best 20 selected and cataloged
- [x] Phase 4 OpenVoice: Tone color converter integration for regional voice cloning (v1.3.0)

- [x] Phase 5: FastAPI AI Server & GPU Job Queue (v1.0.0)

- [x] Phase 6: User Voice Cloning Engine (v1.1.0)

- [x] Phase 7: Speech-to-Text (Whisper + Diarization + Subtitles) (v1.2.0)

- [x] Phase 8: Next.js Frontend Dashboard (v1.0.0)

- [x] Phase 9: Node.js Backend & Credit System (v1.0.0)

- [x] Phase 10: Razorpay Payments (v1.1.0)

## In Progress
- [ ] Phase 4: Generate voice previews for all 20 voices (requires GPU)

## Pending
- [x] Phase 10.5: Voice Marketplace (community voice uploads, creator royalties) (v1.2.0)
- [x] Phase 11: Cloud Deployment (Docker, Vercel, Railway, RunPod)
- [ ] Phase 12: Marketing & Launch

## Session Log
### Session 1 (Foundations & Pre-processing)
- Validated XTTS capabilities and VRAM limits.
- Created `VoxarAudioMaster` to fix audio clipping and joint artifacts.
- Created `ScriptPreprocessor` for industry-leading Hinglish and punctuation-pause mapping.
- Validated tests up to `p3d5`.

### Session 2 (Pre-Phase-4 Stabilization — v1.1.0)
Full forensic audit of Phases 1-3. Identified 4 CRITICAL + 6 HIGH issues. All fixed:

**CRITICAL fixes:**
- C1: Crossfade 30ms → 50ms in `tts_engine.py`
- C2: Removed 7 dangerous bare-word abbreviations (am, pm, min, max, avg, info, tech) — dotted forms preserved
- C3: Created `engine/pipeline.py` orchestrator (also resolves H4 double-chunking)
- C4: Vectorized `apply_compression()` and `remove_artifacts()` in `audio_processor.py` — 30s audio: ~5000ms → 38ms

**HIGH fixes:**
- H1: Removed ITRANS fallback from `hinglish_handler.py` (produced garbage)
- H2: Added `unload_model()`, `reload_model()`, `is_model_loaded` to `tts_engine.py`
- H3: Request-scoped UUID temp directories for chunk files
- H4: Resolved via C3 pipeline — preprocessor owns chunking, engine receives pre-chunked text
- H5: Documented thread-safety of `_protect_special_patterns()` (false positive)
- H6: Added `threading.Lock()` GPU concurrency guard in `tts_engine.py`

**Bonus fix:** Time handler AM/PM spacing bug in `special_text_handler.py` — prevents "PM" → "Prime Minister" collision with Indian abbreviations.

**Verification:** 43/43 checks passed (`verify_all_fixes.py`)
**Engine version:** 1.0.0 → 1.1.0

### Session 3 (Phase 4 — MMS Engine + Voice Library Tooling — v1.2.0)
Built all Phase 4 infrastructure. Two tracks:

**Track A — MMS-TTS Engine (complete):**
- Created `engine/mms_engine.py` — wraps Facebook MMS-TTS via HuggingFace `transformers` (VitsModel)
- 10 Indian languages: Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi, Odia
- Lazy model loading, per-language model swap, 16kHz→24kHz resampling
- Created `engine/engine_router.py` — hot-swap controller between XTTS and MMS
- Hot-swap protocol: unload XTTS → load MMS → generate → unload MMS → reload XTTS
- Thread-safe GPU lock for model swaps
- Updated `engine/tts_engine.py` — removed English tokenizer workaround, clean MMS error for unsupported langs

**Track B — Voice Library Tooling (complete):**
- Created `engine/voice_cleaner.py` — automated sample cleaning (noise reduce, normalize, trim, quality check)
- Created `engine/voice_manager.py` — voice catalog CRUD, embedding extraction, preview generation
- Created `voices/voices_catalog.json` (empty template)
- Created `voices/preview_scripts.json` (English, Hindi, Tamil, Telugu, Bengali, Marathi)
- Created directory structure: `voices/{raw_samples,cleaned_samples,embeddings,previews}`

**Remaining user action:** Collect 25-28 raw voice samples (select best 20) from LibriTTS, IndicTTS, Common Voice. Target: 8 EN (4M/4F), 8 HI (4M/4F), 4 MR (2M/2F). Use `VoiceSampleCleaner.batch_clean()` → `VoiceManager.extract_embedding()` → `VoiceManager.generate_preview()` workflow.

**Verification:** 107/107 checks passed (`verify_phase4.py`)
**Engine version:** 1.1.0 → 1.2.0

**Architectural Decision — Approach B (Regional Voice Cloning):**
For regional Indian languages (Tamil, Telugu, Bengali, Kannada, Malayalam, Gujarati, Punjabi, Odia), VOXAR will use a two-stage pipeline:
1. **MMS-TTS** generates audio with perfect native pronunciation
2. **OpenVoice** (Tone Color Converter) transfers the selected library voice's identity onto the MMS audio

This means the same 20 library voices (10M, 10F) work across ALL 12 languages:
- EN/HI/MR: XTTS direct cloning (90-95% quality)
- Regional: MMS + OpenVoice conversion (75-85% quality, perfect pronunciation)
- Total: 20 voices × 12 languages = 240 voice-language combinations

Why not Approach A (phonetic script conversion → XTTS):
- Dravidian languages (Tamil, Kannada, Telugu, Malayalam) have sounds that don't exist in Hindi/Devanagari
- Output would sound like "Hindi accent reading transliterated words" — unacceptable for native speakers
- Approach B keeps pronunciation perfect and only changes voice identity

OpenVoice integration: Phase 4 (current), built after voice samples are collected.
VRAM: MMS (~0.5GB) + OpenVoice (~0.5GB) = ~1GB peak, well within 8.59GB RTX 4060 limits.

### Session 4 (Phase 4 Completion — OpenVoice Integration — v1.3.0)
Completed the Approach B pipeline for regional Indian language voice cloning.

**OpenVoice Engine (complete):**
- Created `engine/openvoice_engine.py` — wraps MyShell AI's OpenVoice V2 ToneColorConverter
- Lazy model loading, auto-downloads checkpoint from HuggingFace (`myshell-ai/OpenVoiceV2`)
- Speaker embedding (SE) extraction with dual caching: in-memory dict + on-disk `.pt` files
- `preload_voice_library()` bulk-extracts SEs for all 20 voice embeddings at startup
- Watermark disabled (`enable_watermark=False`) to avoid `wavmark` dependency
- Clean load/unload with `torch.cuda.empty_cache()` + `torch.cuda.synchronize()`

**Engine Router Update (v1.1):**
- Updated `engine/engine_router.py` with full Approach B pipeline in `_generate_mms()`
- Hot-swap protocol: XTTS unload -> MMS generate -> MMS unload -> OpenVoice convert -> OpenVoice unload -> XTTS reload
- `speaker_wav` now passed through to MMS route for OpenVoice voice conversion
- `_extract_voice_id()` static method derives voice_id from embedding filename for SE caching
- Graceful fallback: if OpenVoice fails, returns raw MMS output with warning
- MMS temp file cleanup after OpenVoice conversion
- Lazy OpenVoice engine creation on first regional language request

**Verification:** 65/65 OpenVoice checks passed (`verify_openvoice.py`)
**Regression:** 107/107 Phase 4 checks passed, 43/43 Phase 1-3 checks passed
**Engine version:** 1.2.0 -> 1.3.0

**Dependencies to install before first use:**
```
pip install openvoice  # or: pip install git+https://github.com/myshell-ai/OpenVoice.git
pip install librosa soundfile
```

### Session 5 (Phase 5 -- FastAPI AI Server & GPU Job Queue -- v1.0.0)
Built the complete API server layer wrapping the engine as a service.

**15 new files created in `api/` and project root:**

**Server Core:**
- `api/config.py` -- Settings class with env var overrides (HOST, PORT, API_KEYS, rate limits, queue size, etc.)
- `api/app.py` -- FastAPI factory with lifespan management (startup: load XTTS, create router/queue/rate limiter; shutdown: drain queue, unload models)
- `run_server.py` -- Entry point (`python run_server.py`) using uvicorn

**GPU Job Queue:**
- `api/gpu_queue.py` -- Single-worker async queue using `asyncio.Queue` + `asyncio.to_thread()` for blocking GPU work. Jobs: queued -> processing -> completed/failed. Auto-TTL cleanup of expired results.

**Middleware:**
- `api/middleware/api_key.py` -- X-API-Key header/query param validation, public paths skip auth
- `api/middleware/rate_limit.py` -- Token bucket rate limiter per API key

**Dependencies:**
- `api/dependencies.py` -- FastAPI `Depends()` helpers (get_engine, get_queue, check_rate_limit, etc.)

**API Routes (7 endpoints):**
- `GET /api/v1/health` -- public status, GPU info, queue depth, uptime
- `GET /api/v1/voices` -- list/filter voice catalog (language, gender, style)
- `GET /api/v1/voices/{voice_id}` -- single voice details
- `POST /api/v1/generate` -- async TTS job submission, returns job_id
- `POST /api/v1/generate/sync` -- synchronous TTS (blocks until done, max 1000 chars)
- `GET /api/v1/jobs/{job_id}` -- poll job status
- `GET /api/v1/jobs/{job_id}/audio` -- download generated audio (FileResponse)

**Architecture compliance:**
- Engine separation: `api/` never calls `tts_to_file` directly -- delegates via `VoxarPipeline`
- No billing/credit logic (Phase 9)
- GPU queue runs pipeline in thread pool to keep event loop responsive

**Verification:** 195/195 Phase 5 checks passed (`verify_phase5.py`)
**Regression:** 107/107 Phase 4, 65/65 OpenVoice, 43/43 Phase 1-3 -- all clean

**Dependencies installed:**
```
pip install fastapi uvicorn[standard] python-multipart
```

### Session 6 (Phase 6 -- User Voice Cloning Engine -- v1.1.0)
Built the complete user voice cloning system: upload, clean, analyze, store, and use custom voices.

**3 new files created:**

**Engine Layer:**
- `engine/user_voice_manager.py` -- UserVoiceManager class managing the full voice clone lifecycle
  - register_voice(): upload -> pre-validate -> clean (VoiceSampleCleaner) -> deep quality analysis -> store
  - Deep quality analysis: SNR estimation, speech ratio, clipping detection, dynamic range, volume consistency
  - ElevenLabs-grade quality feedback: score (0-10), grade (A+ to F), actionable improvement tips
  - Per-user storage: voices/user_voices/{api_key_hash}/{voice_id}/ with raw_upload.wav + cleaned.wav + metadata.json
  - Voice ID format: uv_{key_hash_6}_{uuid_8} (e.g., "uv_a3f82b_d9e1c047")
  - Ownership verification: API key hash scoping prevents cross-user access
  - CRUD: get_voice, get_user_voices, delete_voice, get_voice_count, resolve_embedding_path

**API Layer:**
- `api/routes/user_voices.py` -- 4 endpoints for voice clone management
  - POST /api/v1/voices/clone -- multipart upload (audio file + name + language), full validation pipeline
  - GET /api/v1/voices/clone -- list user's cloned voices with remaining quota
  - GET /api/v1/voices/clone/{voice_id} -- detailed voice metadata + quality analysis
  - DELETE /api/v1/voices/clone/{voice_id} -- permanent deletion with ownership check

**5 files modified:**
- `api/config.py` -- Added MAX_USER_VOICES, MAX_UPLOAD_SIZE_MB, USER_VOICES_DIR settings
- `api/app.py` -- Initialize UserVoiceManager in lifespan, register user_voices router, pass to GPUJobQueue
- `api/dependencies.py` -- Added get_user_voice_manager() dependency
- `api/gpu_queue.py` -- _process_job resolves uv_ voice IDs via UserVoiceManager.resolve_embedding_path() + increments usage
- `api/routes/generate.py` -- _validate_request accepts uv_ voice IDs with ownership verification (403 for unauthorized)

**Architecture compliance:**
- Zero VRAM impact: voice cleaning is CPU-only (pydub, noisereduce, pyloudnorm)
- User voices flow through the same VoxarPipeline as library voices (no new generation logic)
- Engine separation maintained: engine/ = AI logic, api/ = routing
- Reuses VoiceSampleCleaner from Phase 4 (unchanged)

**Security:**
- API key hashed (SHA-256, 6 chars) for directory scoping -- key never stored on disk
- Voice IDs use server-generated UUIDs (non-guessable)
- Ownership verification on all operations (get, generate, delete)
- File validation: size limit (15MB), format whitelist, content type check
- Temp file cleanup in finally blocks

**Verification:** 178/178 Phase 6 checks passed (`verify_phase6.py`)
**Regression:** 195/195 Phase 5, 107/107 Phase 4, 65/65 OpenVoice, 43/43 Phase 1-3 -- all clean
**API version:** 1.0.0 -> 1.1.0

### Session 7 (Phase 7 -- Speech-to-Text Engine -- v1.2.0)
Built the complete STT pipeline: Whisper transcription, speaker diarization, and subtitle export.

**4 new files created:**

**Engine Layer:**
- `engine/whisper_engine.py` -- VoxarWhisperEngine wrapping faster-whisper (CTranslate2 backend)
  - Transcription and translation for 99 languages with auto-detection
  - large-v3 model with int8 quantization (~1GB VRAM)
  - Word-level timestamps, VAD filtering, beam search
  - 3 data classes: WordSegment, TranscriptSegment, TranscriptionResult
  - Lazy loading, clean unload with torch.cuda.empty_cache()

- `engine/diarizer.py` -- VoxarDiarizer wrapping pyannote.audio
  - Speaker identification (who said what) via pyannote/speaker-diarization-3.1
  - Configurable speaker count (auto-detect, min/max bounds, or exact)
  - Overlap-based merge with Whisper transcript segments
  - Adjacent segment merging for cleaner output (gap threshold 0.5s)
  - Nearest-neighbor interpolation for unassigned segments
  - Graceful: if pyannote not installed or no HF token, simply disabled (not an error)
  - Requires HuggingFace token (pyannote models are gated)

- `engine/subtitle_exporter.py` -- SubtitleExporter (stateless utility, zero VRAM)
  - SRT export (SubRip) -- universally supported
  - VTT export (WebVTT) -- HTML5 native, YouTube, browser players
  - JSON export (structured data with segments, words, speakers)
  - Word-level subtitle mode for karaoke-style display
  - Speaker label support in both SRT ([SPEAKER_00]) and VTT (<v SPEAKER_00>)
  - Long segment splitting (max 42 chars/line, 7s max duration)
  - Industry-standard formatting (Netflix/Amazon CPS targets)

**API Layer:**
- `api/routes/transcribe.py` -- 4 endpoints for speech-to-text
  - POST /api/v1/transcribe -- async transcription job (upload audio)
  - POST /api/v1/transcribe/sync -- sync transcription (short audio)
  - GET /api/v1/transcribe/{job_id} -- poll job status
  - GET /api/v1/transcribe/{job_id}/result -- download result (JSON/SRT/VTT)
  - Multipart upload with file validation (extension, content type, size)
  - Temp file management with cleanup

**5 files modified:**
- `engine/engine_router.py` -- v1.1 -> v1.2: Added transcribe() method with full hot-swap protocol
  (XTTS unload -> Whisper -> diarize -> subtitles -> XTTS reload)
  Added whisper/diarizer lazy properties, __init__ accepts STT config
- `api/config.py` -- Added 6 STT settings (model size, compute type, HF token, audio limits)
- `api/gpu_queue.py` -- v1.0 -> v1.1: Added STT job type, submit_transcription(), _process_stt_job()
  JobResult extended with STT-specific fields
- `api/app.py` -- v1.0 -> v1.2: Register transcribe router, pass Whisper/HF config to EngineRouter
- `api/routes/jobs.py` -- Updated to use tts_audio_path field

**Verification:** 220/220 Phase 7 checks passed (`verify_phase7.py`)
**Regression:** 178/178 Phase 6, 195/195 Phase 5, 107/107 Phase 4, 65/65 OpenVoice, 43/43 Phase 1-3 -- all clean
**API version:** 1.1.0 -> 1.2.0

**Dependencies to install before first use:**
```
pip install faster-whisper
pip install pyannote.audio  # Optional: for speaker diarization (requires HF_TOKEN)
```

### Session 8 (Phase 8 -- Next.js Frontend Dashboard -- v1.0.0)
Built the complete VOXAR frontend with Next.js 14, TailwindCSS, shadcn/ui, and Zustand.

**Tech Stack:**
- Next.js 16 (App Router, TypeScript)
- TailwindCSS v4 + shadcn/ui (19 Radix components)
- Zustand (auth, usage, TTS, STT, voice stores)
- Lucide React (icons)

**Project structure: `frontend/`**

**Landing Page (Public):**
- `src/app/page.tsx` -- Landing page assembling all sections
- `src/components/landing/hero.tsx` -- Hero with animated gradient, waveform, live demo widget, trust badges
- `src/components/landing/features.tsx` -- 6 feature cards (TTS, Cloning, STT, Diarization, Subtitles, Multilingual)
- `src/components/landing/voices.tsx` -- Horizontal scrollable voice card carousel (8 voices)
- `src/components/landing/how-it-works.tsx` -- 3-step flow with connector lines
- `src/components/landing/use-cases.tsx` -- 6 use case cards (YouTube, Audiobooks, Shorts, Marketing, E-Learning, Accessibility)
- `src/components/landing/pricing.tsx` -- 5-tier pricing (Free/Access/Starter/Creator/Pro) + Enterprise + FAQ accordion
- `src/components/landing/testimonials.tsx` -- 4 testimonial cards

**Shared Components:**
- `src/components/shared/navbar.tsx` -- Fixed nav with mobile menu, logo, CTA buttons
- `src/components/shared/footer.tsx` -- 4-column footer with links and socials

**Auth Pages (split layout: brand panel + form):**
- `src/app/(auth)/layout.tsx` -- Split layout with VOXAR branding left, form right
- `src/app/(auth)/login/page.tsx` -- Email/password + Google OAuth + forgot password link
- `src/app/(auth)/signup/page.tsx` -- Name/email/password + terms checkbox + Google OAuth
- `src/app/(auth)/forgot-password/page.tsx` -- Email input with success state
- `src/app/(auth)/reset-password/page.tsx` -- New password + confirm

**Dashboard (Authenticated):**
- `src/app/dashboard/layout.tsx` -- Sidebar + TopBar + mobile overlay, usage meters, breadcrumbs
- `src/app/dashboard/page.tsx` -- Quick actions (4 cards), usage overview (3 bars), recent activity table
- `src/app/dashboard/tts/page.tsx` -- Two-column TTS: text input (toolbar, char counter), voice selector (6 voices), advanced settings (mode/speed/format/language), audio player, result details, download buttons
- `src/app/dashboard/transcribe/page.tsx` -- Two-column STT: drag-drop upload, settings (task/language/diarization/subtitles), transcript viewer with timestamps + speaker colors, detection info, multi-format downloads
- `src/app/dashboard/voices/page.tsx` -- Voice library grid (20 voices) with search, language/gender filters, grid/list toggle, favorites, cloned voices section
- `src/app/dashboard/voices/clone/page.tsx` -- 4-step wizard (Upload -> Processing -> Preview -> Done) with quality analysis, audio comparison
- `src/app/dashboard/history/page.tsx` -- Usage cards (TTS/STT/Clones/Reset), job history table with expandable details, type/status filters
- `src/app/dashboard/settings/page.tsx` -- 4 tabs: Profile (avatar, name, email, password), API Keys (Pro-only gate), Preferences (defaults), Billing (plan, payment history, cancel)

**Additional Pages:**
- `src/app/docs/page.tsx` -- API documentation (auth, base URL, endpoints by group, code examples in Python/JS/cURL, rate limits)
- `src/app/(marketing)/pricing/page.tsx` -- Standalone pricing page
- `src/app/not-found.tsx` -- 404 with gradient text, waveform animation

**State Management:**
- `src/stores/index.ts` -- 5 Zustand stores (auth, usage, TTS, STT, voice)

**API Client:**
- `src/lib/api.ts` -- Typed API client for all FastAPI endpoints (TTS, STT, Voices, Health)

**Design System:**
- `src/app/globals.css` -- VOXAR dark theme (deep space black #0a0a0f, violet #8b5cf6 accent), custom animations (gradient-shift, float, waveform, fade-in-up, shimmer), custom scrollbar
- Dark-only app (html className="dark")

**Build:** All 15 routes compile successfully (Next.js 16.1.6 + Turbopack)
**Frontend version:** 1.0.0

### Session 9 (Frontend Rebuild -- Premium Dark Glass Theme)
User rejected Phase 8 frontend. Rebuilt from scratch in `frontend/hanu/` with a premium dark glass theme.

**Landing Page (`frontend/hanu/app/page.tsx`):**
- Custom CSS design system (no Tailwind) with glass morphism
- GSAP + ScrollTrigger animations (parallax hero, stagger reveals, 3D cube)
- Full pricing cards component (6 tiers: Free/Access/Starter/Creator/Pro/Enterprise)
- Interactive demo widget, voice preview carousel, FAQ accordion
- Design tokens: --accent (#8B5CF6), --bg-primary (#020005), --bg-glass, --border

**Dashboard (14 routes):**
- Sidebar with navigation to all routes
- Studio Editor (block-based, ElevenLabs-style) -- multi-voice, timeline, play simulation
- TTS page, Voice Library (trending/handpicked horizontal scroll + grid), Cloning (3-step wizard)
- History (filtered table with type badges), Settings (Profile/Billing/API tabs)
- Transcribe (drag-drop, speaker diarization, subtitle export)
- Projects (grid with create + existing), Future Tools (8 upcoming features)

**Zustand Stores:** authStore, ttsStore, sttStore, voiceStore, usageStore
**API Client:** `lib/api.ts` with dual-backend support (FastAPI + Node.js)

### Session 10 (Phase 9 -- Node.js Backend & Credit System -- v1.0.0)
Built the complete Node.js business backend for auth, credits, and project management.

**23 files created in `backend/`:**

**Models (Mongoose):**
- `models/User.js` -- User with plan tiers, usage tracking, API keys, bcrypt password hashing
- `models/Project.js` -- Studio projects with speech blocks and voice assignments
- `models/History.js` -- Generation history (TTS/STT/Clone) with status tracking
- `models/Voice.js` -- User-cloned voices with sample paths and quality scores

**Auth System:**
- `middleware/auth.js` -- JWT middleware (authMiddleware, optionalAuth, generateToken)
- `controllers/authController.js` -- register, login, getMe, updateProfile
- `routes/auth.js` -- POST /register, POST /login, GET /me, PATCH /me

**Credit System (`services/creditService.js`):**
- 6 plan tiers matching landing page pricing exactly:
  - Free: 3 min TTS (lifetime), 0 STT, 0 clones
  - Access: 10 min TTS/mo, 15 min STT, 1 clone
  - Starter: 120 min TTS/mo, 300 min STT, 3 clones
  - Creator: 500 min TTS/mo, 1200 min STT, 10 clones
  - Pro: 2000 min TTS/mo, 6000 min STT, 25 clones, API access
  - Enterprise: Unlimited everything
- Character-to-minutes conversion (750 chars/min)
- Check/deduct functions for TTS, STT, and clones
- Auto-reset on 30-day billing cycle
- Usage summary endpoint for dashboard display

**Engine Bridge (`services/engineBridge.js`):**
- HTTP bridge to Python FastAPI server (port 8000)
- generateTTS(), transcribe(), cloneVoice(), getVoiceCatalog(), healthCheck()
- Timeout handling (2min TTS, 5min STT)

**API Routes:**
- `routes/tts.js` -- POST /generate (with credit check + deduction)
- `routes/voices.js` -- GET /catalog, GET /my, POST /clone (multer upload), DELETE /:id
- `routes/history.js` -- GET / (paginated, filtered), GET /:id, DELETE /:id
- `routes/projects.js` -- CRUD (GET /, GET /:id, POST /, PATCH /:id, DELETE /:id)
- `routes/user.js` -- GET /usage, POST /api-keys, DELETE /api-keys/:keyId

**Server (`server.js`):**
- Express + MongoDB (Mongoose) + CORS
- All routes mounted under /api/v1/
- Health check endpoint with engine status
- Static file serving for uploads

**Dependencies:** express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv, multer, axios, uuid
**All 20 files pass Node.js syntax check (node --check)**
**Backend version:** 1.0.0

### Session 11 (Phase 10 -- Razorpay Payments -- v1.1.0)
Built the complete Razorpay payment integration for subscription billing.

**8 new files created in `backend/`:**

**Models:**
- `models/Subscription.js` -- Razorpay subscription tracking (plan, status, billing period, dates, paid_count)
- `models/Payment.js` -- Payment records (razorpay IDs, amount in paise, method, status, errors)

**Service Layer:**
- `services/razorpayService.js` -- Complete Razorpay SDK wrapper
  - Plan definitions matching landing page pricing exactly (INR paise):
    - Access: ₹199/mo (19900 paise), ₹159/mo annual
    - Starter: ₹499/mo (49900 paise), ₹399/mo annual
    - Creator: ₹1,499/mo (149900 paise), ₹1,199/mo annual
    - Pro: ₹4,999/mo (499900 paise), ₹3,999/mo annual
  - createRazorpayPlan(), createSubscription(), cancelSubscription(), pauseSubscription(), resumeSubscription()
  - verifyPaymentSignature() (HMAC SHA-256 for checkout callback)
  - verifyWebhookSignature() (HMAC SHA-256 for webhook events)
  - createCustomer(), fetchSubscription(), fetchPayments()

**Controllers:**
- `controllers/billingController.js` -- 6 actions:
  - getPlans: list pricing tiers
  - subscribe: create Razorpay subscription + customer, cancel existing if upgrading
  - verifyPayment: verify signature, activate plan, reset credits, record payment
  - getSubscription: current subscription status (synced with Razorpay)
  - cancelCurrentSubscription: cancel at cycle end (user keeps access)
  - getPayments: paginated payment history

- `controllers/webhookController.js` -- Handles 9 Razorpay events:
  - subscription.authenticated/activated: activate user plan + reset credits
  - subscription.charged: new billing cycle, reset monthly credits, record payment
  - subscription.completed/cancelled: downgrade to free (cancelled retains until period end)
  - subscription.halted: payment failures, immediate downgrade
  - subscription.pending: update status
  - payment.captured/failed: record in Payment model

**Routes:**
- `routes/billing.js` -- GET /plans, POST /subscribe, POST /verify, GET /subscription, POST /cancel, GET /payments
- `routes/webhooks.js` -- POST /razorpay (raw body for signature verification)

**Setup Script:**
- `scripts/setup-razorpay-plans.js` -- Run once to create Razorpay plans via API

**Modified files:**
- `models/User.js` -- Added razorpay_customer_id, active_subscription ref, billing_period
- `server.js` -- v1.0 -> v1.1: Raw body middleware for webhooks, billing + webhook route mounting
- `.env` -- Added RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, plan ID placeholders
- `package.json` -- Added razorpay dependency

**Checkout Flow:**
1. Frontend calls POST /billing/subscribe with plan + period + razorpay_plan_id
2. Backend creates Razorpay subscription, returns subscription_id + razorpay_key
3. Frontend opens Razorpay Checkout with those params
4. User completes payment on Razorpay
5. Frontend receives callback, calls POST /billing/verify with signature
6. Backend verifies, activates plan, resets credits
7. Webhook confirms asynchronously (subscription.activated/charged)

**Recurring Billing:**
- Razorpay auto-charges at cycle end
- Webhook (subscription.charged) resets monthly credits automatically
- If payment fails, subscription.halted webhook downgrades user to free

**All 28 backend files pass Node.js syntax check (node --check)**
**Backend version:** 1.0.0 -> 1.1.0

### Session 12 (Phase 10.5 -- Voice Marketplace -- v1.2.0)
Built the community voice marketplace with creator royalties and quality gate.

**5 new files created in `backend/`:**

**Models:**
- `models/MarketplaceVoice.js` -- Voice listing with consent framework, quality gate (min score 80), reviews, royalty tiers
  - 3 royalty tiers: Standard (₹0.50), Premium (₹0.75), Elite (₹1.00) per generation
  - Consent: is_own_voice, allows_commercial, allows_modification flags
  - Reviews with 1-5 rating, auto-calculated average
  - Indexed on status, category, creator, tags

- `models/CreatorEarnings.js` -- Monthly earnings tracking per creator
  - 70/30 revenue split (creator/VOXAR)
  - Auto-calculates platform_fee and creator_payout on save
  - Minimum payout: ₹200 (20000 paise)
  - Bank transfer fee: ₹10 (1000 paise)
  - Unique index on {creator, period}

**Service Layer:**
- `services/marketplaceService.js` -- Marketplace business logic
  - recordUsage(): increment voice stats + creator earnings for current month
  - meetsQualityGate(): verify quality_score >= 80
  - getUnpaidEarnings(): aggregate unpaid/eligible periods
  - requestPayout(): validate minimum, mark periods as requested

**Controller:**
- `controllers/marketplaceController.js` -- 8 actions:
  - browseVoices: filter by category/language/gender/search, sort by popular/newest/rating/featured
  - getVoice: single listing with creator info
  - publishVoice: quality gate + consent validation + duplicate check
  - unpublishVoice: creator-only removal
  - reviewVoice: 1-5 rating with comment (can't review own voice, updates existing)
  - getMyListings: creator's published voices
  - getEarnings: last 12 months + unpaid balance
  - requestPayout: min ₹200, credits or bank transfer (₹10 fee)

**Routes:**
- `routes/marketplace.js` -- Public: GET /voices, GET /voices/:id. Auth'd: POST /publish, DELETE /voices/:id, POST /voices/:id/review, GET /my-voices, GET /earnings, POST /payout

**Modified:**
- `server.js` -- v1.1.0 -> v1.2.0: Mounted marketplace routes at /api/v1/marketplace

**All 32 backend files pass Node.js syntax check (node --check)**
**Backend version:** 1.1.0 -> 1.2.0

### Session 12 (Phase 11 -- Cloud Deployment)
Built the complete deployment infrastructure for all three services.

**9 files created in project root + frontend:**

**Docker (GPU Engine):**
- `Dockerfile.engine` -- NVIDIA CUDA 12.1 base, Python 3.10, ffmpeg, copies engine/ + api/ + voices/, exposes 8000
  - Health check with 120s start period (XTTS model loading)
  - Non-root user approach skipped (GPU access needs root typically)

- `requirements.txt` -- Python engine dependencies (TTS, torch, pydub, noisereduce, librosa, transformers, openvoice, faster-whisper, fastapi, uvicorn)

**Docker (Node.js Backend):**
- `Dockerfile.backend` -- Node 20 Alpine, npm ci --omit=dev, non-root user (voxar), exposes 3001

**Docker Compose (Local Dev):**
- `docker-compose.yml` -- 3 services:
  - mongo (7): persistent volume, port 27017
  - backend: depends on mongo, connects via mongodb://mongo:27017/voxar, port 3001
  - engine: NVIDIA GPU reservation, port 8000, model/output/voice volumes

**Frontend (Vercel):**
- `frontend/hanu/vercel.json` -- Region bom1 (Mumbai), API rewrites:
  - /api/engine/* -> engine.voxar.in
  - /api/v1/* -> api.voxar.in

**Backend (Railway):**
- `backend/railway.toml` -- Nixpacks builder, health check on /health, port 3001

**GPU Engine (RunPod/Vast.ai):**
- `deploy-engine.sh` -- Bash script: build Docker image, stop existing, run with --gpus all, wait up to 120s for health

**Environment:**
- `.env.production` -- Production template with MongoDB Atlas, live Razorpay keys, CORS, engine URL
- `.dockerignore` -- Excludes node_modules, venv, .env files, build artifacts, large binaries, tests, docs