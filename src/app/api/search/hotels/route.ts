import { NextRequest, NextResponse } from 'next/server'
import { searchHotels } from '@/lib/booking'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  city: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().default(2),
  currency: z.string().default('USD'),
  minRating: z.number().min(0).max(10).optional(),
})

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const params = schema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const hotels = await searchHotels({
      ...params,
      adults: Number(params.adults),
    })
    return NextResponse.json({ hotels, count: hotels.length })
  } catch (error) {
    console.error('Hotel search error:', error)
    return NextResponse.json(
      { error: 'Hotel search failed' },
      { status: 500 }
    )
  }
}
