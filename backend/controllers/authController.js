const User = require('../models/User')
const { generateToken } = require('../middleware/auth')

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

async function register(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    // Generate 6-digit verification code
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000))

    const user = await User.create({
      name,
      email,
      password,
      verification_code: verificationCode,
      email_verified: false,
    })

    // In dev mode, log the code. In production, send via email.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Email verification code for ${email}: ${verificationCode}`)
    }

    const token = generateToken(user._id)

    res.status(201).json({
      user: user.toPublic(),
      token,
      email_verification_required: true,
    })
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', detail: err.message })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check account lockout
    if (user.locked_until && user.locked_until > new Date()) {
      const minutesLeft = Math.ceil((user.locked_until - new Date()) / (60 * 1000))
      return res.status(423).json({
        message: `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`,
        code: 'ACCOUNT_LOCKED',
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      // Increment failed attempts
      const attempts = (user.login_attempts || 0) + 1
      const update = { login_attempts: attempts }

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        update.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        update.login_attempts = 0
      }

      await User.findByIdAndUpdate(user._id, update)

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        return res.status(423).json({
          message: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
          code: 'ACCOUNT_LOCKED',
        })
      }

      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Successful login — reset attempts and lockout
    if (user.login_attempts > 0 || user.locked_until) {
      await User.findByIdAndUpdate(user._id, { login_attempts: 0, locked_until: null })
    }

    const token = generateToken(user._id)

    res.json({
      user: user.toPublic(),
      token,
    })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', detail: err.message })
  }
}

async function verifyEmail(req, res) {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' })
    }

    const user = req.user
    if (user.email_verified) {
      return res.json({ message: 'Email already verified' })
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    user.email_verified = true
    user.verification_code = null
    await user.save()

    res.json({ message: 'Email verified successfully', user: user.toPublic() })
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', detail: err.message })
  }
}

async function resendVerification(req, res) {
  try {
    const user = req.user
    if (user.email_verified) {
      return res.json({ message: 'Email already verified' })
    }

    const verificationCode = String(Math.floor(100000 + Math.random() * 900000))
    user.verification_code = verificationCode
    await user.save()

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Resent verification code for ${user.email}: ${verificationCode}`)
    }

    res.json({ message: 'Verification code sent' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend code', detail: err.message })
  }
}

async function getMe(req, res) {
  const limits = req.user.getPlanLimits()
  res.json({
    user: req.user.toPublic(),
    limits,
  })
}

async function updateProfile(req, res) {
  try {
    const { name, avatar } = req.body
    if (name) req.user.name = name
    if (avatar !== undefined) req.user.avatar = avatar
    await req.user.save()
    res.json({ user: req.user.toPublic() })
  } catch (err) {
    res.status(500).json({ message: 'Update failed', detail: err.message })
  }
}

module.exports = { register, login, getMe, updateProfile, verifyEmail, resendVerification }
