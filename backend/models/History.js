const mongoose = require('mongoose')

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['tts', 'stt', 'clone'], required: true },

  // TTS fields
  text: { type: String, default: '' },
  voice: { type: String, default: '' },
  engine: { type: String, default: '' },
  language: { type: String, default: 'en' },

  // STT fields
  filename: { type: String, default: '' },
  transcription: { type: String, default: '' },
  speakers: { type: Number, default: 0 },

  // Clone fields
  clone_name: { type: String, default: '' },
  sample_path: { type: String, default: '' },

  // Common fields
  duration: { type: Number, default: 0 },
  characters: { type: Number, default: 0 },
  audio_url: { type: String, default: '' },
  format: { type: String, default: 'wav' },
  status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'completed' },
  error: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
})

historySchema.index({ user: 1, created_at: -1 })

module.exports = mongoose.model('History', historySchema)
