const User = require('../models/User')

// Plan limits matching the landing page pricing tiers exactly
// tts/stt in minutes, clones as count, -1 = unlimited
const PLAN_LIMITS = User.PLANS

// Average speaking rate: ~150 words/min, ~5 chars/word = ~750 chars/min
const CHARS_PER_MINUTE = 750

function charsToMinutes(chars) {
  return Math.ceil((chars / CHARS_PER_MINUTE) * 100) / 100 // round to 2 decimals
}

function minutesToChars(minutes) {
  return Math.floor(minutes * CHARS_PER_MINUTE)
}

/**
 * Check if user has enough TTS credits for the given text
 */
function canGenerateTTS(user, characterCount) {
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free
  if (limits.tts_minutes === -1) return { allowed: true, minutes_needed: charsToMinutes(characterCount) }

  const minutesNeeded = charsToMinutes(characterCount)
  const minutesRemaining = limits.tts_minutes - user.usage.tts_minutes_used

  if (minutesRemaining < minutesNeeded) {
    return {
      allowed: false,
      minutes_needed: minutesNeeded,
      minutes_remaining: Math.max(0, minutesRemaining),
      message: `Insufficient TTS credits. Need ${minutesNeeded.toFixed(2)} min, have ${Math.max(0, minutesRemaining).toFixed(2)} min remaining.`,
    }
  }

  return { allowed: true, minutes_needed: minutesNeeded, minutes_remaining: minutesRemaining }
}

/**
 * Check if user has enough STT credits for the given audio duration
 */
function canTranscribe(user, audioDurationMinutes) {
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free
  if (limits.stt_minutes === 0) {
    return { allowed: false, message: 'Transcription not available on your plan. Upgrade to Access or higher.' }
  }
  if (limits.stt_minutes === -1) return { allowed: true }

  const remaining = limits.stt_minutes - user.usage.stt_minutes_used
  if (remaining < audioDurationMinutes) {
    return {
      allowed: false,
      message: `Insufficient STT credits. Need ${audioDurationMinutes.toFixed(1)} min, have ${Math.max(0, remaining).toFixed(1)} min remaining.`,
    }
  }

  return { allowed: true, minutes_remaining: remaining }
}

/**
 * Check if user can create another voice clone
 */
function canClone(user) {
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free
  if (limits.clones === 0) {
    return { allowed: false, message: 'Voice cloning not available on your plan. Upgrade to Access or higher.' }
  }
  if (limits.clones === -1) return { allowed: true }

  if (user.usage.clones_used >= limits.clones) {
    return {
      allowed: false,
      message: `Clone limit reached (${limits.clones}). Upgrade for more clone slots.`,
    }
  }

  return { allowed: true, clones_remaining: limits.clones - user.usage.clones_used }
}

/**
 * Deduct TTS credits after successful generation
 */
async function deductTTS(userId, characterCount) {
  const minutesUsed = charsToMinutes(characterCount)
  await User.findByIdAndUpdate(userId, {
    $inc: { 'usage.tts_minutes_used': minutesUsed },
    updated_at: new Date(),
  })
  return minutesUsed
}

/**
 * Deduct STT credits after successful transcription
 */
async function deductSTT(userId, audioDurationMinutes) {
  await User.findByIdAndUpdate(userId, {
    $inc: { 'usage.stt_minutes_used': audioDurationMinutes },
    updated_at: new Date(),
  })
}

/**
 * Deduct clone credit after successful voice clone
 */
async function deductClone(userId) {
  await User.findByIdAndUpdate(userId, {
    $inc: { 'usage.clones_used': 1 },
    updated_at: new Date(),
  })
}

/**
 * Get usage summary for dashboard display
 */
function getUsageSummary(user) {
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free
  return {
    plan: user.plan,
    tts_minutes_used: user.usage.tts_minutes_used,
    tts_minutes_total: limits.tts_minutes === -1 ? -1 : limits.tts_minutes,
    stt_minutes_used: user.usage.stt_minutes_used,
    stt_minutes_total: limits.stt_minutes === -1 ? -1 : limits.stt_minutes,
    clones_used: user.usage.clones_used,
    clones_total: limits.clones === -1 ? -1 : limits.clones,
    api_access: limits.api_access,
    watermark: limits.watermark,
    billing_cycle_start: user.billing_cycle_start,
  }
}

/**
 * Reset monthly usage (called by cron or on billing cycle)
 */
async function resetMonthlyUsage(userId) {
  await User.findByIdAndUpdate(userId, {
    'usage.tts_minutes_used': 0,
    'usage.stt_minutes_used': 0,
    billing_cycle_start: new Date(),
    updated_at: new Date(),
  })
}

/**
 * Check and auto-reset if billing cycle has passed (30 days)
 */
async function checkAndResetCycle(user) {
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free
  if (!limits.monthly_reset) return // Free plan doesn't reset

  const now = new Date()
  const cycleStart = new Date(user.billing_cycle_start)
  const daysSinceCycle = (now - cycleStart) / (1000 * 60 * 60 * 24)

  if (daysSinceCycle >= 30) {
    await resetMonthlyUsage(user._id)
    user.usage.tts_minutes_used = 0
    user.usage.stt_minutes_used = 0
    user.billing_cycle_start = now
  }
}

module.exports = {
  PLAN_LIMITS,
  CHARS_PER_MINUTE,
  charsToMinutes,
  minutesToChars,
  canGenerateTTS,
  canTranscribe,
  canClone,
  deductTTS,
  deductSTT,
  deductClone,
  getUsageSummary,
  resetMonthlyUsage,
  checkAndResetCycle,
}
