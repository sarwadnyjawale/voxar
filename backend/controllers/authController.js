const User = require('../models/User')
const { generateToken } = require('../middleware/auth')

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

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      user: user.toPublic(),
      token,
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

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
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

module.exports = { register, login, getMe, updateProfile }
