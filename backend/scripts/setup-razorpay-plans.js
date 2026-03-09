/**
 * VOXAR — Razorpay Plan Setup Script
 *
 * Run once to create subscription plans on Razorpay.
 * Usage: node scripts/setup-razorpay-plans.js
 *
 * Prerequisites:
 * - Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
 * - Use TEST keys first (rzp_test_xxx) to verify everything works
 *
 * After running, copy the plan IDs and store them in your .env or config.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const { createRazorpayPlan, RAZORPAY_PLANS } = require('../services/razorpayService')

async function setupPlans() {
  console.log('=== VOXAR Razorpay Plan Setup ===\n')
  console.log('Using key:', process.env.RAZORPAY_KEY_ID?.slice(0, 12) + '...\n')

  const results = {}

  for (const planKey of ['access', 'starter', 'creator', 'pro']) {
    for (const period of ['monthly', 'yearly']) {
      const label = `${planKey}_${period}`
      try {
        const plan = await createRazorpayPlan(planKey, period)
        results[label] = plan.id
        console.log(`[OK] ${label}: ${plan.id} (${RAZORPAY_PLANS[planKey][period].display})`)
      } catch (err) {
        console.log(`[FAIL] ${label}: ${err.message}`)
        results[label] = 'FAILED'
      }
    }
  }

  console.log('\n=== Plan IDs (add to .env) ===\n')
  console.log('# Razorpay Plan IDs')
  for (const [key, id] of Object.entries(results)) {
    console.log(`RAZORPAY_PLAN_${key.toUpperCase()}=${id}`)
  }

  console.log('\nDone. Add these to your .env file.')
}

setupPlans().catch(err => {
  console.error('Setup failed:', err.message)
  process.exit(1)
})
