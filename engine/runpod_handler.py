import sys
import os
import base64
import traceback

print("[RunPod:DEBUG] === runpod_handler.py loaded ===", flush=True)
print(f"[RunPod:DEBUG] Python: {sys.version}", flush=True)
print(f"[RunPod:DEBUG] __name__: {__name__}", flush=True)
print(f"[RunPod:DEBUG] cwd: {os.getcwd()}", flush=True)
print(f"[RunPod:DEBUG] PYTHONPATH: {os.environ.get('PYTHONPATH', 'NOT SET')}", flush=True)

print("[RunPod:DEBUG] Importing runpod...", flush=True)
try:
    import runpod
    print(f"[RunPod:DEBUG] runpod imported OK, version: {getattr(runpod, '__version__', 'unknown')}", flush=True)
except Exception as e:
    print(f"[RunPod:FATAL] Failed to import runpod: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)

# Lazy globals — initialized on first request, not at import time
# DO NOT import engine.* at module level — engine/__init__.py pulls in
# torch, transformers, MMS, OpenVoice etc. which blocks startup and
# causes RunPod to kill the worker before it registers as healthy.
pipeline = None
router = None

def get_engine():
    global pipeline, router
    if pipeline is None:
        try:
            print("[RunPod:DEBUG] get_engine() called — first init", flush=True)

            print("[RunPod:DEBUG] Importing engine.pipeline.VoxarPipeline...", flush=True)
            from engine.pipeline import VoxarPipeline

            print("[RunPod:DEBUG] Importing engine.engine_router.EngineRouter...", flush=True)
            from engine.engine_router import EngineRouter

            print("[RunPod:DEBUG] Creating VoxarPipeline()...", flush=True)
            pipeline = VoxarPipeline()

            print("[RunPod:DEBUG] Creating EngineRouter()...", flush=True)
            router = EngineRouter()

            print("[RunPod:DEBUG] Engine initialized and ready.", flush=True)
        except Exception as e:
            print(f"[RunPod:FATAL] get_engine() crashed: {e}", flush=True)
            traceback.print_exc()
            raise
    return pipeline, router

def handle_tts(parameters):
    """Handle Text-to-Speech generation"""
    pipeline, router = get_engine()
    text = parameters.get("text")
    voice_id = parameters.get("voice", "v011")
    engine_mode = parameters.get("engine", "cinematic")
    language = parameters.get("language", "en")
    output_format = parameters.get("format", "mp3")

    # Run the pipeline
    result = pipeline.process(
        text=text,
        voice_id=voice_id,
        engine_mode=engine_mode,
        language=language,
        output_format=output_format,
        enhance=parameters.get("enhance", False),
        normalize=parameters.get("normalize", True)
    )

    # Read the generated audio file into base64
    audio_path = result.get("audio_path")
    if not audio_path or not os.path.exists(audio_path):
        raise Exception("Audio generation failed, no output file produced.")

    with open(audio_path, "rb") as audio_file:
        encoded_string = base64.b64encode(audio_file.read()).decode('utf-8')

    # Clean up the local file after reading since R2 will store it permanently
    try:
        os.remove(audio_path)
    except:
        pass

    return {
        "audio_base64": encoded_string,
        "duration": result.get("duration", 0),
        "characters": len(text),
        "quality_score": result.get("quality_score", None)
    }

def handle_stt(parameters):
    """Handle Speech-to-Text transcription"""
    pipeline, router = get_engine()
    # For RunPod, the audio file is expected to be provided as base64 in the parameters
    # Alternatively it could be a URL that we download first.
    # To keep it simple, we assume base64 audio is sent.

    audio_b64 = parameters.get("audio_base64")
    if not audio_b64:
        raise ValueError("Missing audio_base64 for STT")

    language = parameters.get("language", "en")
    diarize = parameters.get("diarize", False)

    temp_path = "/tmp/stt_input.wav"
    with open(temp_path, "wb") as f:
        f.write(base64.b64decode(audio_b64))

    result = router.transcribe(
        file_path=temp_path,
        language=language,
        diarize=diarize
    )

    # Cleanup
    try:
        os.remove(temp_path)
    except:
        pass

    return result

def handle_clone(parameters):
    """Handle Voice Cloning"""
    pipeline, router = get_engine()
    audio_b64 = parameters.get("sample_base64")
    name = parameters.get("name")

    if not audio_b64 or not name:
        raise ValueError("Missing sample_base64 or name for cloning")

    temp_path = f"/tmp/clone_{name}.wav"
    with open(temp_path, "wb") as f:
        f.write(base64.b64decode(audio_b64))

    result = router.clone_voice(
        name=name,
        sample_path=temp_path,
        language=parameters.get("language", "en")
    )

    try:
        os.remove(temp_path)
    except:
        pass

    # The result contains embeddings/paths. We might need to encode generated preview audio
    if result.get("preview_path") and os.path.exists(result["preview_path"]):
        with open(result["preview_path"], "rb") as f:
            result["preview_base64"] = base64.b64encode(f.read()).decode('utf-8')

    return result


def handler(job):
    """RunPod Serverless Handler"""
    print(f"[RunPod:DEBUG] handler() called, job id: {job.get('id', 'unknown')}", flush=True)
    job_input = job.get("input", {})
    job_type = job_input.get("type")
    parameters = job_input.get("parameters", {})
    print(f"[RunPod:DEBUG] job_type: {job_type}", flush=True)

    try:
        if job_type == "tts":
            return handle_tts(parameters)
        elif job_type == "stt":
            return handle_stt(parameters)
        elif job_type == "clone":
            return handle_clone(parameters)
        else:
            return {"error": f"Unknown job type: {job_type}"}

    except Exception as e:
        print(f"[RunPod:ERROR] handler() exception: {e}", flush=True)
        traceback.print_exc()
        return {"error": str(e)}

# Start the RunPod serverless worker — NO __main__ guard.
# RunPod may import this module instead of running it as a script,
# in which case __name__ != "__main__" and the worker never starts.
print("[RunPod:DEBUG] About to call runpod.serverless.start()...", flush=True)
try:
    runpod.serverless.start({"handler": handler})
except Exception as e:
    print(f"[RunPod:FATAL] runpod.serverless.start() crashed: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)
