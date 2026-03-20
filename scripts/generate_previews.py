"""
Voice Preview Generator for VOXAR
Generates 8-second MP3 preview clips for all voices in the catalog.
Run with: python scripts/generate_previews.py

Requires the engine to be running on localhost:8000
"""
import os
import sys
import json
import time
import requests

ENGINE_URL = os.environ.get('ENGINE_URL', 'http://localhost:8000')
API_KEY = os.environ.get('ENGINE_API_KEY', 'voxar-dev-key-001')
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'voices', 'previews')

# Preview text — short, punchy, ~8 seconds of speech
PREVIEW_TEXTS = {
    'en': "Welcome to VOXAR. This is a preview of my voice. Studio-grade neural speech, ready for your next project.",
    'hi': "VOXAR में आपका स्वागत है। यह मेरी आवाज़ का एक नमूना है। स्टूडियो-ग्रेड न्यूरल स्पीच।",
}

def get_voice_catalog():
    """Fetch voice catalog from engine"""
    try:
        res = requests.get(f'{ENGINE_URL}/api/v1/voices', headers={'X-API-Key': API_KEY}, timeout=10)
        res.raise_for_status()
        data = res.data if hasattr(res, 'data') else res.json()
        return data.get('voices', data) if isinstance(data, dict) else data
    except Exception as e:
        print(f'[ERROR] Could not fetch voice catalog: {e}')
        return []

def generate_preview(voice_id, voice_name, language='en'):
    """Generate a single preview clip"""
    text = PREVIEW_TEXTS.get(language, PREVIEW_TEXTS['en'])

    try:
        # Submit generation job
        res = requests.post(f'{ENGINE_URL}/api/v1/generate', json={
            'text': text,
            'voice_id': voice_id,
            'engine_mode': 'flash',
            'language': language,
            'output_format': 'mp3',
            'enhance': True,
            'normalize': True,
        }, headers={'Content-Type': 'application/json', 'X-API-Key': API_KEY}, timeout=30)
        res.raise_for_status()
        data = res.json()
        job_id = data.get('job_id')

        if not job_id:
            print(f'  [WARN] No job_id returned for {voice_name}')
            return False

        # Poll for completion
        for _ in range(60):
            time.sleep(2)
            poll = requests.get(f'{ENGINE_URL}/api/v1/jobs/{job_id}', headers={'X-API-Key': API_KEY}, timeout=10)
            poll_data = poll.json()

            if poll_data.get('status') == 'completed':
                audio_url = poll_data.get('audio_url') or poll_data.get('audio_path', '')
                if audio_url:
                    # Download the audio
                    full_url = audio_url if audio_url.startswith('http') else f'{ENGINE_URL}{audio_url}'
                    audio_res = requests.get(full_url, timeout=30)
                    audio_res.raise_for_status()

                    out_path = os.path.join(OUTPUT_DIR, f'{voice_id}.mp3')
                    with open(out_path, 'wb') as f:
                        f.write(audio_res.content)

                    size_kb = len(audio_res.content) / 1024
                    print(f'  [OK] {voice_name} -> {out_path} ({size_kb:.1f} KB)')
                    return True

            elif poll_data.get('status') == 'failed':
                print(f'  [FAIL] {voice_name}: {poll_data.get("error", "unknown")}')
                return False

        print(f'  [TIMEOUT] {voice_name}')
        return False

    except Exception as e:
        print(f'  [ERROR] {voice_name}: {e}')
        return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f'[VOXAR Preview Generator]')
    print(f'Engine: {ENGINE_URL}')
    print(f'Output: {OUTPUT_DIR}')
    print()

    voices = get_voice_catalog()
    if not voices:
        print('[ERROR] No voices found. Is the engine running?')
        sys.exit(1)

    print(f'Found {len(voices)} voices. Generating previews...\n')

    success = 0
    failed = 0
    skipped = 0

    for voice in voices:
        vid = voice.get('voice_id', voice.get('id', ''))
        name = voice.get('name', vid)
        lang = voice.get('default_language', 'en')

        out_path = os.path.join(OUTPUT_DIR, f'{vid}.mp3')
        if os.path.exists(out_path):
            print(f'  [SKIP] {name} (already exists)')
            skipped += 1
            continue

        if generate_preview(vid, name, lang):
            success += 1
        else:
            failed += 1

        # Small delay between generations to avoid overloading
        time.sleep(1)

    print(f'\n[DONE] Success: {success} | Failed: {failed} | Skipped: {skipped} | Total: {len(voices)}')


if __name__ == '__main__':
    main()
