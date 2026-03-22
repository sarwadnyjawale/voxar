const axios = require('axios')

const PYTHON_ENGINE_URL = (process.env.PYTHON_ENGINE_URL || 'http://localhost:8000').replace(/\/+$/, '')
const ENGINE_API_KEY = process.env.ENGINE_API_KEY || 'voxar-dev-key-001'

/**
 * Bridge to the Python FastAPI engine server.
 * All AI workloads (TTS, STT, voice cloning) run on the Python side.
 *
 * Endpoint mapping (Node.js backend -> Python FastAPI):
 *   POST /api/v1/generate         — TTS generation (async, returns job_id)
 *   POST /api/v1/transcribe       — STT transcription
 *   POST /api/v1/voices/clone     — Voice cloning
 *   GET  /api/v1/voices           — Voice catalog
 *   GET  /api/v1/health           — Health check
 *   GET  /api/v1/jobs/:id         — Poll job status
 */

function logEngine(method, path, status) {
  console.log(`[EngineBridge] ${method} ${path} -> ${status}`)
}

/** Common headers for all engine requests */
function engineHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': ENGINE_API_KEY,
  }
}

/**
 * Poll a job until it completes or fails.
 * Returns the completed job data.
 */
async function pollJob(jobId, maxWaitMs = 240000, intervalMs = 4000) {
  const endpoint = `${PYTHON_ENGINE_URL}/api/v1/jobs/${jobId}`
  const start = Date.now()

  while (Date.now() - start < maxWaitMs) {
    const res = await axios.get(endpoint, {
      headers: engineHeaders(),
      timeout: 60000,
    })
    const data = res.data

    if (data.status === 'completed') {
      return data
    }
    if (data.status === 'failed') {
      throw new Error(data.error || 'Engine job failed')
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('Engine job timed out')
}

const engineBridge = {
  /**
   * Generate TTS audio via the Python engine.
   * Submits an async job, polls until completion, returns result.
   */
  async generateTTS({ text, voice, engine, language, format, enhance, normalize }) {
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/generate`
    try {
      // Submit the job
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
      })

      logEngine('POST', '/api/v1/generate', `submitted: ${res.data.job_id}`)

      // Poll for completion
      const result = await pollJob(res.data.job_id)
      logEngine('POLL', `/api/v1/jobs/${res.data.job_id}`, 'completed')

      return {
        audio_url: result.audio_url || result.audio_path || '',
        duration: result.duration || 0,
        job_id: result.job_id,
      }
    } catch (err) {
      logEngine('POST', '/api/v1/generate', `failed: ${err.message}`)
      throw err
    }
  },

  /**
   * Transcribe audio via the Python engine (Whisper)
   */
  async transcribe({ file_path, language, diarize, word_timestamps }) {
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/transcribe`
    try {
      const res = await axios.post(endpoint, {
        file_path,
        language: language || 'auto',
        diarize: diarize || false,
        word_timestamps: word_timestamps || false,
      }, {
        headers: engineHeaders(),
        timeout: 300000,
      })

      logEngine('POST', '/api/v1/transcribe', 'success')
      return res.data
    } catch (err) {
      logEngine('POST', '/api/v1/transcribe', `failed: ${err.message}`)
      throw err
    }
  },

  /**
   * Clone a voice via the Python engine
   */
  async cloneVoice({ name, sample_path, language }) {
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/voices/clone`
    try {
      const res = await axios.post(endpoint, {
        name,
        sample_path,
        language: language || 'en',
      }, {
        headers: engineHeaders(),
        timeout: 120000,
      })

      logEngine('POST', '/api/v1/voices/clone', 'success')
      return res.data
    } catch (err) {
      logEngine('POST', '/api/v1/voices/clone', `failed: ${err.message}`)
      throw err
    }
  },

  /**
   * Get available voices from the Python catalog
   */
  async getVoiceCatalog() {
    if (this._catalogCache && Date.now() - this._catalogCacheTime < 5 * 60 * 1000) {
      // Return cached catalog if younger than 5 minutes
      return this._catalogCache
    }

    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/voices`
    try {
      const res = await axios.get(endpoint, {
        headers: engineHeaders(),
        timeout: 10000,
      })
      logEngine('GET', '/api/v1/voices', 'success')
      
      // Update cache
      this._catalogCache = res.data
      this._catalogCacheTime = Date.now()
      
      return res.data
    } catch (err) {
      logEngine('GET', '/api/v1/voices', `failed: ${err.message}`)
      throw err
    }
  },

  /**
   * Get job status from the Python engine
   */
  async getJobStatus(jobId) {
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/jobs/${jobId}`
    const res = await axios.get(endpoint, {
      headers: engineHeaders(),
      timeout: 10000,
    })
    logEngine('GET', `/api/v1/jobs/${jobId}`, res.data.status || 'ok')
    return res.data
  },

  /**
   * Stream job audio from the Python engine.
   * Pipes the binary response directly to the Express response object.
   */
  async streamJobAudio(jobId, expressRes) {
    const endpoint = `${PYTHON_ENGINE_URL}/api/v1/jobs/${jobId}/audio`
    const res = await axios.get(endpoint, {
      headers: { 'X-API-Key': ENGINE_API_KEY },
      responseType: 'stream',
      timeout: 60000,
    })
    logEngine('GET', `/api/v1/jobs/${jobId}/audio`, 'streaming')

    // Forward content headers from engine
    if (res.headers['content-type']) expressRes.set('Content-Type', res.headers['content-type'])
    if (res.headers['content-length']) expressRes.set('Content-Length', res.headers['content-length'])
    if (res.headers['content-disposition']) expressRes.set('Content-Disposition', res.headers['content-disposition'])

    res.data.pipe(expressRes)
  },

  /**
   * Health check for the Python engine
   */
  async healthCheck() {
    try {
      const res = await axios.get(`${PYTHON_ENGINE_URL}/api/v1/health`, {
        headers: engineHeaders(),
        timeout: 5000,
      })
      return { status: 'ok', engine: res.data }
    } catch (err) {
      return { status: 'unavailable', error: err.message }
    }
  },
}

module.exports = engineBridge
