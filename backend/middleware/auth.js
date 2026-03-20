const jwt = require('jsonwebtoken')
const User = require('../models/User')

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'CHANGE_ME_GENERATE_WITH_OPENSSL') {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set in production. Exiting.')
    process.exit(1)
  }
  console.warn('[WARN] JWT_SECRET is not set or uses default. Set a strong secret before deploying.')
}
const JWT_SECRET = process.env.JWT_SECRET || 'voxar-dev-secret-change-in-production'

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' })
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Optional auth — attaches user if token present, but doesn't fail
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next()
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = await User.findById(decoded.id)
  } catch (err) {
    // Ignore invalid tokens in optional auth
  }
  next()
}

module.exports = { authMiddleware, optionalAuth, generateToken, JWT_SECRET }
