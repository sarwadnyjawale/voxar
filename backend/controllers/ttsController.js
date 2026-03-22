const History = require('../models/History')
const User = require('../models/User')
const creditService = require('../services/creditService')
const engineBridge = require('../services/engineBridge')

async function generate(req, res) {
  try {
    const { text, voice, engine, language, format, enhance, normalize } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text is required' })
    }

    if (text.length > 10000) {
      return res.status(400).json({ message: 'Text exceeds maximum length of 10,000 characters' })
    }

    const charCount = text.trim().length
    // FIX A3: Default to production mode (secure) unless explicitly set to development
    const isDev = process.env.NODE_ENV === 'development'
    let creditResult = { success: true, minutesUsed: 0 }

    if (!isDev) {
      // Check billing cycle reset
      await creditService.checkAndResetCycle(req.user)

      // Atomic credit check + deduction (prevents race conditions)
      creditResult = await creditService.atomicDeductTTS(req.user._id, req.user.plan, charCount)
      if (!creditResult.success) {
        return res.status(403).json({ message: creditResult.message, code: 'INSUFFICIENT_CREDITS' })
      }
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

      // FIX 4 & 5: If the frontend connection dropped (timeout), refund the credit to prevent loss.
      if (req.closed || req.destroyed || res.destroyed) {
        if (!isDev && creditResult.minutesUsed > 0) {
          await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'usage.tts_minutes_used': -creditResult.minutesUsed }
          })
        }
        // Don't save to history if we refunded due to timeout
        return
      }

    } catch (err) {
      // Refund credits on engine failure (only in production where credits were deducted)
      if (!isDev && creditResult.minutesUsed > 0) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { 'usage.tts_minutes_used': -creditResult.minutesUsed }
        })
      }
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
      minutes_used: creditResult.minutesUsed,
      format: format || 'wav',
    })
  } catch (err) {
    // If an unexpected error happens AFTER credit deduction, refund it
    if (typeof creditResult !== 'undefined' && creditResult.minutesUsed > 0) {
      const isDev = process.env.NODE_ENV === 'development'
      if (!isDev) {
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'usage.tts_minutes_used': -creditResult.minutesUsed }
          })
        } catch (refundErr) {
          console.error('[Refund Error]', refundErr)
        }
      }
    }
    res.status(500).json({ message: 'TTS generation failed', detail: err.message })
  }
}

module.exports = { generate }
