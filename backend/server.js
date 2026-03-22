require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')

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
const transcribeRoutes = require('./routes/transcribe')
const jobRoutes = require('./routes/jobs')
const demoRoutes = require('./routes/demo')

const engineBridge = require('./services/engineBridge')
const { authMiddleware } = require('./middleware/auth')

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3001
const HOST = '0.0.0.0'

// ============================================================
// Rate Limiters
// ============================================================
const authLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 10,               // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Try again in a minute.' },
})

const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip?.replace(/^::ffff:/, '') || 'unknown',
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: { message: 'TTS rate limit exceeded. Try again shortly.' },
})

const sttLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip?.replace(/^::ffff:/, '') || 'unknown',
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: { message: 'STT rate limit exceeded. Try again shortly.' },
})

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip?.replace(/^::ffff:/, '') || 'unknown',
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: { message: 'Rate limit exceeded. Try again shortly.' },
})

// ============================================================
// Middleware
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// CORS — supports comma-separated CORS_ORIGINS or single CORS_ORIGIN
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',').map(s => s.trim()).filter(Boolean)
app.use(cors({
  origin: (origin, cb) => {
    // '*' means allow all origins
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.endsWith(o.replace(/^https?:\/\/\*\./, '')))) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  },
  credentials: true,
}))

// Webhook route needs raw body for signature verification
// Must be registered BEFORE express.json() parses the body
app.use('/api/v1/webhooks', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString()
  },
}))

// Standard JSON parsing for all other routes
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files (voice samples, generated audio) — authenticated
app.use('/uploads', authMiddleware, express.static(path.join(__dirname, 'uploads')))

// Serve voice preview WAVs — public (no auth, no credits needed)
// Uses existing audio samples to avoid dynamic generation for previews
app.use('/previews', express.static(path.join(__dirname, 'previews'), {
  maxAge: '7d',
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*')
  },
}))

// ============================================================
// Routes (with rate limiting)
// ============================================================
app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/tts', ttsLimiter, ttsRoutes)
app.use('/api/v1/transcribe', sttLimiter, transcribeRoutes)
app.use('/api/v1/voices', generalLimiter, voiceRoutes)
app.use('/api/v1/history', generalLimiter, historyRoutes)
app.use('/api/v1/projects', generalLimiter, projectRoutes)
app.use('/api/v1/user', generalLimiter, userRoutes)
app.use('/api/v1/billing', generalLimiter, billingRoutes)
app.use('/api/v1/webhooks', webhookRoutes)  // No rate limit on webhooks (Razorpay)
app.use('/api/v1/marketplace', generalLimiter, marketplaceRoutes)
app.use('/api/v1/jobs', generalLimiter, jobRoutes)
app.use('/api/v1/generate', demoRoutes)

// Health check
app.get('/health', async (req, res) => {
  const engineHealth = await engineBridge.healthCheck()
  res.json({
    status: 'ok',
    service: 'voxar-backend',
    version: '1.3.0',
    engine: engineHealth,
    uptime: process.uptime(),
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message })
  }
  res.status(500).json({ message: 'Internal server error', detail: err.message })
})

// ============================================================
// Database & Server Start
// ============================================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voxar'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Connected')
    app.listen(PORT, HOST, () => {
      console.log(`[VOXAR Backend v1.3.0] Running on ${HOST}:${PORT}`)
      console.log(`[Rate Limits] Auth: 10/min | TTS: 30/min | General: 100/min`)
    })
  })
  .catch(err => {
    console.error('[MongoDB] Connection failed:', err.message)
    process.exit(1)
  })
