import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import MapboxService from '@/lib/mapbox-service'
import { z } from 'zod'

/**
 * Directions API - calculate routes between points
 * POST /api/mapbox/directions
 * Body: { coordinates: [[lng,lat], ...], profile?: 'walking'|'driving'|'cycling', steps?: boolean }
 */

const directionsSchema = z.object({
  coordinates: z
    .array(z.tuple([z.number(), z.number()]))
    .min(2, 'At least 2 coordinates required')
    .max(25, 'Maximum 25 coordinates'),
  profile: z.enum(['walking', 'driving', 'cycling']).optional().default('driving'),
  steps: z.boolean().optional(),
  geometries: z
    .enum(['geojson', 'polyline', 'polyline6'])
    .optional()
    .default('geojson'),
  overview: z.enum(['full', 'simplified', 'false']).optional().default('simplified'),
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
    const validated = directionsSchema.parse(body)

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
    const options = {
      steps: validated.steps,
      geometries: validated.geometries,
      overview: validated.overview,
    }

    // Call Mapbox
    const result = await service.directions(
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

    console.error('Directions error:', error)
    return NextResponse.json(
      { error: 'Directions calculation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for simple travel time queries
 * GET /api/mapbox/directions?from=lng,lat&to=lng,lat&profile=walking
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
    const from = searchParams.get('from')?.split(',').map(Number)
    const to = searchParams.get('to')?.split(',').map(Number)
    const profile = (searchParams.get('profile') || 'walking') as any

    if (!from || !to || from.length !== 2 || to.length !== 2) {
      return NextResponse.json(
        { error: 'from and to must be [lng,lat] format' },
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

    // Get travel time
    const result = await service.getTravelTime(
      [from[0], from[1]],
      [to[0], to[1]],
      profile
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Travel time error:', error)
    return NextResponse.json(
      { error: 'Travel time calculation failed' },
      { status: 500 }
    )
  }
}
