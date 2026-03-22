const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const PLANS = {
  free:       { tts_minutes: 10,   stt_minutes: 5,     clones: 0,  api_access: false, watermark: true,  monthly_reset: true },
  access:     { tts_minutes: 30,   stt_minutes: 15,    clones: 1,  api_access: false, watermark: false, monthly_reset: true },
  starter:    { tts_minutes: 120,  stt_minutes: 60,    clones: 3,  api_access: false, watermark: false, monthly_reset: true },
  creator:    { tts_minutes: 300,  stt_minutes: 150,   clones: 5,  api_access: false, watermark: false, monthly_reset: true },
  pro:        { tts_minutes: 1000, stt_minutes: 500,   clones: 15, api_access: true,  watermark: false, monthly_reset: true },
  enterprise: { tts_minutes: -1,   stt_minutes: -1,    clones: -1, api_access: true,  watermark: false, monthly_reset: true },
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  plan: { type: String, enum: Object.keys(PLANS), default: 'free' },

  // Usage tracking
  usage: {
    tts_minutes_used: { type: Number, default: 0 },
    stt_minutes_used: { type: Number, default: 0 },
    clones_used: { type: Number, default: 0 },
  },

  // API keys (Pro+ only)
  api_keys: [{
    key: { type: String, required: true },
    label: { type: String, default: 'Default' },
    created_at: { type: Date, default: Date.now },
    last_used: { type: Date },
  }],

  // Razorpay
  razorpay_customer_id: { type: String, default: '' },
  active_subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },

  // Billing
  billing_cycle_start: { type: Date, default: Date.now },
  billing_period: { type: String, enum: ['monthly', 'yearly', 'none'], default: 'none' },

  // Login security
  login_attempts: { type: Number, default: 0 },
  locked_until: { type: Date, default: null },

  // Email verification
  email_verified: { type: Boolean, default: false },
  verification_code: { type: String, default: null },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  this.updated_at = new Date()
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Get plan limits
userSchema.methods.getPlanLimits = function () {
  return PLANS[this.plan] || PLANS.free
}

// Strip sensitive fields for API response
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    plan: this.plan,
    billing_period: this.billing_period,
    usage: this.usage,
    api_keys: (this.api_keys || []).map(k => ({
      key: k.key.slice(0, 8) + '...' + k.key.slice(-4),
      label: k.label,
      created_at: k.created_at,
      last_used: k.last_used,
    })),
    created_at: this.created_at,
  }
}

userSchema.statics.PLANS = PLANS

module.exports = mongoose.model('User', userSchema)
