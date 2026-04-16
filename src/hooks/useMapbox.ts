/**
 * React hooks for Mapbox integration
 * Provides easy access to Mapbox APIs with caching and error handling
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import MapboxService from '@/lib/mapbox-service'

/**
 * Initialize Mapbox service with access token from env
 */
export function useMapboxService() {
  const serviceRef = useRef<MapboxService | null>(null)

  if (!serviceRef.current) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set')
    } else {
      serviceRef.current = new MapboxService(token)
    }
  }

  return serviceRef.current
}

/**
 * Hook for geocoding (forward and reverse)
 */
export function useGeocoding() {
  const service = useMapboxService()

  const forward = useCallback(
    async (query: string, options?: any) => {
      if (!service) throw new Error('Mapbox service not initialized')
      return service.geocodingForward(query, options)
    },
    [service]
  )

  const reverse = useCallback(
    async (lng: number, lat: number, options?: any) => {
      if (!service) throw new Error('Mapbox service not initialized')
      return service.geocodingReverse(lng, lat, options)
    },
    [service]
  )

  return { forward, reverse }
}

/**
 * Hook for search box (autocomplete)
 */
export function useSearchBox() {
  const service = useMapboxService()

  const forward = useCallback(
    async (query: string, options?: any) => {
      if (!service) throw new Error('Mapbox service not initialized')
      return service.searchBoxForward(query, options)
    },
    [service]
  )

  const suggest = useCallback(
    async (query: string, options?: any) => {
      if (!service) throw new Error('Mapbox service not initialized')
      return service.searchBoxSuggest(query, options)
    },
    [service]
  )

  return { forward, suggest }
}

/**
 * Hook for directions API
 * Calculates routes and travel times
 */
export function useDirections() {
  const service = useMapboxService()

  const getDirections = useCallback(
    async (coordinates: [number, number][], profile?: any, options?: any) => {
      if (!service) throw new Error('Mapbox service not initialized')
      return service.directions(coordinates, profile, options)
    },
    [service]
  )

  const getTravelTime = useCallback(
    async (from: [number, number], to: [number, number], profile?: any) => {
      if (!service) throw new Error('Mapbox service not initialized')
      return service.getTravelTime(from, to, profile)
    },
    [service]
  )

  return { getDirections, getTravelTime }
}

/**
 * Hook for isochrone API
 * Shows reachable areas
 */
export function useIsochrone() {
  const service = useMapboxService()

  const getIsochrone = useCallback(
    async (
      coordinates: [number, number],
      profile?: any,
      options?: any
    ) => {
      if (!service) throw new Error('Mapbox service not initialized')
      return service.isochrone(coordinates, profile, options)
    },
    [service]
  )

  return { getIsochrone }
}

/**
 * Hook for matrix API
 * Calculate all travel times between points
 */
export function useMatrix() {
  const service = useMapboxService()

  const getMatrix = useCallback(
    async (
      coordinates: [number, number][],
      profile?: any,
      options?: any
    ) => {
      if (!service) throw new Error('Mapbox service not initialized')
      return service.matrix(coordinates, profile, options)
    },
    [service]
  )

  return { getMatrix }
}

/**
 * Hook for static images API
 * Generate map images
 */
export function useStaticImage() {
  const service = useMapboxService()

  const getImageUrl = useCallback(async (options: any) => {
    if (!service) throw new Error('Mapbox service not initialized')
    return service.staticImage(options)
  }, [service])

  return { getImageUrl }
}

/**
 * Hook for location search with debouncing
 * Combines suggest and retrieve for optimal UX
 */
export function useLocationSearch(debounceMs = 300) {
  const { suggest, forward } = useSearchBox()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setLoading(true)
    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await suggest(query)
        setSuggestions(results)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'))
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, suggest, debounceMs])

  return {
    query,
    setQuery,
    suggestions,
    loading,
    error,
  }
}

/**
 * Hook for calculating travel times between activities
 * Useful for itinerary planning
 */
export function useActivityTravelTimes(
  activities: Array<{ name: string; lat: number; lng: number }>
) {
  const { getTravelTime } = useDirections()
  const [travelTimes, setTravelTimes] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (activities.length < 2) return

    const calculateTimes = async () => {
      setLoading(true)
      try {
        const times: number[] = []
        for (let i = 0; i < activities.length - 1; i++) {
          const { duration } = await getTravelTime(
            [activities[i].lng, activities[i].lat],
            [activities[i + 1].lng, activities[i + 1].lat],
            'walking'
          )
          times.push(Math.round(duration / 60)) // Convert to minutes
        }
        setTravelTimes(times)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to calculate times'))
        setTravelTimes([])
      } finally {
        setLoading(false)
      }
    }

    calculateTimes()
  }, [activities, getTravelTime])

  return { travelTimes, loading, error }
}

/**
 * Hook for neighborhood reachability
 * Shows what's reachable from a location
 */
export function useReachability(coordinates: [number, number] | null) {
  const { getIsochrone } = useIsochrone()
  const [reachability, setReachability] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!coordinates) return

    const fetchReachability = async () => {
      setLoading(true)
      try {
        const result = await getIsochrone(coordinates, 'walking', {
          contours: [5, 10, 15],
        })
        setReachability(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch reachability'))
        setReachability(null)
      } finally {
        setLoading(false)
      }
    }

    fetchReachability()
  }, [coordinates, getIsochrone])

  return { reachability, loading, error }
}

/**
 * Hook to optimize activity order using matrix API
 * Finds the shortest path between activities (simple greedy)
 */
export function useOptimizeRoute(
  activities: Array<{ name: string; lat: number; lng: number }>
) {
  const { getMatrix } = useMatrix()
  const [optimized, setOptimized] = useState(activities)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const optimize = useCallback(async () => {
    if (activities.length < 2) return

    setLoading(true)
    try {
      const coordinates: [number, number][] = activities.map((a) => [a.lng, a.lat])
      const result = await getMatrix(coordinates, 'driving')

      // Simple greedy optimization (not true TSP)
      // Just sort by total travel time
      const durations = result.durations[0] || []
      const sorted = activities
        .map((activity, index) => ({
          ...activity,
          travelTime: durations[index] || 0,
        }))
        .sort((a, b) => a.travelTime - b.travelTime)

      setOptimized(sorted)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Optimization failed'))
    } finally {
      setLoading(false)
    }
  }, [activities, getMatrix])

  return { optimized, loading, error, optimize }
}
