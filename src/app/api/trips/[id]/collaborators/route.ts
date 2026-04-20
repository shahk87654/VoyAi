// Trip collaboration - add/remove collaborators
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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
    const { tripId, collaboratorEmail, role = 'viewer' } = body

    if (!tripId || !collaboratorEmail) {
      return NextResponse.json(
        { error: 'tripId and collaboratorEmail required' },
        { status: 400 }
      )
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check Pro feature
    if (currentUser.plan === 'FREE') {
      return NextResponse.json(
        { error: 'Collaboration requires Pro plan' },
        { status: 403 }
      )
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip || trip.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Trip not found or unauthorized' },
        { status: 404 }
      )
    }

    // Find collaborator user
    const collaborator = await prisma.user.findUnique({
      where: { email: collaboratorEmail },
    })

    if (!collaborator) {
      return NextResponse.json(
        { error: 'Collaborator not found' },
        { status: 404 }
      )
    }

    // Add as collaborator
    const collaboration = await prisma.tripCollaborator.upsert({
      where: {
        tripId_userId: {
          tripId,
          userId: collaborator.id,
        },
      },
      update: { role },
      create: {
        tripId,
        userId: collaborator.id,
        role,
      },
    })

    // TODO: Send email invitation to collaborator

    return NextResponse.json({
      success: true,
      collaboration,
    })
  } catch (error) {
    console.error('Collaboration error:', error)
    return NextResponse.json(
      { error: 'Failed to add collaborator' },
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
    const { tripId, collaboratorId } = body

    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip || trip.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Trip not found or unauthorized' },
        { status: 404 }
      )
    }

    // Remove collaborator
    await prisma.tripCollaborator.delete({
      where: {
        tripId_userId: {
          tripId,
          userId: collaboratorId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove collaborator error:', error)
    return NextResponse.json(
      { error: 'Failed to remove collaborator' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tripId = searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json({ error: 'tripId required' }, { status: 400 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify trip access (owner or collaborator)
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const isOwner = trip.userId === currentUser.id
    const isCollaborator = await prisma.tripCollaborator.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: currentUser.id,
        },
      },
    })

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get all collaborators
    const collaborators = await prisma.tripCollaborator.findMany({
      where: { tripId },
      include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
    })

    return NextResponse.json({
      collaborators: collaborators.map((c) => ({
        id: c.user.id,
        email: c.user.email,
        name: c.user.name,
        avatar: c.user.avatarUrl,
        role: c.role,
      })),
    })
  } catch (error) {
    console.error('Get collaborators error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collaborators' },
      { status: 500 }
    )
  }
}
