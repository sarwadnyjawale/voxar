const History = require('../models/History')
const creditService = require('../services/creditService')
const engineBridge = require('../services/engineBridge')

async function generate(req, res) {
  try {
    const { text, voice, engine, language, format, enhance, normalize } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text is required' })
    }

    // Hard cap: 50,000 chars (~67 minutes). Prevents abuse regardless of plan.
    if (text.length > 50000) {
      return res.status(400).json({ message: 'Text exceeds maximum length of 50,000 characters.' })
    }

    // Check billing cycle reset
    await creditService.checkAndResetCycle(req.user)

    // Check credits
    const charCount = text.trim().length
    const check = creditService.canGenerateTTS(req.user, charCount)
    if (!check.allowed) {
      return res.status(403).json({ message: check.message, code: 'INSUFFICIENT_CREDITS' })
    }

    // Call Python engine
    let result
    try {
      result = await engineBridge.generateTTS({
        text: text.trim(),
        voice: voice || 'arjun',
        engine: engine || 'cinematic',
        language: language || 'en',
        format: format || 'wav',
        enhance,
        normalize,
      })
    } catch (err) {
      // Record failed attempt in history (no credit deduction)
      const errorMsg = String(err.response?.data?.message || err.response?.data?.detail || err.message || 'Unknown engine error')
      await History.create({
        user: req.user._id,
        type: 'tts',
        text: text.trim(),
        voice,
        engine,
        language,
        characters: charCount,
        format,
        status: 'failed',
        error: errorMsg,
      })
      return res.status(502).json({
        message: 'Engine generation failed',
        detail: errorMsg,
      })
    }

    // Deduct credits
    const minutesUsed = await creditService.deductTTS(req.user._id, charCount)

    // Record in history
    const record = await History.create({
      user: req.user._id,
      type: 'tts',
      text: text.trim(),
      voice,
      engine,
      language,
      characters: charCount,
      duration: result.duration || 0,
      audio_url: result.audio_url || result.audio_path || '',
      format: format || 'wav',
      status: 'completed',
    })

    res.json({
      id: record._id,
      audio_url: result.audio_url || result.audio_path || '',
      duration: result.duration || 0,
      characters: charCount,
      minutes_used: minutesUsed,
      format: format || 'wav',
    })
  } catch (err) {
    res.status(500).json({ message: 'TTS generation failed', detail: err.message })
  }
}

module.exports = { generate }
