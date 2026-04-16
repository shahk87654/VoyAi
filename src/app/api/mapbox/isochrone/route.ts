import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import MapboxService from '@/lib/mapbox-service'
import { z } from 'zod'

/**
 * Isochrone API - show reachable areas
 * POST /api/mapbox/isochrone
 * Body: { coordinates: [lng,lat], profile?: 'walking'|'driving'|'cycling', contours?: number[] }
 */

const isochroneSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
  profile: z.enum(['walking', 'driving', 'cycling']).optional().default('walking'),
  contours: z
    .array(z.number().int().min(1).max(60))
    .optional()
    .default([5, 10, 15]),
  polygons: z.boolean().optional().default(true),
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
    const validated = isochroneSchema.parse(body)

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
      contours: validated.contours.join(','),
      polygons: validated.polygons,
    }

    // Call Mapbox
    const result = await service.isochrone(
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

    console.error('Isochrone error:', error)
    return NextResponse.json(
      { error: 'Isochrone calculation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for quick isochrone queries
 * GET /api/mapbox/isochrone?lng=0&lat=0&profile=walking&contours=5,10,15
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
    const lng = searchParams.get('lng')
    const lat = searchParams.get('lat')
    const profile = (searchParams.get('profile') || 'walking') as any
    const contours = (searchParams.get('contours') || '5,10,15')
      .split(',')
      .map(Number)

    if (!lng || !lat) {
      return NextResponse.json(
        { error: 'lng and lat required' },
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

    // Get isochrone
    const result = await service.isochrone(
      [parseFloat(lng), parseFloat(lat)],
      profile,
      {
        contours: contours.join(','),
        polygons: true,
      }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Isochrone error:', error)
    return NextResponse.json(
      { error: 'Isochrone calculation failed' },
      { status: 500 }
    )
  }
}
