# VOXAR_ROADMAP.md

---
## SECTION A: PROJECT VISION
VOXAR is a premium, India-first AI voice technology platform designed for content creators, agencies, and businesses. 
* **Core Differentiator:** True native Indian language support (via MMS) + flawless Hinglish handling (auto-transliteration to Devanagari) + high-fidelity Voice Cloning (via XTTS v2).
* **Monetization:** SaaS subscription model (Free, Starter, Creator, Pro, Ultra) + Credit-based system via Razorpay. Target: Passive income within 6-8 months. 
* **Target Niches:** YouTube Automation (News, Finance), Regional Audiobooks, Shorts/Reels, Marketing/Ads, and Accessibility.

---
## SECTION B: TECHNICAL STACK DECISIONS
* **Hardware (Dev):** Lenovo LOQ, RTX 4060 (8.59 GB VRAM), 24GB RAM.
* **Core AI Engine:** Hybrid Architecture.
    * *XTTS v2:* Used for English, Hindi (Devanagari), and Voice Cloning across all languages.
    * *MMS-TTS (Meta):* Used for native Indian languages (Tamil, Telugu, Bengali, Marathi, etc.) to ensure perfect regional pronunciation.
* **Audio Processing:** `pydub`, `librosa`, `pyloudnorm`, `noisereduce`.
* **Backend / API:** FastAPI (Python) for AI Engine, Node.js + Express + Prisma for business logic/credits.
* **Frontend:** Next.js 14, TailwindCSS, Zustand.
* **Infrastructure Strategy:** Vercel (Frontend), Railway (Backend), Vast.ai/RunPod (GPU Engine).

---
## SECTION C: PHASE HISTORY

### Phase 1: XTTS Engine Setup & Stabilization (✅ COMPLETED)
* **What was built:** Core `VoxarTTSEngine` wrapping XTTS v2. Configured 4 modes: Flash, Cinematic, Longform, Multilingual. Chunking system for long texts. 
* **What worked:** English and Devanagari Hindi work flawlessly. Stress tested English up to 5000 chars and Hindi up to 2000 chars with no VRAM leaks. Real-time factor is excellent (~0.53).
* **Architectural Pivot:** Decided on a Hybrid Pipeline. XTTS lacks true native pronunciation for non-Devanagari Indian languages. Will integrate MMS-TTS in Phase 4 for TA/TE/BN/MR.

### Phase 2: Audio Post-Processing Pipeline (✅ COMPLETED)
* **What was built:** `VoxarAudioAnalyzer`, `VoxarAudioMaster`. 8-step pipeline: trim silence, normalize (-16 LUFS), declip (-1.1 dBFS), denoise, dynamic compression, EQ presets, breath smoothing, artifact removal.
* **What worked:** Audio quality scores jumped from 55-70 to 100/100. Chunk joint artifacts (a major Phase 1 issue) were completely fixed by implementing a **50ms crossfade**.
* **Exports:** Implemented watermarked 128kbps MP3s for free tier, and 320kbps MP3 / 16-bit WAVs for paid tiers.

### Phase 3: Text Preprocessor & Language Intelligence (✅ COMPLETED)
* **What was built:** `ScriptPreprocessor`. Handled numbers, Indian currency (Lakh, Crore), abbreviations, and special text (URLs, emojis).
* **What worked:** `HinglishHandler` is highly successful. It auto-detects Romanized Hindi and uses a 500+ word dictionary to convert to Devanagari so XTTS reads it perfectly. English words inside Hinglish are safely preserved. `PauseController` and `EmphasisHandler` successfully map custom markers (`[pause:1s]`, `**bold**`).
* **What failed initially:** ITRANS fallback transliteration produced garbage. 
* **Decision:** Disabled ITRANS. Will rely strictly on the custom JSON dictionary for Hinglish mapping. Order of operations in the pipeline is strictly locked (e.g., Dates/URLs processed *before* abbreviations).

---
## SECTION D: ALL ERRORS ENCOUNTERED

### Phase 1 Errors
* **Error 1:** `KeyError: 'hi'` in XTTS when passing advanced params (temperature, top_k).
    * *Fix:* Used a simplified `tts_to_file` call without advanced params for Hindi. Voice cloning still works perfectly.
* **Error 2:** Chunk transitions sounded harsh and disjointed.
    * *Fix:* Solved in Phase 2 using a 50ms overlap crossfade and silence trimming between concatenated chunks.

### Phase 3 Errors
* **Error 1:** Algorithmic transliteration (ITRANS) ruined unknown English words.
    * *Fix:* Removed library fallback. Solely using `hinglish_words.json` dictionary.
* **Error 2:** Abbreviations conflicting with times/dates (e.g., "3:30 PM" mapping to "Prime Minister").
    * *Fix:* Strict execution order. Times and dates are processed before general abbreviations. URLs and Emails are masked/protected during processing.

---
## SECTION E: POSTPONED ITEMS
* **LLM Script Assist (Magic Button):** Instead of processing *every* prompt through Groq/Gemini (which adds latency and API costs), we will add an optional "Enhance for TTS" button on the Phase 8 frontend. This will rewrite scripts and auto-inject `[pause]` and `**` markers based on style (Narration, Audiobook, etc.).
* **Advanced Voice Cloning UI/Validation:** Will be fleshed out in Phase 6.

---
## SECTION F: CURRENT STATE
* **Current Phase:** Ready to begin **Phase 4 (Voice Library Creation)**.
* **Last working state:** Phase 3 `ScriptPreprocessor` is fully functional and successfully pipes cleaned text to the Phase 2 `VoxarAudioMaster`.
* **Pending Next Action:** Build `mms_engine.py`, integrate it into the router, download MMS models for TA/TE/BN/MR, and curate the 25 premium voice references to build `voices_catalog.json`.

---
## SECTION G: UNRESOLVED QUESTIONS
* How will VRAM be dynamically managed when swapping between XTTS v2 and MMS models on the 8.59GB RTX 4060 during Phase 5 (API development)? Will likely need strict model unloading logic.