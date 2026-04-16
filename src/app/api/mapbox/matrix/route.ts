import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import MapboxService from '@/lib/mapbox-service'
import { z } from 'zod'

/**
 * Matrix API - calculate travel times between multiple points
 * POST /api/mapbox/matrix
 * Body: { coordinates: [[lng,lat], ...], profile?: 'walking'|'driving'|'cycling' }
 */

const matrixSchema = z.object({
  coordinates: z
    .array(z.tuple([z.number(), z.number()]))
    .min(2, 'At least 2 coordinates required')
    .max(25, 'Maximum 25 coordinates'),
  profile: z.enum(['walking', 'driving', 'cycling']).optional().default('driving'),
  sources: z.array(z.number()).optional(), // Specific indices to use as sources
  destinations: z.array(z.number()).optional(), // Specific indices to use as destinations
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
    const validated = matrixSchema.parse(body)

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
    if (validated.sources) {
      options.sources = validated.sources.join(';')
    }
    if (validated.destinations) {
      options.destinations = validated.destinations.join(';')
    }

    // Call Mapbox
    const result = await service.matrix(
      validated.coordinates,
      validated.profile,
      options
    )

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Matrix error:', error)
    return NextResponse.json(
      { error: 'Matrix calculation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for formatted matrix results
 * GET /api/mapbox/matrix?coords=lng,lat;lng,lat;...&profile=driving
 */
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
    const coordsStr = searchParams.get('coords')
    const profile = (searchParams.get('profile') || 'driving') as any

    if (!coordsStr) {
      return NextResponse.json(
        { error: 'coords parameter required (format: lng,lat;lng,lat;...)' },
        { status: 400 }
      )
    }

    // Parse coordinates
    const coordinates: [number, number][] = coordsStr
      .split(';')
      .map((pair) => {
        const [lng, lat] = pair.split(',').map(Number)
        return [lng, lat] as [number, number]
      })

    if (coordinates.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 coordinates required' },
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

    // Get matrix
    const result = await service.matrix(coordinates, profile)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Matrix error:', error)
    return NextResponse.json(
      { error: 'Matrix calculation failed' },
      { status: 500 }
    )
  }
}
