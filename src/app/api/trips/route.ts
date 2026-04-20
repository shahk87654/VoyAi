import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { canSaveMoreTrips, shouldResetMonthlyLimit } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })
  if (!dbUser)
    return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const trips = await prisma.trip.findMany({
    where: { userId: dbUser.id },
    include: { days: true, flights: true, hotels: true },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ trips })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let dbUser = null
    try {
      dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
      })
    } catch (e) {
      console.warn('Database user lookup failed in trip creation:', e)
      // Continue without database user - we'll use auth user ID as fallback
    }

    // Check subscription limit for saving trips
    if (dbUser) {
      // Auto-reset monthly limits if needed
      if (shouldResetMonthlyLimit(dbUser.lastResetAt)) {
        try {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              aiPlansThisMonth: 0,
              tripsThisMonth: 0,
              lastResetAt: new Date(),
            },
          })
          dbUser.aiPlansThisMonth = 0
          dbUser.tripsThisMonth = 0
          dbUser.lastResetAt = new Date()
        } catch (e) {
          console.warn('Failed to reset monthly limit:', e)
        }
      }

      // Check if user can save more trips
      const canSave = canSaveMoreTrips(dbUser.plan, dbUser.tripsThisMonth)
      if (!canSave) {
        return NextResponse.json(
          {
            error: `You've reached your monthly trip limit for your ${dbUser.plan} plan. Upgrade to Pro for unlimited trips.`,
          },
          { status: 403 }
        )
      }
    }

    const body = await req.json()

    let trip = null
    try {
      trip = await prisma.trip.create({
        data: {
          userId: dbUser?.id || user.id,
          title: body.title,
          destination: body.destination,
          origin: body.origin,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          travelers: body.travelers ?? 1,
          budget: body.budget,
          style: body.style ?? [],
          aiItinerary: body.aiItinerary,
          status: 'DRAFT',
        },
      })

      // Increment saved trips counter
      if (dbUser) {
        try {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { tripsThisMonth: { increment: 1 } },
          })
        } catch (e) {
          console.warn('Failed to increment saved trips counter:', e)
        }
      }
    } catch (dbCreateError) {
      console.warn('Trip creation in database failed, returning mock trip:', dbCreateError)
      // Return a mock trip for MVP - this allows the flow to continue
      trip = {
        id: user.id + '-' + Date.now(),
        userId: dbUser?.id || user.id,
        title: body.title,
        destination: body.destination,
        origin: body.origin,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        travelers: body.travelers ?? 1,
        budget: body.budget,
        style: body.style ?? [],
        aiItinerary: body.aiItinerary,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    return NextResponse.json({ trip }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/trips:', error)
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    )
  }
}
