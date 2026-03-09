const Subscription = require('../models/Subscription')
const Payment = require('../models/Payment')
const User = require('../models/User')
const { verifyWebhookSignature } = require('../services/razorpayService')
const { resetMonthlyUsage } = require('../services/creditService')

/**
 * POST /webhooks/razorpay
 *
 * Handles all Razorpay webhook events.
 * IMPORTANT: This endpoint receives RAW body (not parsed JSON)
 * because we need the raw body for signature verification.
 */
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature']
    if (!signature) {
      return res.status(400).json({ message: 'Missing webhook signature' })
    }

    // Verify webhook signature
    const rawBody = req.rawBody
    if (!rawBody) {
      return res.status(400).json({ message: 'Missing raw body for verification' })
    }

    const isValid = verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
      console.error('[Webhook] Invalid signature')
      return res.status(400).json({ message: 'Invalid webhook signature' })
    }

    const event = req.body
    const eventType = event.event

    console.log(`[Webhook] Received: ${eventType}`)

    switch (eventType) {
      case 'subscription.authenticated':
        await handleSubscriptionAuthenticated(event.payload)
        break

      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload)
        break

      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload)
        break

      case 'subscription.completed':
        await handleSubscriptionCompleted(event.payload)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload)
        break

      case 'subscription.halted':
        await handleSubscriptionHalted(event.payload)
        break

      case 'subscription.pending':
        await handleSubscriptionPending(event.payload)
        break

      case 'payment.captured':
        await handlePaymentCaptured(event.payload)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payload)
        break

      default:
        console.log(`[Webhook] Unhandled event: ${eventType}`)
    }

    // Always return 200 to acknowledge receipt
    res.json({ status: 'ok' })
  } catch (err) {
    console.error('[Webhook] Error:', err.message)
    // Still return 200 to prevent Razorpay retries on our errors
    res.json({ status: 'error', message: err.message })
  }
}

// ============================================================
// Subscription Event Handlers
// ============================================================

async function handleSubscriptionAuthenticated(payload) {
  const rzSub = payload.subscription?.entity
  if (!rzSub) return

  const subscription = await Subscription.findOne({ razorpay_subscription_id: rzSub.id })
  if (subscription) {
    subscription.status = 'authenticated'
    await subscription.save()
  }
}

async function handleSubscriptionActivated(payload) {
  const rzSub = payload.subscription?.entity
  if (!rzSub) return

  const subscription = await Subscription.findOne({ razorpay_subscription_id: rzSub.id })
  if (!subscription) return

  subscription.status = 'active'
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
    user.usage.tts_minutes_used = 0
    user.usage.stt_minutes_used = 0
    await user.save()
    console.log(`[Webhook] Activated ${subscription.plan} plan for user ${user.email}`)
  }
}

async function handleSubscriptionCharged(payload) {
  const rzSub = payload.subscription?.entity
  const rzPayment = payload.payment?.entity
  if (!rzSub) return

  const subscription = await Subscription.findOne({ razorpay_subscription_id: rzSub.id })
  if (!subscription) return

  // Update subscription
  subscription.status = 'active'
  subscription.current_start = rzSub.current_start ? new Date(rzSub.current_start * 1000) : new Date()
  subscription.current_end = rzSub.current_end ? new Date(rzSub.current_end * 1000) : null
  subscription.charge_at = rzSub.charge_at ? new Date(rzSub.charge_at * 1000) : null
  subscription.paid_count = rzSub.paid_count || subscription.paid_count + 1
  await subscription.save()

  // Reset monthly credits (new billing cycle = fresh credits)
  await resetMonthlyUsage(subscription.user)
  console.log(`[Webhook] Credits reset for user ${subscription.user} (new billing cycle)`)

  // Record payment if payment entity exists
  if (rzPayment) {
    const existingPayment = await Payment.findOne({ razorpay_payment_id: rzPayment.id })
    if (!existingPayment) {
      await Payment.create({
        user: subscription.user,
        subscription: subscription._id,
        razorpay_payment_id: rzPayment.id,
        razorpay_subscription_id: rzSub.id,
        razorpay_invoice_id: rzPayment.invoice_id || '',
        amount: rzPayment.amount,
        currency: rzPayment.currency || 'INR',
        plan: subscription.plan,
        billing_period: subscription.billing_period,
        status: 'captured',
        method: rzPayment.method || '',
        description: `Recurring charge - ${subscription.plan} (${subscription.billing_period})`,
      })
    }
  }
}

