// Stripe Test Utilities
// Use these functions to test Stripe integration locally

import Stripe from 'stripe'

/**
 * Initialize Stripe client with test key
 */
export function initializeStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not found in env vars')
  }
  return new Stripe(secretKey)
}

/**
 * Create a test customer
 */
export async function createTestCustomer(email: string) {
  const stripe = initializeStripeClient()
  return await stripe.customers.create({
    email,
    description: `Test customer for ${email}`,
    metadata: {
      test: 'true',
    },
  })
}

/**
 * Create a test checkout session for Pro plan
 */
export async function createTestCheckoutSession(customerId: string) {
  const stripe = initializeStripeClient()
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID

  if (!proPriceId) {
    throw new Error('STRIPE_PRO_PRICE_ID not found in env vars')
  }

  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: proPriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: 'http://localhost:3000/dashboard/settings?success=true',
    cancel_url: 'http://localhost:3000/dashboard/settings?cancel=true',
  })
}

/**
 * Simulate checkout completion (webhook)
 * This is what would normally come from Stripe webhook
 */
export async function simulateCheckoutCompletion(sessionId: string) {
  const stripe = initializeStripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    type: 'checkout.session.completed',
    data: {
      object: session,
    },
  }
}

/**
 * List test customers
 */
export async function listTestCustomers() {
  const stripe = initializeStripeClient()
  return await stripe.customers.list({
    limit: 10,
  })
}

/**
 * Get customer subscriptions
 */
export async function getCustomerSubscriptions(customerId: string) {
  const stripe = initializeStripeClient()
  return await stripe.subscriptions.list({
    customer: customerId,
    limit: 10,
  })
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripe = initializeStripeClient()
  return await stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Get payment methods for customer
 */
export async function getPaymentMethods(customerId: string) {
  const stripe = initializeStripeClient()
  return await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })
}

/**
 * Run full test flow
 */
export async function runFullTestFlow() {
  console.log('🧪 Starting Stripe Integration Test...\n')

  try {
    // 1. Create customer
    console.log('1️⃣  Creating test customer...')
    const customer = await createTestCustomer('test@voyai.dev')
    console.log(`✅ Customer created: ${customer.id}\n`)

    // 2. Create checkout session
    console.log('2️⃣  Creating checkout session...')
    const session = await createTestCheckoutSession(customer.id)
    console.log(`✅ Checkout URL: ${session.url}\n`)

    // 3. List subscriptions (should be empty initially)
    console.log('3️⃣  Listing subscriptions (before payment)...')
    const subs = await getCustomerSubscriptions(customer.id)
    console.log(`✅ Subscriptions found: ${subs.data.length}\n`)

    // 4. Simulate test card
    console.log('⏳ In real scenario, user would:')
    console.log('   1. Click checkout URL')
    console.log('   2. Enter test card: 4242 4242 4242 4242')
    console.log('   3. Complete payment\n')

    // 5. After payment, check new subscriptions
    console.log('5️⃣  Listing subscriptions (after payment)...')
    const subsAfter = await getCustomerSubscriptions(customer.id)
    console.log(`✅ Subscriptions found: ${subsAfter.data.length}\n`)

    if (subsAfter.data.length > 0) {
      console.log('✅ TEST PASSED - Subscription created!\n')
      return {
        success: true,
        customerId: customer.id,
        subscriptionId: subsAfter.data[0].id,
      }
    } else {
      console.log('⚠️  No subscription found - payment may not have completed\n')
      return {
        success: false,
        customerId: customer.id,
        message: 'Complete payment in browser to proceed',
      }
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error)
    throw error
  }
}

/**
 * Test webhook event handling
 */
export async function testWebhookEvent(eventType: string, customerId: string) {
  console.log(`\n🔔 Testing webhook: ${eventType}`)

  switch (eventType) {
    case 'checkout.session.completed': {
      const customer = await createTestCustomer(`webhook-test-${Date.now()}@voyai.dev`)
      const session = await createTestCheckoutSession(customer.id)
      console.log(`✅ Mock event: Session ${session.id} completed`)
      return { session, customer }
    }

    case 'customer.subscription.updated': {
      const subs = await getCustomerSubscriptions(customerId)
      if (subs.data.length > 0) {
        console.log(`✅ Mock event: Subscription ${subs.data[0].id} updated`)
        return subs.data[0]
      } else {
        console.log('⚠️  No subscriptions found for customer')
        return null
      }
    }

    case 'customer.subscription.deleted': {
      const subs = await getCustomerSubscriptions(customerId)
      if (subs.data.length > 0) {
        const subId = subs.data[0].id
        const cancelled = await cancelSubscription(subId)
        console.log(`✅ Mock event: Subscription ${subId} cancelled`)
        return cancelled
      } else {
        console.log('⚠️  No subscriptions found to cancel')
        return null
      }
    }

    default:
      console.log(`❓ Unknown event type: ${eventType}`)
      return null
  }
}

// ============================================================================
// CLI Test Commands
// ============================================================================

if (require.main === module) {
  const command = process.argv[2]

  switch (command) {
    case 'test:full':
      runFullTestFlow().catch(console.error)
      break

    case 'test:webhook':
      const eventType = process.argv[3] || 'checkout.session.completed'
      const customerId = process.argv[4]
      testWebhookEvent(eventType, customerId).catch(console.error)
      break

    case 'list:customers':
      listTestCustomers()
        .then((customers) => console.log(JSON.stringify(customers.data, null, 2)))
        .catch(console.error)
      break

    default:
      console.log(`
Available commands:
  - npm run test:stripe test:full
  - npm run test:stripe test:webhook <event> [customerId]
  - npm run test:stripe list:customers

Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
      `)
  }
}
