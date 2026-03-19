const path = require('path')
const fs = require('fs')
const History = require('../models/History')
const creditService = require('../services/creditService')
const engineBridge = require('../services/engineBridge')

async function transcribeSync(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' })
    }

    const language = req.body.language || 'auto'
    const diarize = req.body.diarize === 'true'
    const wordTimestamps = req.body.word_timestamps === 'true'

    // Check billing cycle reset
    await creditService.checkAndResetCycle(req.user)

    // We don't know duration yet — estimate from file size (rough: 1 MB ~ 1 min for compressed audio)
    const fileSizeMB = req.file.size / (1024 * 1024)
    const estimatedMinutes = Math.max(0.1, fileSizeMB) // at least 0.1 min

    // Pre-check credits (non-atomic, just to fail fast for obviously over-limit requests)
    const check = creditService.canTranscribe(req.user, estimatedMinutes)
    if (!check.allowed) {
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {})
      return res.status(403).json({ message: check.message, code: 'INSUFFICIENT_CREDITS' })
    }

    // Forward to Python engine
    let result
    try {
      result = await engineBridge.transcribe({
        file_path: req.file.path,
        language,
        diarize,
        word_timestamps: wordTimestamps,
      })
    } catch (err) {
      fs.unlink(req.file.path, () => {})
      const errorMsg = String(err.response?.data?.message || err.response?.data?.detail || err.message || 'Unknown engine error')
      await History.create({
        user: req.user._id,
        type: 'stt',
        language,
        status: 'failed',
        error: errorMsg,
      })
      return res.status(502).json({
        message: 'Transcription failed',
        detail: errorMsg,
      })
    }

    // Use actual duration from result for credit deduction
    const actualMinutes = (result.duration || estimatedMinutes * 60) / 60
    const deductResult = await creditService.atomicDeductSTT(req.user._id, req.user.plan, actualMinutes)
    if (!deductResult.success) {
      fs.unlink(req.file.path, () => {})
      return res.status(403).json({ message: deductResult.message, code: 'INSUFFICIENT_CREDITS' })
    }

    // Record in history
    await History.create({
      user: req.user._id,
      type: 'stt',
      text: result.text || '',
      language: result.language || language,
      duration: actualMinutes,
      status: 'completed',
    })

    // Clean up uploaded file
    fs.unlink(req.file.path, () => {})

    res.json(result)
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {})
    res.status(500).json({ message: 'Transcription failed', detail: err.message })
  }
}

module.exports = { transcribeSync }
