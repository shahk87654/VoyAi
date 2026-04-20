import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tripId, expiresIn = 7 } = body

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID required' },
        { status: 400 }
      )
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!trip || trip.userId !== currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check Pro plan for sharing feature
    if (currentUser.plan !== 'PRO' && currentUser.plan !== 'TEAMS') {
      return NextResponse.json(
        { error: 'Sharing requires Pro plan. Upgrade to share trips.' },
        { status: 403 }
      )
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresIn)

    // Create share link in database
    const share = await prisma.tripShare.create({
      data: {
        tripId,
        userId: currentUser.id,
        shareToken,
        expiresAt,
      },
    })

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/trips/${shareToken}`

    return NextResponse.json({
      shareUrl,
      shareToken,
      expiresAt,
    })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Share token required' },
        { status: 400 }
      )
    }

    const share = await prisma.tripShare.findUnique({
      where: { shareToken: token },
      include: {
        trip: {
          include: {
            days: {
              orderBy: { dayNumber: 'asc' },
            },
          },
        },
        user: {
          select: { email: true, id: true },
        },
      },
    })

    if (!share) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      )
    }

    // Check if share has expired
    if (share.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      trip: share.trip,
      sharedBy: share.user.email,
      expiresAt: share.expiresAt,
    })
  } catch (error) {
    console.error('Error fetching shared trip:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { shareToken } = body

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token required' },
        { status: 400 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    // Get share to verify ownership
    const share = await prisma.tripShare.findUnique({
      where: { shareToken },
      include: { trip: true },
    })

    if (!share) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      )
    }

    // Verify that the user owns the trip
    if (share.trip.userId !== currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the share
    await prisma.tripShare.delete({
      where: { shareToken },
    })

    return NextResponse.json({
      success: true,
      message: 'Share link revoked',
    })
  } catch (error) {
    console.error('Error revoking share link:', error)
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    )
  }
}
