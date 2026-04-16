/**
 * Mapbox API Service
 * Centralized service for all Mapbox API integrations
 */

export interface MapboxConfig {
  accessToken: string
  baseUrl?: string
}

export interface GeocodingResult {
  id: string
  name: string
  place_name: string
  bbox?: number[]
  center: [number, number]
  place_type: string[]
  relevance: number
  properties?: Record<string, any>
}

export interface SearchBoxResult {
  id: string
  name: string
  description?: string
  features: Array<{
    id: string
    type: string
    place_name: string
    center: [number, number]
    bbox?: number[]
    maki?: string
    properties?: Record<string, any>
  }>
}

export interface DirectionsResult {
  code: string
  routes: Array<{
    distance: number
    duration: number
    geometry: {
      coordinates: [number, number][]
      type: string
    }
    legs: Array<{
      distance: number
      duration: number
      steps: any[]
    }>
  }>
  waypoints: Array<{
    name: string
    location: [number, number]
  }>
}

export interface IsochroneResult {
  type: string
  features: Array<{
    type: string
    properties: {
      contour: number
      fill_extrude_height?: number
    }
    geometry: {
      type: string
      coordinates: [number, number][][]
    }
  }>
}

export interface MatrixResult {
  code: string
  durations: number[][]
  distances: number[][]
  sources: Array<{
    name: string
    location: [number, number]
  }>
  destinations: Array<{
    name: string
    location: [number, number]
  }>
}

export interface StaticImageOptions {
  username: string
  styleId: string
  coordinates: [number, number]
  zoom: number
  width: number
  height: number
  bearing?: number
  pitch?: number
  markers?: Array<{
    lng: number
    lat: number
    label?: string
    color?: string
  }>
  style?: 'default' | 'marker' | 'pin'
  retina?: boolean
}

type GeocodingProfile = 'mapbox.places' | 'mapbox.places-permanent'
type DirectionsProfile = 'driving-traffic' | 'driving' | 'walking' | 'cycling'
type IsochroneProfile = 'driving-traffic' | 'driving' | 'walking' | 'cycling'

class MapboxService {
  private accessToken: string
  private baseUrl: string = 'https://api.mapbox.com'

  constructor(accessToken: string) {
    this.accessToken = accessToken
    if (!accessToken) {
      throw new Error('Mapbox access token is required')
    }
  }

