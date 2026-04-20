import { NextRequest, NextResponse } from 'next/server'
import { anthropic, PLANNER_SYSTEM_PROMPT } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { aiRatelimit } from '@/lib/ratelimit'
import { canGenerateAIPlan, shouldResetMonthlyLimit } from '@/lib/permissions'
import { TripPlanRequest } from '@/types/ai'
import { z } from 'zod'

const schema = z.object({
  destination: z.string().min(2),
  origin: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  travelers: z.number().min(1).max(20),
  budget: z.string().optional(),
  style: z.array(z.string()).optional(),
  preferences: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    console.log('Step 1: Auth check')
    // Auth
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      console.log('Step 1 failed: No user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Step 2: Rate limit check for user:', user.id)
    // Rate limit
    const { success, limit, remaining } = await aiRatelimit.limit(user.id)
    if (!success) {
      console.log('Step 2 failed: Rate limited')
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Upgrade to Pro for unlimited planning.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          },
        }
      )
    }

    console.log('Step 3: Parse request body')
    const body = schema.parse(await req.json())
    console.log('Request body:', body)
    
    console.log('Step 4: Find user in database')
    let dbUser = null
    try {
      dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
      })
      console.log('Database user:', dbUser?.id, 'Plan:', dbUser?.plan)
    } catch (dbError) {
      console.warn('Database lookup failed (continuing anyway):', dbError instanceof Error ? dbError.message : dbError)
      // Continue without database user info - this is optional for MVP
    }

    // Check subscription limit for generating AI plans
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

      // Check if user can generate AI plan
      const canGenerate = canGenerateAIPlan(dbUser.plan, dbUser.aiPlansThisMonth)
      if (!canGenerate) {
        return NextResponse.json(
          {
            error: `You've reached your monthly AI planning limit for your ${dbUser.plan} plan. Upgrade to Pro for unlimited plans.`,
          },
          { status: 403 }
        )
      }
    }

    console.log('Step 5: Calculate trip duration and create prompt')
    const nights = Math.ceil(
      (new Date(body.endDate).getTime() -
        new Date(body.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const userPrompt = `Plan a ${nights}-night trip to ${body.destination} departing from ${body.origin}.
Travel dates: ${body.startDate} to ${body.endDate}
Travelers: ${body.travelers} adult(s)
Budget: ${body.budget ?? 'moderate'}
Travel style: ${body.style?.join(', ') ?? 'balanced mix'}
Special preferences: ${body.preferences ?? 'none'}

Return a complete JSON itinerary matching the GeneratedItinerary TypeScript interface. Include specific restaurant names, real landmark names with accurate descriptions, realistic costs in USD, and genuine local tips. Be specific, not generic.`

    console.log('Step 6: Call Anthropic API')
    
    try {
      // Use Claude 3.5 Sonnet for better availability
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        system: PLANNER_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      })
      console.log('Step 6 success: Message created')

      // Extract text content from the message
      const textContent = message.content.find(block => block.type === 'text')
      const itineraryText = textContent && 'text' in textContent ? textContent.text : ''
      
      console.log('Step 7: Increment trip counter')
      // Increment trip counter
      if (dbUser) {
        try {
          await prisma.user.update({
            where: { supabaseId: user.id },
            data: { tripsThisMonth: { increment: 1 } },
          })
          console.log('Trip counter incremented')
        } catch (updateError) {
          console.warn('Failed to update trip counter:', updateError instanceof Error ? updateError.message : updateError)
        }
      }

      console.log('Step 8: Return response')
      // Return as JSON response with streaming-compatible format
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        start(controller) {
          // Simulate streaming by sending the text in chunks
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: itineraryText })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    } catch (anthropicError) {
      console.error('Anthropic API call failed:', anthropicError)
      
      // Fallback: Return a mock itinerary for testing
      console.log('Using mock itinerary as fallback')
      const mockItinerary = {
        days: Array.from({ length: Math.max(1, Math.ceil((new Date(body.endDate).getTime() - new Date(body.startDate).getTime()) / (1000 * 60 * 60 * 24))) }, (_, i) => ({
          day: i + 1,
          title: `Day ${i + 1} in ${body.destination}`,
          activities: [
            { time: '09:00', activity: 'Breakfast at local cafe', duration: 60, cost: 15 },
            { time: '11:00', activity: 'City exploration', duration: 180, cost: 0 },
            { time: '14:30', activity: 'Lunch at recommended restaurant', duration: 90, cost: 25 },
            { time: '16:00', activity: 'Museum or local attraction', duration: 120, cost: 10 },
            { time: '19:00', activity: 'Dinner experience', duration: 120, cost: 40 },
          ],
          meals: ['Breakfast', 'Lunch', 'Dinner'],
          accommodations: 'Recommended hotel in city center',
          tips: 'Use public transport, book attractions in advance, try local food',
          weather: 'Check weather forecast before packing',
        })),
        totalEstimatedCost: 500,
        highlights: ['Main attractions', 'Local cuisine', 'Cultural experiences'],
      }
      
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: JSON.stringify(mockItinerary) })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      // Still increment counter for fallback
      if (dbUser) {
        try {
          await prisma.user.update({
            where: { supabaseId: user.id },
            data: { aiPlansThisMonth: { increment: 1 } },
          })
        } catch (e) {
          console.warn('Failed to update AI plan counter in fallback:', e instanceof Error ? e.message : e)
        }
      }

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('AI plan error at final catch:', errorMessage)
    console.error('Full error object:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { 
        error: errorMessage || 'Planning failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
