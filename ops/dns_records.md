VOXAR DNS RECORDS



Domain provider

Hostinger



DNS manager

Cloudflare





MAIN DOMAIN



Type: A

Name: voxar.in

Points to: Vercel frontend





WWW REDIRECT



Type: CNAME

Name: www

Points to: voxar.in





API SERVER



Type: A

Name: api.voxar.in

Points to: <HETZNER\_SERVER\_IP>





AUDIO CDN



Type: CNAME

Name: audio.voxar.in

Points to: <CLOUDFLARE\_R2\_BUCKET\_URL>





ENGINE (OPTIONAL)



Type: CNAME

Name: engine.voxar.in

Points to: RunPod endpoint





NOTES



voxar.in

→ frontend hosted on Vercel



api.voxar.in

→ backend Node.js server on Hetzner



audio.voxar.in

→ generated audio files stored in Cloudflare R2



engine.voxar.in

→ GPU inference endpoint on RunPod

