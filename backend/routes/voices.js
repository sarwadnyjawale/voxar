const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { authMiddleware } = require('../middleware/auth')
const { getCatalog, getMyVoices, cloneVoice, deleteVoice } = require('../controllers/voiceController')

// Multer config for voice sample uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'voice_samples'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.wav', '.mp3', '.flac', '.ogg', '.m4a', '.webm']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported format: ${ext}. Use WAV, MP3, FLAC, OGG, M4A, or WebM.`))
    }
  },
})

router.get('/catalog', getCatalog)
router.get('/my', authMiddleware, getMyVoices)
router.post('/clone', authMiddleware, upload.single('sample'), cloneVoice)
router.delete('/:id', authMiddleware, deleteVoice)

module.exports = router
