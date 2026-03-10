import os
print("[Setup] Pre-downloading VOXAR AI models...")

try:
    from TTS.api import TTS
except ImportError:
    print("[Setup] TTS not installed, skipping XTTS download. Ensure requirements.txt is installed first.")
    TTS = None

try:
    from faster_whisper import WhisperModel
except ImportError:
    print("[Setup] faster-whisper not installed, skipping Whisper download.")
    WhisperModel = None

# Pre-download XTTS v2 model (~1.8GB)
if TTS:
    print("[Setup] Downloading XTTS v2...")
    try:
        # Initializing the TTS object automatically downloads the model if it's not cached
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
        print("[Setup] XTTS v2 successfully downloaded.")
    except Exception as e:
        print(f"[Setup] Error downloading XTTS: {e}")

# Pre-download Whisper large-v3 (~1.5GB)
if WhisperModel:
    print("[Setup] Downloading Whisper large-v3...")
    try:
        model = WhisperModel("large-v3", device="cpu", compute_type="int8")
        print("[Setup] Whisper large-v3 successfully downloaded.")
    except Exception as e:
        print(f"[Setup] Error downloading Whisper: {e}")

print("[Setup] Model pre-download complete!")
