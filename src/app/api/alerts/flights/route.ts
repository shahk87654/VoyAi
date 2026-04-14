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

    // Create price alert in database
    const alert = await prisma.flightPriceAlert.create({
      data: {
        origin,
        destination,
        targetPrice,
        email,
        departureDate: departureDate ? new Date(departureDate) : undefined,
        isActive: true,
      },
    })

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

    const alerts = await prisma.flightPriceAlert.findMany({
      where: { email, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

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

    await prisma.flightPriceAlert.update({
      where: { id: alertId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
