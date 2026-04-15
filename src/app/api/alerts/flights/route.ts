import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination, targetPrice, email, departureDate } = body

    if (!origin || !destination || !targetPrice || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let alert = null
    
    try {
      // Create price alert in database
      alert = await prisma.flightPriceAlert.create({
        data: {
          origin,
          destination,
          targetPrice,
          email,
          departureDate: departureDate ? new Date(departureDate) : undefined,
          isActive: true,
        },
      })
    } catch (dbError) {
      console.warn('Database error creating alert, using mock:', dbError)
      // Return mock alert for development
      alert = {
        id: `alert-${Date.now()}`,
        origin,
        destination,
        targetPrice,
        email,
        departureDate: departureDate ? new Date(departureDate) : null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Error creating flight alert:', error)
    return NextResponse.json(
      { error: 'Failed to create price alert' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    let alerts: any[] = []
    
    try {
      alerts = await prisma.flightPriceAlert.findMany({
        where: { email, isActive: true },
        orderBy: { createdAt: 'desc' },
      })
    } catch (dbError) {
      console.warn('Database error fetching alerts, using mock:', dbError)
      // Return mock empty alerts for development
      alerts = []
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { alertId } = await request.json()

    try {
      await prisma.flightPriceAlert.update({
        where: { id: alertId },
        data: { isActive: false },
      })
    } catch (dbError) {
      console.warn('Database error deleting alert, continuing anyway:', dbError)
      // Still return success even if DB fails for development
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
