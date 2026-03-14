const axios = require('axios');
const jobQueue = require('./jobQueue');
const gpuWorkerManager = require('./gpuWorkerManager');
const r2Storage = require('./r2Storage');

const PYTHON_ENGINE_URL =
  process.env.PYTHON_ENGINE_URL ||
  'https://n9mkz413dkbp0l-8000.proxy.runpod.net';
const ENGINE_API_KEY = process.env.ENGINE_API_KEY || 'voxar-dev-key-001';
const ENGINE_MODE = process.env.VOXAR_ENGINE_MODE || 'runpod'; // 'local' or 'runpod'

/**
 * Bridge to the Python FastAPI engine server or RunPod Serverless GPU.
 * Dual mode architecture:
 * - 'local': Hits localhost FastAPI directly (dev/legacy mode)
 * - 'runpod': Queues job in Redis, processed by RunPod serverless
 */

function logEngine(method, path, status, mode = ENGINE_MODE) {
  console.log(`[EngineBridge][${mode}] ${method} ${path} -> ${status}`);
}

/** Common headers for local engine requests */
function engineHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': ENGINE_API_KEY,
  };
}

/**
 * Poll a local job until it completes or fails.
 */
async function pollLocalJob(jobId, maxWaitMs = 120000, intervalMs = 2000) {
  const endpoint = `${PYTHON_ENGINE_URL}/api/v1/jobs/${jobId}`;
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const res = await axios.get(endpoint, {
      headers: engineHeaders(),
      timeout: 10000,
    });
    const data = res.data;

    if (data.status === 'completed') {
      return data;
    }
    if (data.status === 'failed') {
      throw new Error(data.error || 'Engine job failed');
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  throw new Error('Local engine job timed out');
}

/**
 * Poll a redis queued job (RunPod mode)
 */
async function pollRedisJob(jobId, maxWaitMs = 300000, intervalMs = 2000) {
  const start = Date.now();
  
  while (Date.now() - start < maxWaitMs) {
    const job = await jobQueue.getJob(jobId);
    if (!job) {
      throw new Error('Job not found in queue');
    }
    
    if (job.status === 'completed') {
      return JSON.parse(job.result);
    }
    if (job.status === 'failed') {
      throw new Error(job.error || 'Job failed in runner');
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  throw new Error('RunPod job timed out in queue');
}


const engineBridge = {
  /**
   * Generate TTS audio.
   * runpod mode: queues it -> runpod handles it -> uploads to R2.
   * local mode: proxy to local python.
   */
  async generateTTS({ text, voice, engine, language, format, enhance, normalize }) {
    if (ENGINE_MODE === 'runpod') {
      try {
        logEngine('QUEUE', '/api/v1/generate', 'submitting');
        const jobId = await jobQueue.enqueue({
          type: 'tts',
          text,
          voice,
          engine,
          language,
          format,
          enhance,
          normalize
        });
        
        logEngine('POLL_REDIS', `/jobs/${jobId}`, 'waiting');
        const result = await pollRedisJob(jobId);
        
        return {
          audio_url: result.audio_url || '',
          duration: result.duration || 0,
          job_id: result.job_id
        };
      } catch (err) {
        logEngine('QUEUE', '/api/v1/generate', `failed: ${err.message}`);
        throw err;
      }
    }

    // Local execution fallback
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/generate`;
    try {
      const res = await axios.post(endpoint, {
        text,
        voice_id: voice,
        engine_mode: engine || 'cinematic',
        language: language || 'en',
        output_format: format || 'wav',
        enhance: enhance !== false,
        normalize: normalize !== false,
      }, {
        headers: engineHeaders(),
        timeout: 30000,
      });

      logEngine('POST', '/api/v1/generate', `submitted: ${res.data.job_id}`);
      const result = await pollLocalJob(res.data.job_id);
      logEngine('POLL', `/api/v1/jobs/${res.data.job_id}`, 'completed');

      return {
        audio_url: result.audio_url || result.audio_path || '',
        duration: result.duration || 0,
        job_id: result.job_id,
      };
    } catch (err) {
      logEngine('POST', '/api/v1/generate', `failed: ${err.message}`);
      throw err;
    }
  },

  /**
   * Transcribe audio (Whisper)
   */
  async transcribe({ file_path, language, diarize, word_timestamps }) {
    if (ENGINE_MODE === 'runpod') {
        const jobId = await jobQueue.enqueue({
          type: 'stt',
          file_path,
          language,
          diarize,
          word_timestamps
        });
        // Polling logic is handled inside STT runner which assumes audio is passed
        // Note: For RunPod STT, you must upload the audio somewhere accessible to RunPod first.
        return await pollRedisJob(jobId);
    }
    
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/transcribe`;
    try {
      const res = await axios.post(endpoint, {
        file_path,
        language: language || 'auto',
        diarize: diarize || false,
        word_timestamps: word_timestamps || false,
      }, {
        headers: engineHeaders(),
        timeout: 300000,
      });
      logEngine('POST', '/api/v1/transcribe', 'success');
      return res.data;
    } catch (err) {
      logEngine('POST', '/api/v1/transcribe', `failed: ${err.message}`);
      throw err;
    }
  },

  /**
   * Clone a voice
   */
  async cloneVoice({ name, sample_path, language }) {
    if (ENGINE_MODE === 'runpod') {
      const jobId = await jobQueue.enqueue({
          type: 'clone',
          name,
          sample_path,
          language
      });
      return await pollRedisJob(jobId);
    }
    
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/voices/clone`;
    try {
      const res = await axios.post(endpoint, {
        name,
        sample_path,
        language: language || 'en',
      }, {
        headers: engineHeaders(),
        timeout: 120000,
      });
      logEngine('POST', '/api/v1/voices/clone', 'success');
      return res.data;
    } catch (err) {
      logEngine('POST', '/api/v1/voices/clone', `failed: ${err.message}`);
      throw err;
    }
  },

  /**
   * Get available voices.
   * Typically static, so we don't route through RunPod.
   * In a real deployment this is often fetched from local backend DB instead of GPU node.
   * For now, local mode queries python, runpod mode should probably use a static list
   * if python is unavailable. For safety we just try local.
   */
  async getVoiceCatalog() {
    // Optimization: in true serverless we would NOT wake up RunPod just to list voices.
    // Voices list should be served directly from the Node backend or DB.
    // For now, we will attempt local Python if it's there.
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/voices`;
    try {
      const res = await axios.get(endpoint, {
        headers: engineHeaders(),
        timeout: 10000,
      });
      return res.data;
    } catch (err) {
       // fallback list or db query goes here...
      throw err;
    }
  },

  /**
   * Health check
   */
  async healthCheck() {
    if (ENGINE_MODE === 'runpod') {
      const runpodStatus = await gpuWorkerManager.getWorkerStatus();
      const queueSize = await jobQueue.getQueueSize();
      return { 
        status: runpodStatus.status, 
        mode: 'runpod', 
        queue_size: queueSize,
        runpod: runpodStatus 
      };
    }
    
    try {
      const res = await axios.get(`${PYTHON_ENGINE_URL}/api/v1/health`, {
        headers: engineHeaders(),
        timeout: 5000,
      });
      return { status: 'ok', mode: 'local', engine: res.data };
    } catch (err) {
      return { status: 'unavailable', mode: 'local', error: err.message };
    }
  },
};

module.exports = engineBridge;
