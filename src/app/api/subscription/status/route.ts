// Get user's subscription status
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        trips: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if monthly limit should be reset
    const now = new Date()
    const lastReset = new Date(dbUser.lastResetAt)
    const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                        now.getFullYear() !== lastReset.getFullYear()

    if (shouldReset) {
      // Reset monthly counters
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          aiPlansThisMonth: 0,
          tripsThisMonth: 0,
          lastResetAt: now,
        },
      })
      dbUser.aiPlansThisMonth = 0
      dbUser.tripsThisMonth = 0
      dbUser.lastResetAt = now
    }

    return NextResponse.json({
      plan: dbUser.plan,
      email: dbUser.email,
      name: dbUser.name,
      stripeCustomerId: dbUser.stripeCustomerId,
      aiPlansThisMonth: dbUser.aiPlansThisMonth,
      savedTripsCount: dbUser.tripsThisMonth,
      lastResetAt: dbUser.lastResetAt,
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
