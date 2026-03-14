import os
import json
import base64
import runpod
from engine.pipeline import VoxarPipeline
from engine.engine_router import EngineRouter
from pydantic import BaseModel

# Initialize VOXAR AI engine components globally so they stay warm between requests
print("[RunPod] Initializing VOXAR Engine...")
pipeline = VoxarPipeline()
router = EngineRouter()
print("[RunPod] Engine initialized and ready.")

def handle_tts(parameters):
    """Handle Text-to-Speech generation"""
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
    job_input = job.get("input", {})
    job_type = job_input.get("type")
    parameters = job_input.get("parameters", {})
    
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
        print(f"[RunPod Error]: {str(e)}")
        return {"error": str(e)}

# Start the RunPod serverless worker
if __name__ == "__main__":
    print("[RunPod] Starting worker...")
    runpod.serverless.start({"handler": handler})
