import { NextRequest, NextResponse } from 'next/server'
import { searchFlights } from '@/lib/serpapi'
import { searchRatelimit } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().min(1).max(9).default(1),
  cabinClass: z
    .enum(['economy', 'premium_economy', 'business', 'first'])
    .default('economy'),
  currency: z.string().length(3).default('USD'),
})

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await searchRatelimit.limit(user.id)
  if (!success)
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )

  try {
    const params = schema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const flights = await searchFlights({
      ...params,
      adults: Number(params.adults),
    })
    return NextResponse.json({ flights, count: flights.length })
  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json(
      { error: 'Flight search failed' },
      { status: 500 }
    )
  }
}
