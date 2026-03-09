const MarketplaceVoice = require('../models/MarketplaceVoice')
const CreatorEarnings = require('../models/CreatorEarnings')
const Voice = require('../models/Voice')
const marketplaceService = require('../services/marketplaceService')

/**
 * GET /marketplace/voices
 * Browse published marketplace voices
 */
async function browseVoices(req, res) {
  try {
    const { category, language, gender, search, sort, page = 1, limit = 24 } = req.query

    const filter = { status: 'published' }
    if (category) filter.category = category
    if (language) filter.language = language
    if (gender) filter.gender = gender
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ]
    }

    let sortBy = { total_uses: -1 }  // default: most popular
    if (sort === 'newest') sortBy = { created_at: -1 }
    if (sort === 'rating') sortBy = { average_rating: -1 }
    if (sort === 'featured') sortBy = { is_featured: -1, average_rating: -1 }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [voices, total] = await Promise.all([
      MarketplaceVoice.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('creator', 'name avatar'),
      MarketplaceVoice.countDocuments(filter),
    ])

    res.json({
      voices: voices.map(v => ({
        id: v._id,
        name: v.name,
        description: v.description,
        category: v.category,
        language: v.language,
        gender: v.gender,
        tags: v.tags,
        preview_url: v.preview_url,
        quality_score: v.quality_score,
        royalty_tier: v.royalty_tier,
        is_free: v.is_free,
        total_uses: v.total_uses,
        average_rating: v.average_rating,
        review_count: v.review_count,
        is_featured: v.is_featured,
        is_verified: v.is_verified,
        creator: v.creator ? { name: v.creator.name, avatar: v.creator.avatar } : null,
      })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to browse voices', detail: err.message })
  }
}

/**
 * GET /marketplace/voices/:id
 * Get a single marketplace voice with reviews
 */
async function getVoice(req, res) {
  try {
    const voice = await MarketplaceVoice.findById(req.params.id)
      .populate('creator', 'name avatar')
      .populate('reviews.user', 'name avatar')

    if (!voice || voice.status !== 'published') {
      return res.status(404).json({ message: 'Voice not found' })
    }

    res.json({ voice })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch voice', detail: err.message })
  }
}

/**
 * POST /marketplace/publish
 * Publish a cloned voice to the marketplace
 */
async function publishVoice(req, res) {
  try {
    const { voice_id, name, description, tags, category, language, gender, royalty_tier, is_free, consent } = req.body

    if (!voice_id) {
      return res.status(400).json({ message: 'voice_id is required (from your cloned voices)' })
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Voice name is required' })
    }

    // Verify the user owns this voice
    const sourceVoice = await Voice.findOne({ _id: voice_id, user: req.user._id })
    if (!sourceVoice) {
      return res.status(404).json({ message: 'Voice not found or you do not own it' })
    }

    if (sourceVoice.status !== 'ready') {
      return res.status(400).json({ message: 'Voice must be fully processed before publishing' })
    }

    // Quality gate
    if (!marketplaceService.meetsQualityGate(sourceVoice.quality_score)) {
      return res.status(400).json({
        message: `Voice quality score (${sourceVoice.quality_score}) is below the minimum (${marketplaceService.MIN_QUALITY}). Improve your recording and try again.`,
        quality_score: sourceVoice.quality_score,
        minimum_required: marketplaceService.MIN_QUALITY,
      })
    }

    // Consent validation
    if (!consent || !consent.is_own_voice) {
      return res.status(400).json({ message: 'You must confirm this is your own voice or you have rights to publish it' })
    }

    // Check for duplicate listing
    const existing = await MarketplaceVoice.findOne({
      source_voice: voice_id,
      status: { $in: ['draft', 'pending_review', 'published'] },
    })
    if (existing) {
      return res.status(409).json({ message: 'This voice is already listed on the marketplace' })
    }

    const marketplaceVoice = await MarketplaceVoice.create({
      creator: req.user._id,
      source_voice: voice_id,
      name: name.trim(),
      description: description || '',
      tags: tags || [],
      category: category || 'narration',
      language: language || sourceVoice.language || 'en',
      gender: gender || 'neutral',
      preview_url: '',
      quality_score: sourceVoice.quality_score,
      status: 'published',  // auto-publish if quality gate passes
      consent: {
        is_own_voice: consent.is_own_voice,
        allows_commercial: consent.allows_commercial || false,
        allows_modification: consent.allows_modification !== false,
        consent_date: new Date(),
      },
      royalty_tier: royalty_tier || 'standard',
      is_free: is_free || false,
    })

    res.status(201).json({
      voice: marketplaceVoice,
      message: 'Voice published to marketplace!',
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to publish voice', detail: err.message })
  }
}

/**
 * DELETE /marketplace/voices/:id
 * Unpublish a marketplace voice
 */
async function unpublishVoice(req, res) {
  try {
    const voice = await MarketplaceVoice.findOne({ _id: req.params.id, creator: req.user._id })
    if (!voice) {
      return res.status(404).json({ message: 'Voice not found or you do not own it' })
    }

    voice.status = 'suspended'
    await voice.save()

    res.json({ message: 'Voice removed from marketplace' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to unpublish', detail: err.message })
  }
}

/**
 * POST /marketplace/voices/:id/review
 * Rate and review a marketplace voice
 */
async function reviewVoice(req, res) {
  try {
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be 1-5' })
    }

    const voice = await MarketplaceVoice.findById(req.params.id)
    if (!voice || voice.status !== 'published') {
      return res.status(404).json({ message: 'Voice not found' })
    }

    // Can't review your own voice
    if (voice.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review your own voice' })
    }

    // Check if already reviewed
    const existingReview = voice.reviews.find(r => r.user.toString() === req.user._id.toString())
    if (existingReview) {
      existingReview.rating = rating
      existingReview.comment = comment || ''
    } else {
      voice.reviews.push({ user: req.user._id, rating, comment: comment || '' })
    }

    await voice.save()
    res.json({ message: 'Review submitted', average_rating: voice.average_rating })
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review', detail: err.message })
  }
}

/**
 * GET /marketplace/my-voices
 * Get creator's listed marketplace voices
 */
async function getMyListings(req, res) {
  try {
    const voices = await MarketplaceVoice.find({ creator: req.user._id })
      .sort({ created_at: -1 })

    res.json({
      voices: voices.map(v => ({
        id: v._id,
        name: v.name,
        status: v.status,
        quality_score: v.quality_score,
        royalty_tier: v.royalty_tier,
        is_free: v.is_free,
        total_uses: v.total_uses,
        total_earnings: v.total_earnings,
        average_rating: v.average_rating,
        review_count: v.review_count,
        created_at: v.created_at,
      })),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings', detail: err.message })
  }
}

/**
 * GET /marketplace/earnings
 * Get creator's earnings summary
 */
async function getEarnings(req, res) {
  try {
    const earnings = await CreatorEarnings.find({ creator: req.user._id })
      .sort({ period: -1 })
      .limit(12)

    const unpaid = await marketplaceService.getUnpaidEarnings(req.user._id)

    res.json({
      earnings: earnings.map(e => ({
        period: e.period,
        total_uses: e.total_uses,
        total_earned: e.total_earned,
        platform_fee: e.platform_fee,
        creator_payout: e.creator_payout,
        payout_status: e.payout_status,
        payout_method: e.payout_method,
        payout_date: e.payout_date,
        voice_earnings: e.voice_earnings,
      })),
      unpaid_balance: unpaid.total,
      unpaid_periods: unpaid.periods,
      minimum_payout: CreatorEarnings.MIN_PAYOUT,
      bank_transfer_fee: CreatorEarnings.BANK_TRANSFER_FEE,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch earnings', detail: err.message })
  }
}

/**
 * POST /marketplace/payout
 * Request a payout
 */
async function requestPayout(req, res) {
  try {
    const { method } = req.body  // 'credits' or 'bank_transfer'

    if (method && !['credits', 'bank_transfer'].includes(method)) {
      return res.status(400).json({ message: 'Method must be "credits" or "bank_transfer"' })
    }

    const result = await marketplaceService.requestPayout(req.user._id, method || 'credits')

    if (!result.success) {
      return res.status(400).json({ message: result.message })
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Payout request failed', detail: err.message })
  }
}

module.exports = {
  browseVoices,
  getVoice,
  publishVoice,
  unpublishVoice,
  reviewVoice,
  getMyListings,
  getEarnings,
  requestPayout,
}
