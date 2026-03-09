const mongoose = require('mongoose')

const voiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  sample_path: { type: String, required: true },
  embedding_path: { type: String, default: '' },
  status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
  language: { type: String, default: 'en' },
  quality_score: { type: Number, default: 0 },
  usage_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Voice', voiceSchema)
