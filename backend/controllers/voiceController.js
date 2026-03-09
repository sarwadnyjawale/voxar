const Voice = require('../models/Voice')
const History = require('../models/History')
const creditService = require('../services/creditService')
const engineBridge = require('../services/engineBridge')
const path = require('path')

/**
 * Get voice catalog (built-in voices from Python engine)
 */
async function getCatalog(req, res) {
  try {
    const catalog = await engineBridge.getVoiceCatalog()
    res.json(catalog)
  } catch (err) {
    // Return empty catalog if engine is offline
    res.json({ voices: [], message: 'Engine offline — showing cached catalog' })
  }
}

/**
 * Get user's cloned voices
 */
async function getMyVoices(req, res) {
  try {
    const voices = await Voice.find({ user: req.user._id }).sort({ created_at: -1 })
    res.json({ voices })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch voices', detail: err.message })
  }
}

/**
 * Upload and clone a voice
 */
async function cloneVoice(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Voice sample file is required' })
    }

    const { name, language } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Voice name is required' })
    }

    // Check clone credits
    const check = creditService.canClone(req.user)
    if (!check.allowed) {
      return res.status(403).json({ message: check.message, code: 'CLONE_LIMIT_REACHED' })
    }

    const samplePath = req.file.path

    // Create voice record (processing state)
    const voice = await Voice.create({
      user: req.user._id,
      name: name.trim(),
      sample_path: samplePath,
      language: language || 'en',
      status: 'processing',
    })

    // Call Python engine for cloning
    try {
      const result = await engineBridge.cloneVoice({
        name: name.trim(),
        sample_path: samplePath,
        language: language || 'en',
      })

      voice.status = 'ready'
      voice.embedding_path = result.embedding_path || ''
      voice.quality_score = result.quality_score || 0
      await voice.save()

      // Deduct clone credit
      await creditService.deductClone(req.user._id)

      // Record in history
      await History.create({
        user: req.user._id,
        type: 'clone',
        clone_name: name.trim(),
        sample_path: samplePath,
        status: 'completed',
      })
    } catch (err) {
      voice.status = 'failed'
      await voice.save()

      await History.create({
        user: req.user._id,
        type: 'clone',
        clone_name: name.trim(),
        sample_path: samplePath,
        status: 'failed',
        error: String(err.response?.data?.message || err.response?.data?.detail || err.message || 'Unknown error'),
      })

      return res.status(502).json({
        message: 'Voice cloning failed',
        detail: err.response?.data?.detail || err.message,
      })
    }

    res.status(201).json({ voice })
  } catch (err) {
    res.status(500).json({ message: 'Clone failed', detail: err.message })
  }
}

/**
 * Delete a cloned voice
 */
async function deleteVoice(req, res) {
  try {
    const voice = await Voice.findOne({ _id: req.params.id, user: req.user._id })
    if (!voice) {
      return res.status(404).json({ message: 'Voice not found' })
    }
    await voice.deleteOne()
    res.json({ message: 'Voice deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', detail: err.message })
  }
}

module.exports = { getCatalog, getMyVoices, cloneVoice, deleteVoice }
