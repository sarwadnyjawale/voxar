const express = require('express')
const multer = require('multer')
const path = require('path')
const { authMiddleware } = require('../middleware/auth')
const { transcribeSync } = require('../controllers/transcribeController')

const router = express.Router()

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'stt'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm', '.mp4', '.aac']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file format: ${ext}. Supported: ${allowed.join(', ')}`))
    }
  },
})

// POST /api/v1/transcribe/sync
router.post('/sync', authMiddleware, upload.single('file'), transcribeSync)

module.exports = router
