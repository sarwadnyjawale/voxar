const History = require('../models/History')

async function getHistory(req, res) {
  try {
    const { type, page = 1, limit = 50 } = req.query
    const filter = { user: req.user._id }
    if (type && ['tts', 'stt', 'clone'].includes(type)) {
      filter.type = type
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [records, total] = await Promise.all([
      History.find(filter).sort({ created_at: -1 }).skip(skip).limit(parseInt(limit)),
      History.countDocuments(filter),
    ])

    // Get counts by type
    const [ttsCount, sttCount, cloneCount] = await Promise.all([
      History.countDocuments({ user: req.user._id, type: 'tts' }),
      History.countDocuments({ user: req.user._id, type: 'stt' }),
      History.countDocuments({ user: req.user._id, type: 'clone' }),
    ])

    res.json({
      records,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      counts: { all: total, tts: ttsCount, stt: sttCount, clone: cloneCount },
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', detail: err.message })
  }
}

async function getHistoryItem(req, res) {
  try {
    const record = await History.findOne({ _id: req.params.id, user: req.user._id })
    if (!record) return res.status(404).json({ message: 'Record not found' })
    res.json(record)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch record', detail: err.message })
  }
}

async function deleteHistoryItem(req, res) {
  try {
    const record = await History.findOne({ _id: req.params.id, user: req.user._id })
    if (!record) return res.status(404).json({ message: 'Record not found' })
    await record.deleteOne()
    res.json({ message: 'Record deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', detail: err.message })
  }
}

module.exports = { getHistory, getHistoryItem, deleteHistoryItem }
