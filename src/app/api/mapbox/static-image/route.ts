import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import MapboxService from '@/lib/mapbox-service'
import { z } from 'zod'

/**
 * Static Images API - generate map snapshots
 * POST /api/mapbox/static-image
 * Body: { position: [lng,lat], zoom: 12, width: 400, height: 300, markers?: [...], style?: 'streets'|'outdoors'|'light'|'dark' }
 */

const staticImageSchema = z.object({
  lng: z.number(),
  lat: z.number(),
  zoom: z.number().int().min(0).max(28).optional().default(12),
  width: z.number().int().min(1).max(1280).optional().default(640),
  height: z.number().int().min(1).max(1280).optional().default(480),
  style: z.enum(['streets', 'outdoors', 'light', 'dark', 'satellite']).optional().default('streets'),
  markers: z
    .array(
      z.object({
        lng: z.number(),
        lat: z.number(),
        label: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .optional(),
  path: z
    .array(z.tuple([z.number(), z.number()]))
    .optional(), // Polyline to draw on map
  pathColor: z.string().optional(),
  pathWidth: z.number().optional(),
  bearing: z.number().optional(),
  pitch: z.number().optional(),
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
    const validated = staticImageSchema.parse(body)

    // Initialize service
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: 'Mapbox not configured' },
        { status: 500 }
      )
    }

    const service = new MapboxService(token)

    // Build overlay strings for markers
    let overlays = ''
    if (validated.markers && validated.markers.length > 0) {
      for (const marker of validated.markers) {
        const label = marker.label ? `label-${marker.label}` : 'pin-s'
        const color = marker.color ? `+${marker.color}` : ''
        overlays += `/${label}${color}(${marker.lng},${marker.lat})`
      }
    }

    // Build path if provided
    if (validated.path && validated.path.length > 0) {
      const pathStr = validated.path.map((p) => `${p[0]},${p[1]}`).join(',')
      const color = validated.pathColor ? validated.pathColor : '0000ff'
      const width = validated.pathWidth ? `${validated.pathWidth}` : '2'
      overlays += `/path-${width}+${color}(${pathStr})`
    }

    // Build options
    const options: any = {
      position: {
        center: [validated.lng, validated.lat],
        zoom: validated.zoom,
        bearing: validated.bearing || 0,
        pitch: validated.pitch || 0,
      },
      size: {
        width: validated.width,
        height: validated.height,
      },
      style: validated.style,
      overlays: overlays || undefined,
    }

    // Call Mapbox
    const imageUrl = await service.staticImage(options)

    // Return the image URL for client use
    return NextResponse.json({
      url: imageUrl,
      width: validated.width,
      height: validated.height,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Static image error:', error)
    return NextResponse.json(
      { error: 'Static image generation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for simple map snapshots
 * GET /api/mapbox/static-image?lng=0&lat=0&zoom=12&width=640&height=480
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
    const zoom = parseInt(searchParams.get('zoom') || '12')
    const width = parseInt(searchParams.get('width') || '640')
    const height = parseInt(searchParams.get('height') || '480')
    const style = (searchParams.get('style') || 'streets') as any

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

    // Get static image
    const imageUrl = await service.staticImage({
      position: {
        center: [parseFloat(lng), parseFloat(lat)],
        zoom,
      },
      size: { width, height },
      style,
    })

    // Return the image URL
    return NextResponse.json({
      url: imageUrl,
      width,
      height,
    })
  } catch (error) {
    console.error('Static image error:', error)
    return NextResponse.json(
      { error: 'Static image generation failed' },
      { status: 500 }
    )
  }
}
