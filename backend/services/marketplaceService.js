const MarketplaceVoice = require('../models/MarketplaceVoice')
const CreatorEarnings = require('../models/CreatorEarnings')

const ROYALTY_TIERS = MarketplaceVoice.ROYALTY_TIERS
const MIN_QUALITY = MarketplaceVoice.MIN_QUALITY_SCORE

/**
 * Record a voice usage and credit the creator
 */
async function recordUsage(marketplaceVoiceId) {
  const voice = await MarketplaceVoice.findById(marketplaceVoiceId)
  if (!voice || voice.status !== 'published') return null

  const tier = ROYALTY_TIERS[voice.royalty_tier] || ROYALTY_TIERS.standard
  const royaltyAmount = voice.is_free ? 0 : tier.rate

  // Increment voice stats
  voice.total_uses += 1
  voice.total_earnings += royaltyAmount
  await voice.save()

  if (royaltyAmount === 0) return { royalty: 0 }

  // Add to creator's monthly earnings
  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  let earnings = await CreatorEarnings.findOne({ creator: voice.creator, period })

  if (!earnings) {
    earnings = new CreatorEarnings({
      creator: voice.creator,
      period,
      period_start: periodStart,
      period_end: periodEnd,
      voice_earnings: [],
    })
  }

  // Find or create voice entry in earnings
  const voiceEntry = earnings.voice_earnings.find(
    e => e.marketplace_voice.toString() === marketplaceVoiceId.toString()
  )

  if (voiceEntry) {
    voiceEntry.uses += 1
    voiceEntry.amount += royaltyAmount
  } else {
    earnings.voice_earnings.push({
      marketplace_voice: marketplaceVoiceId,
      voice_name: voice.name,
      uses: 1,
      amount: royaltyAmount,
    })
  }

  await earnings.save()
  return { royalty: royaltyAmount, period }
}

/**
 * Check if voice meets quality gate for publishing
 */
function meetsQualityGate(qualityScore) {
  return qualityScore >= MIN_QUALITY
}

/**
 * Get creator's total unpaid earnings
 */
async function getUnpaidEarnings(creatorId) {
  const earnings = await CreatorEarnings.find({
    creator: creatorId,
    payout_status: { $in: ['pending', 'eligible'] },
  })

  const total = earnings.reduce((sum, e) => sum + e.creator_payout, 0)
  return { total, periods: earnings.length }
}

/**
 * Process a payout request
 */
async function requestPayout(creatorId, method = 'credits') {
  const earnings = await CreatorEarnings.find({
    creator: creatorId,
    payout_status: 'eligible',
  }).sort({ period: 1 })

  if (earnings.length === 0) {
    return { success: false, message: 'No eligible earnings for payout' }
  }

  const totalPayout = earnings.reduce((sum, e) => sum + e.creator_payout, 0)

  if (totalPayout < CreatorEarnings.MIN_PAYOUT) {
    return {
      success: false,
      message: `Minimum payout is ₹${CreatorEarnings.MIN_PAYOUT / 100}. Current balance: ₹${(totalPayout / 100).toFixed(2)}`,
    }
  }

  const fee = method === 'bank_transfer' ? CreatorEarnings.BANK_TRANSFER_FEE : 0
  const netPayout = totalPayout - fee

  // Mark all eligible periods as requested
  for (const e of earnings) {
    e.payout_status = 'requested'
    e.payout_method = method
    e.payout_fee = fee > 0 ? Math.floor(fee / earnings.length) : 0
    await e.save()
  }

  return {
    success: true,
    method,
    gross: totalPayout,
    fee,
    net: netPayout,
    periods: earnings.length,
    message: method === 'credits'
      ? `₹${(netPayout / 100).toFixed(2)} will be added to your VOXAR credits`
      : `₹${(netPayout / 100).toFixed(2)} will be transferred (₹${(fee / 100).toFixed(2)} processing fee)`,
  }
}

module.exports = {
  recordUsage,
  meetsQualityGate,
  getUnpaidEarnings,
  requestPayout,
  ROYALTY_TIERS,
  MIN_QUALITY,
}
