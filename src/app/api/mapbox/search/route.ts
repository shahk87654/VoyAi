import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import MapboxService from '@/lib/mapbox-service'
import { z } from 'zod'

/**
 * Search box API
 * POST /api/mapbox/search - forward search (full results)
 * GET /api/mapbox/search?q=query - suggestions (autocomplete)
 */

const searchSchema = z.object({
  query: z.string().min(1, 'Query required'),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  proximity: z.boolean().optional(),
  country: z.string().optional(),
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
    const validated = searchSchema.parse(body)

    // Initialize service
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: 'Mapbox not configured' },
        { status: 500 }
      )
    }

    const service = new MapboxService(token)

    // Call Mapbox forward search
    const options: any = {}
    if (validated.proximity && validated.longitude && validated.latitude) {
      options.proximity = [validated.longitude, validated.latitude]
    }
    if (validated.country) {
      options.country = validated.country
    }

    const result = await service.searchBoxForward(validated.query, options)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
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
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'q (query) parameter required' },
        { status: 400 }
      )
    }

    // Initialize service
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: 'Mapbox not configured' },
        { status: 500 }
      )
    }

    const service = new MapboxService(token)

    // Build options
    const options: any = {}

    const lng = searchParams.get('lng')
    const lat = searchParams.get('lat')
    if (lng && lat) {
      options.proximity = [parseFloat(lng), parseFloat(lat)]
    }

    const country = searchParams.get('country')
    if (country) {
      options.country = country
    }

    // Call Mapbox suggestions
    const result = await service.searchBoxSuggest(query, options)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json(
      { error: 'Suggestions failed' },
      { status: 500 }
    )
  }
}
