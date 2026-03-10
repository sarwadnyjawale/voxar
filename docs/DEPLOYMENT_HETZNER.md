# Hetzner & Coolify Deployment Guide

## 1. Purchase Server
1. Go to Hetzner Cloud and create a **CX33** server (4 vCPU, 8GB RAM).
2. Choose Ubuntu 22.04 LTS.
3. Add your SSH keys.
4. Note the Server IP address.

## 2. Install Coolify (The PaaS)
1. SSH into the server: `ssh root@<YOUR_SERVER_IP>`
2. Run the one-line installer:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. Wait 5 minutes. Go to `http://<YOUR_SERVER_IP>:8000` to set up your admin account.

## 3. Deploy Databases (via Coolify)
1. Go to Coolify Dashboard -> **Create New Resource** -> **Database**.
2. Deploy **MongoDB 7**. Wait for it to spin up. Note the internal connection string.
3. Deploy **Redis 7**. Note the internal connection string.

## 4. Deploy Backend
1. Go to **Create New Resource** -> **Application** -> **Public Repository** (or Private if using GitHub App).
2. Point it to your VOXAR Git Repo.
3. Important Configs:
   - **Build Pack**: Nixpacks or Dockerfile.
   - **Base Directory**: `/backend`
   - **Environment Variables**: Paste the contents of `.env.example`, fill in real values.
   - `MONGODB_URI`: Use the internal one from step 3.
   - `REDIS_URL`: Use the internal one from step 3.
   - `VOXAR_ENGINE_MODE`: `runpod`
   - **Domains**: `https://api.voxar.in`
4. Click **Deploy**. Coolify will build the backend container and attach Let's Encrypt SSL.

## 5. Summary
Your Node.js Backend, MongoDB, and Redis are now running smoothly on one $7/mo machine.
