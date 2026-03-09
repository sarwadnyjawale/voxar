const { v4: uuidv4 } = require('uuid')
const creditService = require('../services/creditService')

async function getUsage(req, res) {
  try {
    await creditService.checkAndResetCycle(req.user)
    const summary = creditService.getUsageSummary(req.user)
    res.json(summary)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch usage', detail: err.message })
  }
}

async function createApiKey(req, res) {
  try {
    const limits = req.user.getPlanLimits()
    if (!limits.api_access) {
      return res.status(403).json({ message: 'API access requires Pro plan or higher' })
    }

    const { label } = req.body
    const key = `vxr_${uuidv4().replace(/-/g, '')}`

    req.user.api_keys.push({
      key,
      label: label || 'Default',
      created_at: new Date(),
    })
    await req.user.save()

    // Return full key only on creation — after this it's masked
    res.status(201).json({
      key,
      label: label || 'Default',
      message: 'Save this key — it will only be shown once.',
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create API key', detail: err.message })
  }
}

async function deleteApiKey(req, res) {
  try {
    const keyId = req.params.keyId
    req.user.api_keys = req.user.api_keys.filter(k => k._id.toString() !== keyId)
    await req.user.save()
    res.json({ message: 'API key deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete API key', detail: err.message })
  }
}

module.exports = { getUsage, createApiKey, deleteApiKey }
