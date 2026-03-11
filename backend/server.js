require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const jobQueue = require('./services/jobQueue')

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

const engineBridge = require('./services/engineBridge')

const app = express()

// IMPORTANT: Railway provides PORT dynamically
const PORT = process.env.PORT || 8080

// ============================================================
// Rate Limiters
// ============================================================

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Try again in a minute.' },
})

const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'TTS rate limit exceeded. Try again shortly.' },
})

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Rate limit exceeded. Try again shortly.' },
})

const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demo limit reached. Please sign up to continue generating.' },
})

// ============================================================
// Middleware
// ============================================================

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

app.use('/api/v1/webhooks', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString()
  },
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
      return res.status(400).json({ message: 'Text exceeds 120 character limit for demo.' })
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
    res.status(500).json({ message: 'Demo generation failed' })
  }
})

// ============================================================
// Health Check
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'voxar-backend',
    uptime: process.uptime()
  });
});

  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'

  let redisStatus = 'disabled'

  try {
    const { redisClient } = require('./services/jobQueue')
    redisStatus = redisClient.status === 'ready' ? 'connected' : redisClient.status
  } catch (e) {
    redisStatus = 'error'
  }

  let engineHealth = { status: 'not_checked' }

  try {
    engineHealth = await Promise.race([
      engineBridge.healthCheck(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ])
  } catch (e) {
    engineHealth = { status: 'unavailable', error: e.message }
  }

  res.json({
    status: 'ok',
    service: 'voxar-backend',
    version: '1.4.0',
    mode: process.env.VOXAR_ENGINE_MODE || 'local',
    database: dbStatus,
    redis: redisStatus,
    engine: engineHealth,
    uptime: process.uptime(),
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

  const isProd = process.env.NODE_ENV === 'production'

  res.status(500).json({
    message: 'Internal server error',
    detail: isProd ? undefined : err.message
  })
})

// ============================================================
// Database & Server Start
// ============================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voxar'

function logStartupDiagnostics() {

  const mode = process.env.VOXAR_ENGINE_MODE || 'local'

  const checks = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    ENGINE_MODE: mode,
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'DEFAULT (localhost)',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  }

  console.log('[Startup Diagnostics]', JSON.stringify(checks, null, 2))
}

mongoose.connect(MONGODB_URI)
  .then(() => {

    console.log('[MongoDB] Connected')

    app.listen(PORT, () => {

      console.log(`[VOXAR Backend v1.4.0] Running on port ${PORT}`)
      console.log(`[Rate Limits] Auth: 10/min | TTS: 30/min | General: 100/min`)

      logStartupDiagnostics()

    })

  })
  .catch(err => {

    console.error('[MongoDB] Connection failed:', err.message)
    process.exit(1)

  })