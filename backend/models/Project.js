const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  voice: { type: String, required: true },
  voice_avatar: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  audio_url: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: true })

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Untitled Project', trim: true },
  description: { type: String, default: '' },
  blocks: [blockSchema],
  engine: { type: String, default: 'cinematic' },
  format: { type: String, enum: ['mp3', 'wav', 'flac'], default: 'wav' },
  total_duration: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'processing', 'completed'], default: 'draft' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

projectSchema.pre('save', function (next) {
  this.updated_at = new Date()
  this.total_duration = this.blocks.reduce((sum, b) => sum + (b.duration || 0), 0)
  next()
})

module.exports = mongoose.model('Project', projectSchema)
