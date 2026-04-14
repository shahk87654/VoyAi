import { NextRequest, NextResponse } from 'next/server'
import { anthropic, PLANNER_SYSTEM_PROMPT } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { aiRatelimit } from '@/lib/ratelimit'
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
    // Auth
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Rate limit
    const { success, limit, remaining } = await aiRatelimit.limit(user.id)
    if (!success) {
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

    const body = schema.parse(await req.json())
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    // Plan limit check for free users
    if (dbUser?.plan === 'FREE' && (dbUser.tripsThisMonth ?? 0) >= 3) {
      return NextResponse.json(
        {
          error: 'Free plan limit reached. Upgrade to Pro for unlimited trips.',
        },
        { status: 403 }
      )
    }

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

    // Stream response using Vercel AI SDK pattern
    const stream = await anthropic.messages.stream({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 8000,
      system: PLANNER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    // Increment trip counter
    if (dbUser) {
      await prisma.user.update({
        where: { supabaseId: user.id },
        data: { tripsThisMonth: { increment: 1 } },
      })
    }

    // Return as Server-Sent Events stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
              )
            )
          }
        }
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
  } catch (error) {
    console.error('AI plan error:', error)
    return NextResponse.json(
      { error: 'Planning failed. Please try again.' },
      { status: 500 }
    )
  }
}
