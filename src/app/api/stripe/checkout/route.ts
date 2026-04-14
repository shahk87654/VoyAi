import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const priceId =
    plan === 'TEAMS'
      ? process.env.STRIPE_TEAMS_PRICE_ID!
      : process.env.STRIPE_PRO_PRICE_ID!

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })

  const session = await stripe.checkout.sessions.create({
    customer: dbUser?.stripeCustomerId ?? undefined,
    customer_email: dbUser?.stripeCustomerId ? undefined : user.email,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { userId: dbUser?.id ?? '', supabaseId: user.id },
  })

  return NextResponse.json({ url: session.url })
}
