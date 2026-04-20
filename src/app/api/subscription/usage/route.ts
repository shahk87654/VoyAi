// Track plan usage (increment trip count)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PLAN_FEATURES } from '@/types/subscription'

const usageSchema = z.object({
  type: z.enum(['trip_generation', 'trip_save']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const body = await request.json()
    const { type } = usageSchema.parse(body)

    // Get user
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { trips: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check Monthly Reset
    const now = new Date()
    const lastReset = new Date(dbUser.lastResetAt)
    const shouldReset =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()

    let currentCount = dbUser.aiPlansThisMonth
    let currentTripsCount = dbUser.tripsThisMonth
    let lastResetDate = dbUser.lastResetAt

    if (shouldReset) {
      currentCount = 0
      currentTripsCount = 0
      lastResetDate = now
    }

    // Check limits based on usage type
    if (type === 'trip_generation') {
      const limit = PLAN_FEATURES[dbUser.plan].aiPlansPerMonth
      
      // -1 means unlimited
      if (limit !== -1 && currentCount >= limit) {
        return NextResponse.json(
          {
            error: 'Monthly AI plan limit reached',
            plan: dbUser.plan,
            limit,
            used: currentCount,
            resetDate: getNextResetDate(lastResetDate),
          },
          { status: 429 }
        )
      }

      // Increment AI plan count
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          aiPlansThisMonth: currentCount + 1,
          lastResetAt: lastResetDate,
        },
      })

      return NextResponse.json({
        success: true,
        type: 'trip_generation',
        newCount: currentCount + 1,
        limit,
      })
    }

    if (type === 'trip_save') {
      const limit = PLAN_FEATURES[dbUser.plan].maxSavedTrips
      
      // Check monthly trip count limit
      if (limit !== -1 && currentTripsCount >= limit) {
        return NextResponse.json(
          {
            error: 'Trip save limit reached this month',
            plan: dbUser.plan,
            limit,
            used: currentTripsCount,
            resetDate: getNextResetDate(lastResetDate),
          },
          { status: 429 }
        )
      }

      // Increment trip save count
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          tripsThisMonth: currentTripsCount + 1,
          lastResetAt: lastResetDate,
        },
      })

      return NextResponse.json({
        success: true,
        type: 'trip_save',
        newCount: currentTripsCount + 1,
        limit,
      })
    }

    return NextResponse.json({ error: 'Invalid usage type' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Usage tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}

function getNextResetDate(lastResetAt: Date): Date {
  const next = new Date(lastResetAt)
  next.setMonth(next.getMonth() + 1)
  return next
}