async function handleSubscriptionCompleted(payload) {
  const rzSub = payload.subscription?.entity
  if (!rzSub) return

  const subscription = await Subscription.findOne({ razorpay_subscription_id: rzSub.id })
  if (!subscription) return

  subscription.status = 'completed'
  subscription.ended_at = new Date()
  await subscription.save()

  // Downgrade user to free
  const user = await User.findById(subscription.user)
  if (user) {
    user.plan = 'free'
    user.billing_period = 'none'
    user.active_subscription = null
    await user.save()
    console.log(`[Webhook] Subscription completed, ${user.email} downgraded to free`)
  }
}

async function handleSubscriptionCancelled(payload) {
  const rzSub = payload.subscription?.entity
  if (!rzSub) return

  const subscription = await Subscription.findOne({ razorpay_subscription_id: rzSub.id })
  if (!subscription) return

  subscription.status = 'cancelled'
  subscription.ended_at = rzSub.ended_at ? new Date(rzSub.ended_at * 1000) : new Date()
  await subscription.save()

  // Check if the subscription period has already ended
  const now = new Date()
  const endDate = subscription.current_end

  if (!endDate || now >= endDate) {
    // Period already ended — downgrade immediately
    const user = await User.findById(subscription.user)
    if (user) {
      user.plan = 'free'
      user.billing_period = 'none'
      user.active_subscription = null
      await user.save()
      console.log(`[Webhook] Subscription cancelled, ${user.email} downgraded to free`)
    }
  } else {
    // User retains access until current_end
    console.log(`[Webhook] Subscription cancelled, user retains access until ${endDate}`)
  }
}

async function handleSubscriptionHalted(payload) {
  const rzSub = payload.subscription?.entity
  if (!rzSub) return

  const subscription = await Subscription.findOne({ razorpay_subscription_id: rzSub.id })
  if (!subscription) return

  subscription.status = 'halted'
  await subscription.save()

  // Downgrade user — payment failed multiple times
  const user = await User.findById(subscription.user)
  if (user) {
    user.plan = 'free'
    user.billing_period = 'none'
    user.active_subscription = null
    await user.save()
    console.log(`[Webhook] Subscription halted (payment failures), ${user.email} downgraded to free`)
  }
}

async function handleSubscriptionPending(payload) {
  const rzSub = payload.subscription?.entity
  if (!rzSub) return

  const subscription = await Subscription.findOne({ razorpay_subscription_id: rzSub.id })
  if (subscription) {
    subscription.status = 'pending'
    await subscription.save()
  }
}

// ============================================================
// Payment Event Handlers
// ============================================================

async function handlePaymentCaptured(payload) {
  const rzPayment = payload.payment?.entity
  if (!rzPayment) return

  // Check if we already recorded this payment
  const existing = await Payment.findOne({ razorpay_payment_id: rzPayment.id })
  if (existing) {
    existing.status = 'captured'
    await existing.save()
    return
  }

  // If it's a subscription payment, find the subscription
  if (rzPayment.subscription_id) {
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: rzPayment.subscription_id,
    })
    if (subscription) {
      await Payment.create({
        user: subscription.user,
        subscription: subscription._id,
        razorpay_payment_id: rzPayment.id,
        razorpay_subscription_id: rzPayment.subscription_id,
        razorpay_invoice_id: rzPayment.invoice_id || '',
        amount: rzPayment.amount,
        currency: rzPayment.currency || 'INR',
        plan: subscription.plan,
        billing_period: subscription.billing_period,
        status: 'captured',
        method: rzPayment.method || '',
        description: `Payment captured - ${subscription.plan}`,
      })
    }
  }
}

async function handlePaymentFailed(payload) {
  const rzPayment = payload.payment?.entity
  if (!rzPayment) return

  if (rzPayment.subscription_id) {
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: rzPayment.subscription_id,
    })
    if (subscription) {
      await Payment.create({
        user: subscription.user,
        subscription: subscription._id,
        razorpay_payment_id: rzPayment.id,
        razorpay_subscription_id: rzPayment.subscription_id,
        amount: rzPayment.amount,
        currency: rzPayment.currency || 'INR',
        plan: subscription.plan,
        billing_period: subscription.billing_period,
        status: 'failed',
        method: rzPayment.method || '',
        error_code: rzPayment.error_code || '',
        error_description: rzPayment.error_description || '',
        description: `Payment failed - ${subscription.plan}`,
      })
      console.log(`[Webhook] Payment failed for subscription ${rzPayment.subscription_id}`)
    }
  }
}

module.exports = { handleWebhook }
