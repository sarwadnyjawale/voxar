const Subscription = require('../models/Subscription')
const Payment = require('../models/Payment')
const User = require('../models/User')
const razorpay = require('../services/razorpayService')
const creditService = require('../services/creditService')

/**
 * GET /billing/plans
 * List available plans with pricing
 */
async function getPlans(req, res) {
  const plans = ['access', 'starter', 'creator', 'pro'].map(key => ({
    monthly: razorpay.getPlanDetails(key, 'monthly'),
    yearly: razorpay.getPlanDetails(key, 'yearly'),
  }))
  res.json({ plans })
}

/**
 * POST /billing/subscribe
 * Create a Razorpay subscription and return checkout data
 *
 * Body: { plan: 'starter', period: 'monthly', razorpay_plan_id: 'plan_xxx' }
 */
async function subscribe(req, res) {
  try {
    const { plan, period, razorpay_plan_id } = req.body

    if (!plan || !['access', 'starter', 'creator', 'pro'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan. Choose: access, starter, creator, pro' })
    }
    if (!razorpay_plan_id) {
      return res.status(400).json({ message: 'razorpay_plan_id is required (create plans via Razorpay dashboard or setup script)' })
    }

    const billingPeriod = period === 'yearly' ? 'yearly' : 'monthly'
    const planDetails = razorpay.getPlanDetails(plan, billingPeriod)

    // Create or reuse Razorpay customer
    let customerId = req.user.razorpay_customer_id
    if (!customerId) {
      const customer = await razorpay.createCustomer({
        name: req.user.name,
        email: req.user.email,
      })
      customerId = customer.id
      req.user.razorpay_customer_id = customerId
      await req.user.save()
    }

    // Cancel existing active subscription if upgrading/changing
    const existingSub = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ['active', 'authenticated', 'created'] },
    })
    if (existingSub) {
      try {
        await razorpay.cancelSubscription(existingSub.razorpay_subscription_id, false)
        existingSub.status = 'cancelled'
        existingSub.ended_at = new Date()
        await existingSub.save()
      } catch (err) {
        // Subscription might already be cancelled on Razorpay's side
        existingSub.status = 'cancelled'
        await existingSub.save()
      }
    }

    // Create new subscription on Razorpay
    const rzSub = await razorpay.createSubscription({
      razorpayPlanId: razorpay_plan_id,
      customerId,
      totalCount: billingPeriod === 'yearly' ? 5 : 60,
      notes: {
        user_id: req.user._id.toString(),
        plan,
        period: billingPeriod,
      },
    })

    // Store subscription in DB
    const subscription = await Subscription.create({
      user: req.user._id,
      razorpay_subscription_id: rzSub.id,
      razorpay_plan_id: razorpay_plan_id,
      razorpay_customer_id: customerId,
      plan,
      billing_period: billingPeriod,
      amount: planDetails.amount,
      status: rzSub.status,
      short_url: rzSub.short_url || '',
      total_count: rzSub.total_count,
    })

    res.json({
      subscription_id: rzSub.id,
      razorpay_key: process.env.RAZORPAY_KEY_ID,
      plan: planDetails,
      short_url: rzSub.short_url || '',
      status: rzSub.status,
      message: 'Subscription created. Complete payment to activate.',
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subscription', detail: err.message })
  }
}

/**
 * POST /billing/verify
 * Verify payment after Razorpay checkout completes (frontend callback)
 *
 * Body: { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }
 */
