import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import MapboxService from '@/lib/mapbox-service'
import { z } from 'zod'

/**
 * Forward geocoding: convert address to coordinates
 * POST /api/mapbox/geocode
 * Body: { query: string, country?: string, limit?: number }
 *
 * Reverse geocoding: convert coordinates to address
 * GET /api/mapbox/geocode?lng=0&lat=0
 */

const forwardSchema = z.object({
  query: z.string().min(1, 'Query required'),
  country: z.string().optional(),
  limit: z.number().int().min(1).max(10).optional(),
})

const reverseSchema = z.object({
  lng: z.coerce.number(),
  lat: z.coerce.number(),
  limit: z.coerce.number().int().min(1).max(10).optional().default(1),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request
    const body = await request.json()
    const validated = forwardSchema.parse(body)

    // Initialize service
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: 'Mapbox not configured' },
        { status: 500 }
      )
    }

    const service = new MapboxService(token)

    // Call Mapbox
    const result = await service.geocodingForward(validated.query, {
      country: validated.country,
      limit: validated.limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Geocoding failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const lng = searchParams.get('lng')
    const lat = searchParams.get('lat')

    if (!lng || !lat) {
      return NextResponse.json(
        { error: 'lng and lat required' },
        { status: 400 }
      )
    }

    const validated = reverseSchema.parse({
      lng: parseFloat(lng),
      lat: parseFloat(lat),
      limit: searchParams.get('limit'),
    })

    // Initialize service
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: 'Mapbox not configured' },
        { status: 500 }
      )
    }

    const service = new MapboxService(token)

    // Call Mapbox
    const result = await service.geocodingReverse(validated.lng, validated.lat, {
      limit: validated.limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Reverse geocoding error:', error)
    return NextResponse.json(
      { error: 'Reverse geocoding failed' },
      { status: 500 }
    )
  }
}
