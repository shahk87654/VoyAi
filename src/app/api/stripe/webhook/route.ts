import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      if (session.metadata?.supabaseId) {
        await prisma.user.update({
          where: { supabaseId: session.metadata.supabaseId },
          data: {
            plan: 'PRO',
            stripeCustomerId: session.customer,
            stripeSubId: session.subscription,
          },
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as any
      await prisma.user.updateMany({
        where: { stripeSubId: sub.id },
        data: { plan: 'FREE', stripeSubId: null },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
