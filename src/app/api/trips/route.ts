import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

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

  const body = await req.json()

  const trip = await prisma.trip.create({
    data: {
      userId: dbUser.id,
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

  return NextResponse.json({ trip }, { status: 201 })
}
