const Razorpay = require('razorpay')
const crypto = require('crypto')

// ============================================================
// Razorpay Plan Definitions
// Amounts in PAISE (1 INR = 100 paise)
// Matches landing page pricing exactly
// ============================================================
const RAZORPAY_PLANS = {
  access: {
    name: 'VOXAR Access',
    monthly: { amount: 24900, display: '₹249/mo' },      // ₹249
    yearly:  { amount: 19900, display: '₹199/mo' },       // ₹199/mo billed annually = ₹2,388/yr
    yearly_total: 238800,                                   // ₹2,388
  },
  starter: {
    name: 'VOXAR Starter',
    monthly: { amount: 59900, display: '₹599/mo' },       // ₹599
    yearly:  { amount: 49900, display: '₹499/mo' },       // ₹499/mo billed annually = ₹5,988/yr
    yearly_total: 598800,
  },
  creator: {
    name: 'VOXAR Creator',
    monthly: { amount: 149900, display: '₹1,499/mo' },    // ₹1,499
    yearly:  { amount: 119900, display: '₹1,199/mo' },    // ₹1,199/mo billed annually = ₹14,388/yr
    yearly_total: 1438800,
  },
  pro: {
    name: 'VOXAR Pro',
    monthly: { amount: 499900, display: '₹4,999/mo' },    // ₹4,999
    yearly:  { amount: 399900, display: '₹3,999/mo' },    // ₹3,999/mo billed annually = ₹47,988/yr
    yearly_total: 4798800,
  },
}

let razorpayInstance = null

function getRazorpay() {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_id || !key_secret) {
      throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.')
    }
    razorpayInstance = new Razorpay({ key_id, key_secret })
  }
  return razorpayInstance
}

// ============================================================
// Plan Management
// ============================================================

/**
 * Create a Razorpay Plan (run once per plan during setup).
 * Plans are created on Razorpay's side and referenced by plan_id.
 */
async function createRazorpayPlan(planKey, period = 'monthly') {
  const rz = getRazorpay()
  const planDef = RAZORPAY_PLANS[planKey]
  if (!planDef) throw new Error(`Unknown plan: ${planKey}`)

  const isYearly = period === 'yearly'
  const amount = isYearly ? planDef.yearly_total : planDef[period].amount

  const plan = await rz.plans.create({
    period: isYearly ? 'yearly' : 'monthly',
    interval: 1,
    item: {
      name: `${planDef.name} (${isYearly ? 'Annual' : 'Monthly'})`,
      amount,
      currency: 'INR',
      description: `VOXAR ${planKey} plan - ${isYearly ? 'annual' : 'monthly'} billing`,
    },
  })

  return plan
}

/**
 * Get plan details for display
 */
function getPlanDetails(planKey, period = 'monthly') {
  const planDef = RAZORPAY_PLANS[planKey]
  if (!planDef) return null

  const isYearly = period === 'yearly'
  return {
    plan: planKey,
    name: planDef.name,
    period,
    amount: isYearly ? planDef.yearly_total : planDef[period].amount,
    monthly_display: planDef[period].display,
    currency: 'INR',
    savings: isYearly ? `Save ${Math.round((1 - planDef.yearly.amount / planDef.monthly.amount) * 100)}%` : null,
  }
}

// ============================================================
// Customer Management
// ============================================================

async function createCustomer({ name, email, contact }) {
  const rz = getRazorpay()
  return rz.customers.create({
    name,
    email,
    contact: contact || '',
    fail_existing: 0,  // Return existing customer if email matches
  })
}

// ============================================================
// Subscription Management
// ============================================================

/**
 * Create a Razorpay subscription for a user
 */
async function createSubscription({ razorpayPlanId, customerId, totalCount, notes }) {
  const rz = getRazorpay()

  const subscriptionParams = {
    plan_id: razorpayPlanId,
    total_count: totalCount || 12,  // Default 12 billing cycles
    customer_notify: 1,
  }

  if (customerId) {
    subscriptionParams.customer_id = customerId
  }

  if (notes) {
    subscriptionParams.notes = notes
  }

  return rz.subscriptions.create(subscriptionParams)
}

/**
 * Fetch subscription details from Razorpay
 */
async function fetchSubscription(subscriptionId) {
  const rz = getRazorpay()
  return rz.subscriptions.fetch(subscriptionId)
}

/**
 * Cancel a subscription
 * @param {boolean} cancelAtCycleEnd - if true, cancel at end of current billing period
 */
async function cancelSubscription(subscriptionId, cancelAtCycleEnd = true) {
  const rz = getRazorpay()
  return rz.subscriptions.cancel(subscriptionId, cancelAtCycleEnd)
}

/**
 * Pause a subscription
 */
async function pauseSubscription(subscriptionId) {
  const rz = getRazorpay()
  return rz.subscriptions.pause(subscriptionId, { pause_initiated_by: 'customer' })
}

/**
 * Resume a paused subscription
 */
async function resumeSubscription(subscriptionId) {
  const rz = getRazorpay()
  return rz.subscriptions.resume(subscriptionId, { resume_initiated_by: 'customer' })
}

// ============================================================
// Payment Verification
// ============================================================

/**
 * Verify Razorpay payment signature (for checkout callback)
 */
function verifyPaymentSignature({ razorpay_payment_id, razorpay_subscription_id, razorpay_signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  const body = razorpay_payment_id + '|' + razorpay_subscription_id
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return expectedSignature === razorpay_signature
}

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET not configured')

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return expectedSignature === signature
}

// ============================================================
// Invoice / Payment Fetch
// ============================================================

async function fetchPayments(subscriptionId) {
  const rz = getRazorpay()
  // Fetch payments for a subscription
  return rz.subscriptions.fetchPayments(subscriptionId)
}

async function fetchPayment(paymentId) {
  const rz = getRazorpay()
  return rz.payments.fetch(paymentId)
}

module.exports = {
  RAZORPAY_PLANS,
  getRazorpay,
  createRazorpayPlan,
  getPlanDetails,
  createCustomer,
  createSubscription,
  fetchSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPayments,
  fetchPayment,
}
