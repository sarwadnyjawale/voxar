VOXAR SERVERS



Backend VPS

Provider: Hetzner

Server name: voxar-core

Location: <datacenter region>

Public IP: <PASTE SERVER IP HERE>

OS: Ubuntu 22.04



SSH access

Command:

ssh root@<SERVER\_IP>



Coolify panel

URL:

http://<SERVER\_IP>:8000



Services running on VPS

\- Node.js backend

\- Redis queue

\- MongoDB database

\- Coolify deployment panel



Ports

3001 → backend API

6379 → Redis

27017 → MongoDB

8000 → Coolify panel



Notes

This server handles backend logic, job queue, and database.

GPU inference is executed on RunPod serverless workers.

