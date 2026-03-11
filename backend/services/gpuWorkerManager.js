const axios = require('axios');
const jobQueue = require('./jobQueue');
const r2Storage = require('./r2Storage');

/**
 * GPU Worker Manager
 * Orchestrates job submission to RunPod Serverless GPU instances, polls for status,
 * downloads and decodes base64 results, uploads to R2, and updates the Redis queue.
 */

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY || 'YOUR_RUNPOD_API_KEY_HERE';
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID || 'YOUR_RUNPOD_ENDPOINT_ID_HERE';
const RUNPOD_BASE_URL = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}`;
const MAX_RUNPOD_WORKERS = 3;

// Headers for RunPod API authentication
const runpodHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${RUNPOD_API_KEY}`
};

/**
 * Process pending jobs from the queue asynchronously.
 * This runs continuously to pull jobs from Redis and submit them.
 */
async function startWorkerManager() {
  console.log('[GPU Worker Manager] Started queue processing loop...');
  
  // A simple continuous loop that checks for jobs
  while (true) {
    try {
      const job = await jobQueue.dequeue();
      if (job) {
        // Enforce max workers by checking currently active processing jobs
        const activeWorkersCount = await getActiveWorkerCount();
        
        if (activeWorkersCount >= MAX_RUNPOD_WORKERS) {
          console.warn(`[GPU Worker] Throttling: Max RunPod workers (${MAX_RUNPOD_WORKERS}) reached. Queuing job ${job.id} back.`);
          // Push job back into the queue from the left (front)
          await jobQueue.redisClient.lpush('voxar:jobs:queue', job.id);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        console.log(`[GPU Worker] Picked up job ${job.id} (${job.payload.type})`);
        
        // Execute the job via RunPod but don't await blockingly so we can process multiple jobs
        // (If strict sequencing is desired or if runpod has concurrency limits, we might await this)
        processJob(job).catch(err => {
          console.error(`[GPU Worker] Uncaught error processing job ${job.id}:`, err.message);
        });
      } else {
        // Queue is empty, wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error('[GPU Worker] Queue processing error:', err.message);
      // Wait before retrying on general errors
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Retrieves the count of currently processing jobs to limit RunPod workers
 */
async function getActiveWorkerCount() {
  const scanStream = jobQueue.redisClient.scanStream({
    match: 'voxar:job:*',
    count: 100
  });

  let activeCount = 0;
  for await (const keys of scanStream) {
    if (!keys.length) continue;
    const pipeline = jobQueue.redisClient.pipeline();
    keys.forEach(key => pipeline.hget(key, 'status'));
    const results = await pipeline.exec();
    
    results.forEach(([err, status]) => {
      if (!err && status === 'processing') {
        activeCount++;
      }
    });
  }
  return activeCount;
}

/**
 * Submits the job to RunPod Serverless, polls until complete,
 * uploads audio to R2, and updates the Redis job queue state.
 * @param {Object} job - The job record from Redis
 */
async function processJob(job) {
  try {
    const payload = job.payload;
    
    // 1. Submit to RunPod
    const runpodResponse = await axios.post(`${RUNPOD_BASE_URL}/run`, {
      input: {
        type: payload.type,
        parameters: payload
      }
    }, { headers: runpodHeaders });
    
    const runpodJobId = runpodResponse.data.id;
    console.log(`[GPU Worker] Submitted job ${job.id} to RunPod (RunPodID: ${runpodJobId})`);
    
    await jobQueue.updateJob(job.id, { runpod_id: runpodJobId, status: 'processing' });
    
    // 2. Poll RunPod until complete
    const result = await pollRunpodStatus(runpodJobId);
    
    // 3. Result returned audio as base64. Decode it and upload to R2
    if (!result.audio_base64) {
      throw new Error('Worker returned success but no audio data was found.');
    }
    
    const audioBuffer = Buffer.from(result.audio_base64, 'base64');
    
    // Format timestamp and generate a unique R2 filename
    const ext = payload.format === 'wav' ? 'wav' : 'mp3';
    const filename = `generated/${payload.type}_${job.id}_${Date.now()}.${ext}`;
    const contentType = ext === 'wav' ? 'audio/wav' : 'audio/mpeg';
    
    // 4. Upload to Cloudflare R2 storage
    const audioUrl = await r2Storage.uploadAudio(audioBuffer, filename, contentType);
    console.log(`[GPU Worker] Job ${job.id} successful. Audio URL: ${audioUrl}`);
    
    // 5. Build final result and update queue
    const finalResult = {
      job_id: job.id,
      audio_url: audioUrl,
      duration: result.duration || 0,
      characters: result.characters || payload.text?.length || 0,
      quality_score: result.quality_score || null,
      file_path: filename // Provide the raw path for future possible deletion requests
    };
    
    await jobQueue.updateJob(job.id, {
      status: 'completed',
      result: JSON.stringify(finalResult)
    });
    
  } catch (err) {
    console.error(`[GPU Worker] Job ${job.id} failed:`, err.message);
    const errorMsg = err.response?.data?.error || err.message || 'Unknown processing error';
    await jobQueue.updateJob(job.id, {
      status: 'failed',
      error: errorMsg
    });
  }
}

/**
 * Poll RunPod to check the job status
 * Returns the final execution output payload when completed
 */
async function pollRunpodStatus(runpodJobId, maxWaitMs = 300000) { // 5 minute max timeout
  const start = Date.now();
  const pollIntervalMs = 3000; // Poll every 3 seconds
  
  while (Date.now() - start < maxWaitMs) {
    try {
      // Use the /status/ endpoint
      const res = await axios.get(`${RUNPOD_BASE_URL}/status/${runpodJobId}`, { 
        headers: runpodHeaders,
        timeout: 10000
      });
      
      const runpodStatus = res.data.status;
      
      if (runpodStatus === 'COMPLETED') {
        return res.data.output;
      }
      
      if (runpodStatus === 'FAILED') {
        throw new Error(res.data.error || 'RunPod execution failed completely.');
      }
      
      // IN_QUEUE or IN_PROGRESS - wait and check again
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (err) {
      // If error is 4xx, it's likely a bad auth or bad endpoint, fast throw
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        throw new Error(`RunPod API Error: ${err.response.data?.error || err.message}`);
      }
      // If network error 5xx, wait and try again
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }
  
  throw new Error('RunPod job timed out after 5 minutes.');
}

/**
 * Check if the RunPod endpoint is active
 */
async function getWorkerStatus() {
  try {
    const res = await axios.get(`${RUNPOD_BASE_URL}/health`, { 
      headers: runpodHeaders,
      timeout: 5000 
    });
    return {
      status: 'ok',
      workers: res.data.workers || null,
      endpointId: RUNPOD_ENDPOINT_ID
    };
  } catch (err) {
    return {
      status: 'unavailable',
      error: err.message
    };
  }
}

// Start the continuous queue processor when required
// This doesn't block the main thread.
if (process.env.VOXAR_ENGINE_MODE === 'runpod') {
  // Slight delay to ensure job queue connected to redis first
  setTimeout(() => {
    startWorkerManager();
  }, 3000);
}

module.exports = {
  startWorkerManager,
  getWorkerStatus
};
