# VOXAR – CLAUDE OPERATING RULES

This file defines the absolute constraints and operating procedures for Claude within the VOXAR repository. Claude must adhere to these rules at all times.

============================================================
0. THE CONTEXT ANCHOR (READ FIRST)
============================================================
Before starting a new session or executing a major refactor, you MUST silently read the following files if they exist:
- `VOXAR_ROADMAP.md` (For overall architecture)
- `EXECUTION_TRACKER.md` (For current progress)
- `ERRORS_LOG.md` (To avoid repeating past mistakes)

============================================================
1. MODES OF OPERATION & TRIGGERS
============================================================
Wait for the user to specify a mode. Do not mix modes.

[PLAN MODE] - Triggered by user asking to "Plan" or "/plan"
- Output architecture, logic flows, and step-by-step breakdowns ONLY.
- NO file creation. NO file modification. NO code generation.

[REVIEW MODE] - Triggered by user asking to "Review" or "/review"
- Analyze existing code and report issues/vulnerabilities.
- Categorize severity (Critical, High, Medium, Low).
- Provide a summary of fixes. Do NOT implement them yet.

[EXECUTION MODE] - Triggered by user asking to "Execute" or "/execute"
- Implement ONLY ONE approved step at a time.
- Show the diff or proposed code snippet before applying.
- Stop and wait for user approval before moving to the next step.

============================================================
2. GLOBAL BEHAVIOR RULES
============================================================
1. Always propose structural changes before applying file edits.
2. Never auto-rewrite large files without explicit instruction.
3. Do not modify multiple modules in a single change unless authorized.
4. Preserve public function signatures unless a refactor is explicitly approved.
5. If ambiguity exists, STOP and ask clarifying questions.

============================================================
3. STRICT ENGINEERING CONSTRAINTS (DO NOT ALTER)
============================================================
These are hard-won project truths. Do not attempt to "optimize" or alter these established behaviors:

- **XTTS Hindi Bug:** XTTS v2 crashes when generating Hindi with advanced parameters. ALWAYS use the basic `tts_to_file` call without `temperature`, `top_k`, etc., when `lang="hi"`.
- **Chunk Limits:** Strictly respect max chunk sizes: `250` chars for Hindi, `350` chars for English. 
- **Chunk Transitions:** The `AudioConcatenator` MUST use a `50ms` crossfade to prevent robotic pitch resets at chunk joints. Do not revert to hard concatenation (0ms).
- **Hinglish Processing:** Rely EXCLUSIVELY on `hinglish_words.json` for transliteration. Do NOT implement algorithmic ITRANS fallbacks (they produce garbage text).
- **Date/Time Parsing:** Never interpret hyphens (`-`) inside dates as mathematical subtraction.
- **Pipeline Order:** In `ScriptPreprocessor`, Dates/Times/URLs must be processed BEFORE abbreviations.

============================================================
4. GPU & HARDWARE RULES (RTX 4060 - 8.59GB VRAM)
============================================================
- **VRAM Ceiling:** XTTS takes ~2GB. MMS ~0.5GB. OpenVoice ~0.5GB. Whisper ~1.5GB.
- **Concurrency:** Limit job concurrency to prevent Out-Of-Memory (OOM) errors.
- **Hot-Swapping:** Never load XTTS and MMS models simultaneously on dev hardware. Prefer dynamic loading/unloading (hot-swapping) via `EngineRouter`. Sequential model loading only.
- **Cleanup:** Always run `torch.cuda.empty_cache()` after heavy generation tasks.
- **Marathi:** Uses Devanagari script — works with XTTS just like Hindi. Voice cloning supported.
- **Regional Languages (Approach B):** Tamil, Telugu, Bengali, Kannada, Malayalam, Gujarati, Punjabi, Odia use MMS for pronunciation + OpenVoice for voice identity transfer. Do NOT attempt phonetic script conversion (Approach A) — rejected, Dravidian phonemes don't map to Hindi.

============================================================
5. SAAS ARCHITECTURE RULES
============================================================
- **Separation of Concerns:** - `engine/` handles AI logic ONLY. NO web routing, NO billing.
  - `api/` (FastAPI) handles routing, queues, and serves the engine.
  - `backend/` (Node.js) handles credits, auth, and business logic.
- **API Boundary:** The API layer must call the engine as a modular service. Do not bleed TTS generation logic into API route files.

============================================================
AUDIT DEFAULT: If asked for large, multi-file changes without a specific mode, automatically enter [PLAN MODE] first.