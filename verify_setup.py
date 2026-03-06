"""
VOXAR Setup Verification Script
Run: python verify_setup.py
"""

import sys

print("=" * 60)
print("VOXAR - ENVIRONMENT VERIFICATION")
print("=" * 60)

# Check Python version
print(f"\n[1] Python Version: {sys.version}")
if sys.version_info[:2] != (3, 10):
    print("    ⚠️  WARNING: Python 3.10.x recommended")
else:
    print("    ✅ Python 3.10 — correct")

# Check PyTorch
print("\n[2] PyTorch:")
try:
    import torch
    print(f"    Version: {torch.__version__}")
    print(f"    CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"    GPU: {torch.cuda.get_device_name(0)}")
        vram = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"    VRAM: {vram:.1f} GB")
        print("    ✅ GPU ready")
    else:
        print("    ❌ CUDA not available — check installation")
except ImportError:
    print("    ❌ PyTorch not installed")

# Check TTS (Coqui)
print("\n[3] Coqui TTS:")
try:
    import TTS
    print(f"    Version: {TTS.__version__}")
    print("    ✅ TTS library ready")
except ImportError:
    print("    ❌ TTS not installed — run: pip install TTS")

# Check pydub
print("\n[4] Pydub:")
try:
    from pydub import AudioSegment
    print("    ✅ pydub ready")
except ImportError:
    print("    ❌ pydub not installed — run: pip install pydub")

# Check numpy
print("\n[5] NumPy:")
try:
    import numpy as np
    print(f"    Version: {np.__version__}")
    print("    ✅ numpy ready")
except ImportError:
    print("    ❌ numpy not installed")

# Check scipy
print("\n[6] SciPy:")
try:
    import scipy
    print(f"    Version: {scipy.__version__}")
    print("    ✅ scipy ready")
except ImportError:
    print("    ❌ scipy not installed — run: pip install scipy")

# Check noisereduce
print("\n[7] NoiseReduce:")
try:
    import noisereduce
    print("    ✅ noisereduce ready")
except ImportError:
    print("    ❌ noisereduce not installed — run: pip install noisereduce")

# Check FFmpeg
print("\n[8] FFmpeg:")
import os
if os.path.exists("ffmpeg.exe"):
    print("    ✅ ffmpeg.exe found in project folder")
else:
    print("    ⚠️  ffmpeg.exe not in project folder")
    print("    Checking system PATH...")
    result = os.system("ffmpeg -version > nul 2>&1")
    if result == 0:
        print("    ✅ ffmpeg found in system PATH")
    else:
        print("    ❌ ffmpeg not found — audio processing will fail")

# Check soundfile
print("\n[9] SoundFile:")
try:
    import soundfile
    print(f"    Version: {soundfile.__version__}")
    print("    ✅ soundfile ready")
except ImportError:
    print("    ⚠️  soundfile not installed — run: pip install soundfile")

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
print("\nIf all checks show ✅, you're ready for Phase 1!")
print("If any show ❌, install the missing package first.\n")