  /**
   * Geocoding API v6 - Forward geocoding
   * Convert address/location name to coordinates
   */
  async geocodingForward(
    query: string,
    options?: {
      proximity?: [number, number]
      country?: string
      limit?: number
      types?: string[]
    }
  ): Promise<GeocodingResult[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        access_token: this.accessToken,
      })

      if (options?.proximity) {
        params.append('proximity', options.proximity.join(','))
      }
      if (options?.country) {
        params.append('country', options.country)
      }
      if (options?.limit) {
        params.append('limit', options.limit.toString())
      }
      if (options?.types) {
        params.append('types', options.types.join(','))
      }

      const response = await fetch(
        `${this.baseUrl}/search/geocode/v6/forward?${params}`
      )

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      return data.features || []
    } catch (error) {
      console.error('Geocoding forward error:', error)
      throw error
    }
  }

  /**
   * Geocoding API v6 - Reverse geocoding
   * Convert coordinates to address/location name
   */
  async geocodingReverse(
    lng: number,
    lat: number,
    options?: {
      limit?: number
      types?: string[]
    }
  ): Promise<GeocodingResult[]> {
    try {
      const params = new URLSearchParams({
        longitude: lng.toString(),
        latitude: lat.toString(),
        access_token: this.accessToken,
      })

      if (options?.limit) {
        params.append('limit', options.limit.toString())
      }
      if (options?.types) {
        params.append('types', options.types.join(','))
      }

      const response = await fetch(
        `${this.baseUrl}/search/geocode/v6/reverse?${params}`
      )

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      return data.features || []
    } catch (error) {
      console.error('Geocoding reverse error:', error)
      throw error
    }
  }

  /**
   * Search Box API v1 - Forward search with suggestions
   * Best for autocomplete and POI search
   */
  async searchBoxForward(
    query: string,
    options?: {
      proximity?: [number, number]
      limit?: number
      country?: string
      language?: string
    }
  ): Promise<SearchBoxResult['features']> {
    try {
      const params = new URLSearchParams({
        q: query,
        access_token: this.accessToken,
      })

      if (options?.proximity) {
        params.append('proximity', options.proximity.join(','))
      }
      if (options?.limit) {
        params.append('limit', options.limit.toString())
      }
      if (options?.country) {
        params.append('country', options.country)
      }
      if (options?.language) {
        params.append('language', options.language)
      }

      const response = await fetch(
        `${this.baseUrl}/search/searchbox/v1/forward?${params}`
      )

      if (!response.ok) {
        throw new Error(`Search Box API error: ${response.status}`)
      }

      const data = await response.json()
      return data.features || []
    } catch (error) {
      console.error('Search Box forward error:', error)
      throw error
    }
  }

  /**
   * Search Box API v1 - Suggest endpoint
   * Real-time suggestions as user types
   */
  async searchBoxSuggest(
    query: string,
    options?: {
      proximity?: [number, number]
      limit?: number
      country?: string
      types?: string[]
    }
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        access_token: this.accessToken,
      })

      if (options?.proximity) {
        params.append('proximity', options.proximity.join(','))
      }
      if (options?.limit) {
        params.append('limit', options.limit.toString())
      }
      if (options?.country) {
        params.append('country', options.country)
      }
      if (options?.types) {
        params.append('types', options.types.join(','))
      }

      const response = await fetch(
        `${this.baseUrl}/search/searchbox/v1/suggest?${params}`
      )

      if (!response.ok) {
        throw new Error(`Search Box suggest error: ${response.status}`)
      }

      const data = await response.json()
      return data.suggestions || []
    } catch (error) {
      console.error('Search Box suggest error:', error)
      throw error
    }
  }

  /**
   * Directions API v5 - Route planning and travel times
   */
  async directions(
    coordinates: [number, number][],
    profile: DirectionsProfile = 'walking',
    options?: {
      alternatives?: boolean
      steps?: boolean
      geometries?: 'geojson' | 'polyline' | 'polyline6'
      overview?: 'full' | 'simplified' | 'false'
      continue_straight?: boolean
    }
  ): Promise<DirectionsResult> {
    try {
      if (coordinates.length < 2) {
        throw new Error('At least 2 coordinates are required')
      }

      const coordString = coordinates.map((c) => c.join(',')).join(';')
      const params = new URLSearchParams({
        access_token: this.accessToken,
        geometries: options?.geometries || 'geojson',
        overview: options?.overview || 'full',
        steps: (options?.steps ?? true).toString(),
      })

      if (options?.alternatives !== undefined) {
        params.append('alternatives', options.alternatives.toString())
      }
      if (options?.continue_straight !== undefined) {
        params.append('continue_straight', options.continue_straight.toString())
      }

      const response = await fetch(
        `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordString}?${params}`
      )

      if (!response.ok) {
        throw new Error(`Directions API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Directions API error:', error)
      throw error
    }
  }

  /**
   * Get travel time between two points
   * Convenience wrapper for directions API
   */
  async getTravelTime(
    from: [number, number],
    to: [number, number],
    profile: DirectionsProfile = 'walking'
  ): Promise<{ distance: number; duration: number }> {
    try {
      const result = await this.directions([from, to], profile)

      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0]
        return {
          distance: route.distance,
          duration: route.duration,
        }
      }

      throw new Error('No routes found')
    } catch (error) {
      console.error('Get travel time error:', error)
      throw error
    }
  }

  /**
   * Isochrone API - Reachability analysis
   * Show areas reachable within specified time/distance
   */
  async isochrone(
    coordinates: [number, number],
    profile: IsochroneProfile = 'walking',
    options?: {
      contours?: number[] // minutes for walking/cycling, minutes for driving
      polygons?: boolean
      denoise?: number // 0.0 to 1.0
    }
  ): Promise<IsochroneResult> {
    try {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        contours_minutes: (options?.contours || [5, 10, 15]).join(','),
      })

      if (options?.polygons !== undefined) {
        params.append('polygons', options.polygons.toString())
      }
      if (options?.denoise !== undefined) {
        params.append('denoise', options.denoise.toString())
      }

      const coordString = coordinates.join(',')
      const response = await fetch(
        `${this.baseUrl}/isochrone/v1/mapbox/${profile}/${coordString}?${params}`
      )

      if (!response.ok) {
        throw new Error(`Isochrone API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Isochrone API error:', error)
      throw error
    }
  }

  /**
   * Matrix API - Travel times between multiple points
   * Calculate all travel times at once
   */
  async matrix(
    coordinates: [number, number][],
    profile: DirectionsProfile = 'walking',
    options?: {
      sources?: number[] // indices of source points
      destinations?: number[] // indices of destination points
    }
  ): Promise<MatrixResult> {
    try {
      if (coordinates.length < 2) {
        throw new Error('At least 2 coordinates are required')
      }

      const coordString = coordinates.map((c) => c.join(',')).join(';')
      const params = new URLSearchParams({
        access_token: this.accessToken,
      })

      if (options?.sources) {
        params.append('sources', options.sources.join(';'))
      }
      if (options?.destinations) {
        params.append('destinations', options.destinations.join(';'))
      }

      const response = await fetch(
        `${this.baseUrl}/directions-matrix/v1/mapbox/${profile}/${coordString}?${params}`
      )

      if (!response.ok) {
        throw new Error(`Matrix API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Matrix API error:', error)
      throw error
    }
  }

  /**
   * Static Images API - Generate map images
   * Useful for previews, PDF export, social sharing
   */
  async staticImage(
    options: StaticImageOptions
  ): Promise<string> {
    try {
      const { username, styleId, coordinates, zoom, width, height } = options

      // Build overlay string for markers
      let overlay = ''
      if (options.markers && options.markers.length > 0) {
        const markerStrings = options.markers.map((m) => {
          const color = m.color ? encodeURIComponent(m.color) : 'FF0000'
          const label = m.label ? encodeURIComponent(m.label) : ''
          return `pin-s-${label}+${color}(${m.lng},${m.lat})`
        })
        overlay = markerStrings.join(',') + '/'
      }

      const position = `${coordinates[0]},${coordinates[1]},${zoom}`
      const bearing = options.bearing || 0
      const pitch = options.pitch || 0
      const size = `${width}x${height}`
      const retina = options.retina ? '@2x' : ''

      const url = `${this.baseUrl}/styles/v1/${username}/${styleId}/static/${overlay}${position},${bearing},${pitch}/${size}${retina}?access_token=${this.accessToken}`

      return url
    } catch (error) {
      console.error('Static Image API error:', error)
      throw error
    }
  }
}

export default MapboxService
