VOXAR DEPLOYMENT PLAN



Domain

voxar.in



Edge / CDN

Provider: Cloudflare

Functions:

\- DNS

\- TLS termination

\- DDoS protection

\- CDN caching

\- R2 public audio delivery



Frontend

Framework: Next.js (App Router)

Host: Vercel

Public URL: https://voxar.in

Build source: GitHub repository



Backend API

Runtime: Node.js (Express)

Host: Hetzner VPS (managed via Coolify)

Base URL: https://api.voxar.in

Responsibilities:

\- Auth (JWT)

\- Credits / usage

\- Billing (Razorpay)

\- History / projects

\- Proxy to AI engine

\- Queue submission \& status



Queue

Technology: Redis

Host: Hetzner VPS

Purpose:

\- Job queue for TTS/STT

\- Status tracking

\- Retry / TTL



AI Workers

Platform: RunPod Serverless

GPU: RTX 3090 (or equivalent)

Mode: scale-to-zero (min=0, max=3, idle timeout=300s)

Function:

\- TTS generation (XTTS)

\- STT transcription (Whisper)

\- Voice cloning

\- Returns audio payload or uploads to storage



Object Storage

Service: Cloudflare R2

Bucket: voxar-audio

Public domain: https://audio.voxar.in

Use:

\- store generated audio

\- store user uploads if needed

\- CDN distribution via Cloudflare



Container Registry

Service: Docker Hub

Image: voxar-engine:latest

Used by: RunPod serverless endpoint



Payments

Service: Razorpay

Flows:

\- subscription plans

\- webhook verification

\- billing events



Environment Configuration

Secrets managed via:

\- backend .env

\- RunPod environment variables

\- Vercel environment variables

\- local ops/secrets.local.md reference



Operational Notes

\- GPU only runs on demand through RunPod

\- Backend handles credit checks before GPU invocation

\- Generated audio stored in R2 and served through Cloudflare

\- Queue prevents overload when multiple jobs arrive

