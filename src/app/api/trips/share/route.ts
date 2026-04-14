import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId, expiresIn = 7 } = body

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID required' },
        { status: 400 }
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
      include: { trip: true },
    })

    if (!share || share.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Share link expired or not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(share.trip)
  } catch (error) {
    console.error('Error fetching shared trip:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    )
  }
}
