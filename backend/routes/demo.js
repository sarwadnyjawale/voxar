const express = require('express')
const router = express.Router()
const engineBridge = require('../services/engineBridge')
const rateLimit = require('express-rate-limit')

// Strict rate limit for unauthenticated demo route: 5 requests per 10 minutes
const demoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: 'Demo rate limit exceeded. Please sign up for more.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/generate', demoLimiter, async (req, res) => {
  try {
    const { text, voice_id, engine_mode, language, output_format } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' })
    }

    if (text.length > 250) {
      return res.status(400).json({ message: 'Demo text exceeds 250 characters limit' })
    }

    // Call Python engine directly via bridge (no credit logic needed for demo, rate limited by IP)
    const result = await engineBridge.generateTTS({
      text: text.trim(),
      voice: voice_id || 'v011',
      engine: engine_mode || 'flash',
      language: language || 'en',
      format: output_format || 'mp3',
      enhance: false,
      normalize: true,
    })

    res.json({
      job_id: result.job_id,
      audio_url: result.audio_url || result.audio_path || '',
      duration: result.duration || 0,
      status: 'queued', // Mimic engine behavior
    })
  } catch (err) {
    const status = err.response?.status || 502
    res.status(status).json({
      message: 'Demo generation failed',
      detail: err.response?.data?.detail || err.message,
    })
  }
})

module.exports = router
