# Cloudflare R2 Setup Guide

R2 is an S3-compatible cloud storage solution by Cloudflare.
It costs $0 for egress (bandwidth) making it perfect for delivering generated audio files to users globally.

## 1. Create the Bucket
1. Log into Cloudflare. Go to **R2**.
2. Click **Create Bucket**.
3. Name it: `voxar`.
4. Location Hint: `Automatic` (or Asia-Pacific if most users are in India).

## 2. Generate API Keys
1. In the R2 dashboard, click **Manage R2 API Tokens** (top right).
2. Click **Create API Token**.
3. Name: `voxar-backend`.
4. Permissions: `Object Read & Write`.
5. Specify Bucket: `voxar`.
6. Click **Create API Token**.
7. **IMPORTANT**: Copy the Access Key ID and Secret Access Key. They are only shown once!

## 3. Enable Public Access for the CDN
By default, the R2 bucket is private. Your frontend needs to stream audio directly from it.
1. Go to your `voxar` bucket.
2. Click **Settings** -> **Public Access** -> **Custom Domains**.
3. Click **Connect Domain**.
4. Enter `audio.voxar.in` (Ensure your voxar.in domain is managed by Cloudflare DNS).
5. Cloudflare will automatically provision SSL for this subdomain.

## 4. Configure Backend
Copy these values into your Coolify Backend Environment Variables:
- `R2_ACCOUNT_ID`: Found on the main R2 page (a long hex string on the right).
- `R2_ACCESS_KEY_ID`: From Step 2.
- `R2_SECRET_ACCESS_KEY`: From Step 2.
- `R2_BUCKET_NAME`: `voxar`
- `R2_PUBLIC_URL_PREFIX`: `https://audio.voxar.in`

Whenever a job finishes generation via RunPod, the backend uploads the audio Base64 directly into this bucket. The user is then given a fast link like `https://audio.voxar.in/generated/tts_8321.mp3`.
