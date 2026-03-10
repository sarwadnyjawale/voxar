const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

/**
 * Job Queue Service
 * Uses Redis (via ioredis) to manage a robust queue for TTS, STT, and voice cloning jobs.
 * This ensures that bursts of traffic don't overwhelm the backend or GPU worker,
 * and jobs aren't lost if the backend restarts.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize Redis client. If Redis is unavailable, it will retry connecting.
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('[Redis JobQueue] Error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis JobQueue] Connected completely');
});

const QUEUE_KEY = 'voxar:jobs:queue'; // List of pending job IDs
const JOB_HASH_PREFIX = 'voxar:job:'; // Hash map storing job details
const MAX_QUEUE_SIZE = 50;
const JOB_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Initialize queue and run any needed cleanup on startup
 */
async function initQueue() {
  try {
    // Optional: could implement stall job recovery here if needed
    console.log('[Redis JobQueue] Initialized correctly.');
  } catch (err) {
    console.error('[Redis JobQueue] Init error:', err.message);
  }
}

/**
 * Add a new job to the queue
 * @param {Object} jobData - The job payload (e.g. { type: 'tts', text: '...' })
 * @returns {String} The requested job ID
 */
async function enqueue(jobData) {
  const currentSize = await redis.llen(QUEUE_KEY);
  if (currentSize >= MAX_QUEUE_SIZE) {
    throw new Error('Service temporarily at capacity. The queue is full. Please try again later.');
  }

  const jobId = uuidv4();
  const jobKey = `${JOB_HASH_PREFIX}${jobId}`;
  
  const jobRecord = {
    id: jobId,
    status: 'queued',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payload: JSON.stringify(jobData),
  };

  // Use a pipeline to ensure atomicity
  const pipeline = redis.pipeline();
  pipeline.hset(jobKey, jobRecord);
  pipeline.expire(jobKey, JOB_EXPIRY_SECONDS); // Ensure it cleans up eventually
  pipeline.lpush(QUEUE_KEY, jobId);
  
  await pipeline.exec();
  
  console.log(`[JobQueue] Enqueued job ${jobId}`);
  return jobId;
}

/**
 * Retrieve a job and its current status by ID
 * @param {String} jobId 
 * @returns {Object|null}
 */
async function getJob(jobId) {
  const jobKey = `${JOB_HASH_PREFIX}${jobId}`;
  const job = await redis.hgetall(jobKey);
  
  if (!job || Object.keys(job).length === 0) {
    return null;
  }
  
  // Parse the stored JSON payload
  if (job.payload) {
    try {
      job.payload = JSON.parse(job.payload);
    } catch (e) {
      // ignore
    }
  }
  
  return job;
}

/**
 * Pop the next job from the queue (FIFO)
 * @returns {Object|null} The popped job, or null if empty
 */
async function dequeue() {
  // rpop removes from the right (FIFO approach since we lpush)
  const jobId = await redis.rpop(QUEUE_KEY);
  if (!jobId) return null;

  await updateJob(jobId, { status: 'processing' });
  
  const job = await getJob(jobId);
  return job;
}

/**
 * Update a job's status and records
 * @param {String} jobId 
 * @param {Object} updates - Fields to update (status, result, error, etc.)
 */
async function updateJob(jobId, updates) {
  const jobKey = `${JOB_HASH_PREFIX}${jobId}`;
  
  // Ensure the job exists
  const exists = await redis.exists(jobKey);
  if (!exists) return;

  const fields = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  await redis.hset(jobKey, fields);
  
  // If completed or failed, we might want to keep it available for a bit so the client can fetch it
  if (updates.status === 'completed' || updates.status === 'failed') {
    await redis.expire(jobKey, JOB_EXPIRY_SECONDS);
  }
}

/**
 * Get internal queue size
 */
async function getQueueSize() {
  return await redis.llen(QUEUE_KEY);
}

// Call init once
initQueue();

module.exports = {
  enqueue,
  dequeue,
  getJob,
  updateJob,
  getQueueSize,
  redisClient: redis
};
