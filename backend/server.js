require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')

const jobQueue = require('./services/jobQueue')
const engineBridge = require('./services/engineBridge')

// Route imports
const authRoutes = require('./routes/auth')
const ttsRoutes = require('./routes/tts')
const voiceRoutes = require('./routes/voices')
const historyRoutes = require('./routes/history')
const projectRoutes = require('./routes/projects')
const userRoutes = require('./routes/user')
const billingRoutes = require('./routes/billing')
const webhookRoutes = require('./routes/webhooks')
const marketplaceRoutes = require('./routes/marketplace')

const app = express()

// Railway provides PORT automatically
const PORT = process.env.PORT || 8080

// ============================================================
// Rate Limiters
// ============================================================

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
})

const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
})

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
})

// ============================================================
// Middleware
// ============================================================

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

app.use('/api/v1/webhooks', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString()
  }
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ============================================================
// Routes
// ============================================================

app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/tts', ttsLimiter, ttsRoutes)
app.use('/api/v1/voices', generalLimiter, voiceRoutes)
app.use('/api/v1/history', generalLimiter, historyRoutes)
app.use('/api/v1/projects', generalLimiter, projectRoutes)
app.use('/api/v1/user', generalLimiter, userRoutes)
app.use('/api/v1/billing', generalLimiter, billingRoutes)
app.use('/api/v1/webhooks', webhookRoutes)
app.use('/api/v1/marketplace', generalLimiter, marketplaceRoutes)

// ============================================================
// Demo Route
// ============================================================

app.post('/api/v1/demo/generate', demoLimiter, async (req, res) => {
  try {

    const { text, voice, language } = req.body

    if (!text || text.length > 120) {
      return res.status(400).json({ message: 'Text exceeds demo limit.' })
    }

    const result = await engineBridge.generateTTS({
      text,
      voice: voice || 'amrit',
      engine: 'flash',
      language: language || 'en',
      format: 'mp3',
      enhance: false,
      normalize: true
    })

    res.json(result)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Demo generation failed' })
  }
})

// ============================================================
// Health Check (FAST — needed for Railway)
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'voxar-backend',
    uptime: process.uptime()
  })
})

// ============================================================
// Error Handling
// ============================================================

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
})

app.use((err, req, res, next) => {
  console.error('[Error]', err.message)

  res.status(500).json({
    message: 'Internal server error'
  })
})

// ============================================================
// Database & Server Start
// ============================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voxar'

mongoose.connect(MONGODB_URI)
.then(() => {

  console.log('[MongoDB] Connected')

  app.listen(PORT, () => {
    console.log(`VOXAR Backend running on port ${PORT}`)
  })

})
.catch(err => {

  console.error('[MongoDB] Connection failed:', err.message)
  process.exit(1)

})