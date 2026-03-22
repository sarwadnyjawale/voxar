const express = require('express')
const router = express.Router()
const engineBridge = require('../services/engineBridge')

const { authMiddleware, optionalAuth } = require('../middleware/auth')

/**
 * GET /api/v1/jobs/:id
 * Proxy job status from engine (adds API key server-side)
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const data = await engineBridge.getJobStatus(req.params.id)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.json(data)
  } catch (err) {
    const status = err.response?.status || 502
    res.status(status).json({
      message: 'Failed to get job status',
      detail: err.response?.data?.detail || err.message,
    })
  }
})

/**
 * GET /api/v1/jobs/:id/audio
 * Proxy job audio from engine (streams binary, adds API key server-side)
 */
router.get('/:id/audio', optionalAuth, async (req, res) => {
  try {
    await engineBridge.streamJobAudio(req.params.id, res)
  } catch (err) {
    const status = err.response?.status || 502
    res.status(status).json({
      message: 'Failed to fetch audio',
      detail: err.response?.data?.detail || err.message,
    })
  }
})

module.exports = router
