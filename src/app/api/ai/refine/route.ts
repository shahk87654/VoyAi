import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId, message, itinerary } = body

    if (!tripId || !message) {
      return NextResponse.json(
        { error: 'Missing tripId or message' },
        { status: 400 }
      )
    }

    // Get the trip itinerary
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    const itineraryText = itinerary || (trip.aiItinerary ? JSON.stringify(trip.aiItinerary) : '')

    // Use Claude to refine the itinerary
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: `You are a helpful travel assistant. You're helping refine a trip itinerary based on user feedback. 
      
Current itinerary:
${itineraryText}

Respond with specific, actionable changes to the itinerary. Format your response as JSON with the following structure:
{
  "suggestions": ["suggestion 1", "suggestion 2"],
  "updatedItinerary": {...updated itinerary object},
  "reasoning": "explanation of changes"
}`,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    })

    const assistantMessage = response.content[0]?.type === 'text' ? response.content[0].text : ''

    // Save chat history
    await prisma.tripChatMessage.create({
      data: {
        tripId,
        role: 'user',
        content: message,
      },
    })

    await prisma.tripChatMessage.create({
      data: {
        tripId,
        role: 'assistant',
        content: assistantMessage,
      },
    })

    return NextResponse.json({
      message: assistantMessage,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Error refining itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to refine itinerary' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const tripId = request.nextUrl.searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID required' },
        { status: 400 }
      )
    }

    const messages = await prisma.tripChatMessage.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    )
  }
}