async function verifyPayment(req, res) {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' })
    }

    // Verify signature
    const isValid = razorpay.verifyPaymentSignature({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    })

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' })
    }

    // Fetch subscription details from Razorpay
    const rzSub = await razorpay.fetchSubscription(razorpay_subscription_id)

    // Update local subscription
    const subscription = await Subscription.findOne({ razorpay_subscription_id })
    if (subscription) {
      subscription.status = rzSub.status
      subscription.current_start = rzSub.current_start ? new Date(rzSub.current_start * 1000) : new Date()
      subscription.current_end = rzSub.current_end ? new Date(rzSub.current_end * 1000) : null
      subscription.charge_at = rzSub.charge_at ? new Date(rzSub.charge_at * 1000) : null
      subscription.paid_count = rzSub.paid_count || 0
      await subscription.save()

      // Activate user's plan
      const user = await User.findById(subscription.user)
      if (user) {
        user.plan = subscription.plan
        user.billing_period = subscription.billing_period
        user.active_subscription = subscription._id
        user.billing_cycle_start = new Date()
        // Reset usage on plan activation
        user.usage.tts_minutes_used = 0
        user.usage.stt_minutes_used = 0
        await user.save()
      }
    }

    // Record payment
    const paymentInfo = await razorpay.fetchPayment(razorpay_payment_id)
    await Payment.create({
      user: req.user._id,
      subscription: subscription?._id,
      razorpay_payment_id,
      razorpay_subscription_id,
      amount: paymentInfo.amount,
      currency: paymentInfo.currency,
      plan: subscription?.plan || '',
      billing_period: subscription?.billing_period || '',
      status: 'captured',
      method: paymentInfo.method || '',
      description: `${subscription?.plan || ''} plan - ${subscription?.billing_period || ''} subscription`,
    })

    res.json({
      verified: true,
      plan: subscription?.plan,
      status: 'active',
      message: 'Payment verified. Your plan is now active.',
    })
  } catch (err) {
    res.status(500).json({ message: 'Payment verification failed', detail: err.message })
  }
}

/**
 * GET /billing/subscription
 * Get current subscription details
 */
async function getSubscription(req, res) {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ['active', 'authenticated', 'pending'] },
    }).sort({ created_at: -1 })

    if (!subscription) {
      return res.json({
        subscription: null,
        plan: req.user.plan,
        message: req.user.plan === 'free' ? 'No active subscription. You are on the Free plan.' : 'No active subscription found.',
      })
    }

    // Sync with Razorpay
    try {
      const rzSub = await razorpay.fetchSubscription(subscription.razorpay_subscription_id)
      subscription.status = rzSub.status
      subscription.paid_count = rzSub.paid_count || subscription.paid_count
      if (rzSub.current_end) subscription.current_end = new Date(rzSub.current_end * 1000)
      if (rzSub.charge_at) subscription.charge_at = new Date(rzSub.charge_at * 1000)
      await subscription.save()
    } catch (err) {
      // Razorpay might be down — use cached data
    }

    const planDetails = razorpay.getPlanDetails(subscription.plan, subscription.billing_period)

    res.json({
      subscription: {
        id: subscription._id,
        razorpay_id: subscription.razorpay_subscription_id,
        plan: subscription.plan,
        billing_period: subscription.billing_period,
        status: subscription.status,
        current_start: subscription.current_start,
        current_end: subscription.current_end,
        charge_at: subscription.charge_at,
        paid_count: subscription.paid_count,
        amount: subscription.amount,
      },
      plan_details: planDetails,
      usage: creditService.getUsageSummary(req.user),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscription', detail: err.message })
  }
}

/**
 * POST /billing/cancel
 * Cancel current subscription (at end of billing period)
 */
async function cancelCurrentSubscription(req, res) {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ['active', 'authenticated'] },
    })

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription to cancel' })
    }

    // Cancel on Razorpay (at cycle end so user keeps access until period expires)
    await razorpay.cancelSubscription(subscription.razorpay_subscription_id, true)

    subscription.status = 'cancelled'
    subscription.ended_at = subscription.current_end || new Date()
    await subscription.save()

    res.json({
      message: 'Subscription cancelled. You will retain access until the end of your current billing period.',
      access_until: subscription.current_end,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel subscription', detail: err.message })
  }
}

/**
 * GET /billing/payments
 * Get payment history
 */
async function getPayments(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [payments, total] = await Promise.all([
      Payment.find({ user: req.user._id })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments({ user: req.user._id }),
    ])

    res.json({
      payments: payments.map(p => ({
        id: p._id,
        razorpay_payment_id: p.razorpay_payment_id,
        amount: p.amount,
        currency: p.currency,
        plan: p.plan,
        billing_period: p.billing_period,
        status: p.status,
        method: p.method,
        description: p.description,
        created_at: p.created_at,
      })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments', detail: err.message })
  }
}

module.exports = {
  getPlans,
  subscribe,
  verifyPayment,
  getSubscription,
  cancelCurrentSubscription,
  getPayments,
}
