# Mapbox Integration Guide - React Layer

Complete guide to using the Mapbox API service in React components.

## Overview

The Mapbox integration consists of three layers:

1. **Service Layer** (`src/lib/mapbox-service.ts`) - Direct API calls
2. **React Hooks** (`src/hooks/useMapbox.ts`) - Simplified hooks for components
3. **API Routes** (`src/app/api/mapbox/*`) - Backend authorization & caching
4. **UI Components** (`src/components/map/*`) - Ready-to-use components

## Quick Start

### 1. Location Search

```tsx
import { LocationSearch } from '@/components/map/LocationSearch'
import { useState } from 'react'

export function TripBuilder() {
  const [origin, setOrigin] = useState(null)

  return (
    <LocationSearch
      onSelect={(location) => {
        setOrigin({
          name: location.properties.name,
          lat: location.geometry.coordinates[1],
          lng: location.geometry.coordinates[0],
        })
      }}
      placeholder="Where are you traveling to?"
    />
  )
}
```

### 2. View Travel Times Between Activities

```tsx
import { ActivityTravelTimes, ActivityTimeline } from '@/components/map/ActivityTravelTimes'

export function ItineraryView({ trip }) {
  const activities = trip.days
    .flatMap((day) => day.activities)
    .map((activity) => ({
      name: activity.name,
      lat: activity.latitude,
      lng: activity.longitude,
    }))

  return (
    <div>
      <h2>Your Itinerary</h2>
      <ActivityTimeline activities={activities} />
    </div>
  )
}
```

## Using Hooks Directly

### Geocoding Hook

```tsx
import { useGeocoding } from '@/hooks/useMapbox'

export function SearchBar() {
  const { forward, reverse } = useGeocoding()

  const handleSearch = async (query: string) => {
    const results = await forward(query, { limit: 5 })
    console.log(results.features)
  }

  return <input onChange={(e) => handleSearch(e.target.value)} />
}
```

### Search Box Hook (Autocomplete)

```tsx
import { useSearchBox } from '@/hooks/useMapbox'
import { useState, useEffect } from 'react'

export function ActivitySearch() {
  const { suggest, forward } = useSearchBox()
  const [suggestions, setSuggestions] = useState([])

  const handleSearch = async (query: string) => {
    // Get autocomplete suggestions
    const results = await suggest(query)
    setSuggestions(results.suggestions)

    // When user clicks a suggestion, get full details
    const full = await forward(query)
    console.log(full.features[0])
  }

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {suggestions.map((s) => (
        <div key={s.id}>{s.name}</div>
      ))}
    </div>
  )
}
```

### Directions Hook

```tsx
import { useDirections } from '@/hooks/useMapbox'
import { useEffect, useState } from 'react'

export function RoutePlanner() {
  const { getDirections, getTravelTime } = useDirections()
  const [route, setRoute] = useState(null)

  const handlePlanRoute = async () => {
    // Get full route with turn-by-turn directions
    const result = await getDirections(
      [
        [0, 0], // Start
        [1, 1], // End
      ],
      'walking',
      { steps: true }
    )
    setRoute(result.routes[0])

    // OR just get travel time quickly
    const time = await getTravelTime([0, 0], [1, 1], 'walking')
    console.log(`Travel time: ${time.duration} seconds`)
  }

  return (
    <button onClick={handlePlanRoute}>
      Plan Route ({route?.duration} minutes)
    </button>
  )
}
```

### Isochrone Hook (Reachability)

```tsx
import { useReachability } from '@/hooks/useMapbox'
import { useEffect } from 'react'

export function NeighborhoodView({ lat, lng }) {
  const { reachability, loading } = useReachability([lng, lat])

  // reachability.features contains polygons showing:
  // - What's reachable in 5 minutes
  // - What's reachable in 10 minutes
  // - What's reachable in 15 minutes

  return (
    <div>
      {loading ? 'Loading reachability...' : 'Show map with isochrone layers'}
    </div>
  )
}
```

### Matrix Hook (Multi-point Travel Times)

```tsx
import { useOptimizeRoute } from '@/hooks/useMapbox'

export function RouteOptimizer({ activities }) {
  const { optimized, loading, optimize } = useOptimizeRoute(activities)

  useEffect(() => {
    optimize()
  }, [activities])

  return (
    <div>
      <h3>Optimized Route Order:</h3>
      {optimized.map((activity, i) => (
        <div key={i}>
          {i + 1}. {activity.name} ({activity.travelTime}s to next)
        </div>
      ))}
    </div>
  )
}
```

## API Routes Reference

### Geocoding
```bash
# Forward: address -> coordinates
POST /api/mapbox/geocode
Content-Type: application/json
{ "query": "Times Square, NYC", "limit": 5 }

# Reverse: coordinates -> address
GET /api/mapbox/geocode?lng=40.758&lat=-73.9855
```

### Search Box
```bash
# Full search results
POST /api/mapbox/search
{ "query": "coffee shop", "lng": 40.758, "lat": -73.9855 }

# Autocomplete suggestions
GET /api/mapbox/search?q=coffee&lng=40.758&lat=-73.9855
```

### Directions
```bash
# Full route with turn-by-turn
POST /api/mapbox/directions
{
  "coordinates": [[0,0], [1,1], [2,2]],
  "profile": "walking",
  "steps": true
}

# Quick travel time
GET /api/mapbox/directions?from=0,0&to=1,1&profile=walking
```

### Isochrone
```bash
# Show reachable areas
POST /api/mapbox/isochrone
{
  "coordinates": [0, 0],
  "profile": "driving",
  "contours": [5, 10, 15]
}

# Quick query
GET /api/mapbox/isochrone?lng=0&lat=0&profile=walking&contours=5,10,15
```

### Matrix
```bash
# Travel times between all points
POST /api/mapbox/matrix
{
  "coordinates": [[0,0], [1,1], [2,2], [3,3]],
  "profile": "driving"
}

# Query format
GET /api/mapbox/matrix?coords=0,0;1,1;2,2;3,3&profile=driving
```

### Static Images
```bash
# Generate map snapshot
POST /api/mapbox/static-image
{
  "lng": 0,
  "lat": 0,
  "zoom": 12,
  "width": 640,
  "height": 480,
  "markers": [
    { "lng": 0, "lat": 0, "label": "A", "color": "ff0000" }
  ]
}

# Quick screenshot
GET /api/mapbox/static-image?lng=0&lat=0&zoom=12&width=640&height=480
```

All endpoints return:
```json
{ "url": "image-or-data-url" }  // For static images
// OR
{ "features": [...] }           // For geocoding/search
// OR
{ "routes": [...] }             // For directions
// OR
{ "durations": [[...]] }        // For matrix
```

## Component Examples

### Simple Activity Card with Travel Time

```tsx
import { ActivityTravelTimes } from '@/components/map/ActivityTravelTimes'

export function ActivityCard({ activity, nextActivity }) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{activity.name}</h3>
      <p>{activity.description}</p>

      <ActivityTravelTimes
        activities={[
          {
            name: activity.name,
            lat: activity.latitude,
            lng: activity.longitude,
          },
          {
            name: nextActivity?.name || 'End of day',
            lat: nextActivity?.latitude || activity.latitude,
            lng: nextActivity?.longitude || activity.longitude,
          },
        ]}
        className="mt-4 text-sm text-slate-500"
      />
    </div>
  )
}
```

### Trip Search Form

```tsx
import { LocationSearch } from '@/components/map/LocationSearch'
import { useState } from 'react'

export function TripSearchForm() {
  const [destination, setDestination] = useState(null)
  const [dates, setDates] = useState({ start: '', end: '' })

  const handleSearch = async () => {
    // Send to trip planner
    const response = await fetch('/api/ai/plan', {
      method: 'POST',
      body: JSON.stringify({
        destination: {
          name: destination.properties.name,
          longitude: destination.geometry.coordinates[0],
          latitude: destination.geometry.coordinates[1],
        },
        startDate: dates.start,
        endDate: dates.end,
      }),
    })
    // ...
  }

  return (
    <form className="space-y-4">
      <LocationSearch
        onSelect={setDestination}
        placeholder="Where do you want to go?"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          value={dates.start}
          onChange={(e) => setDates({ ...dates, start: e.target.value })}
        />
        <input
          type="date"
          value={dates.end}
          onChange={(e) => setDates({ ...dates, end: e.target.value })}
        />
      </div>

      <button
        type="button"
        onClick={handleSearch}
        className="w-full bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600"
      >
        Plan My Trip
      </button>
    </form>
  )
}
```

## Performance Optimization

### Debouncing
The `useLocationSearch` hook includes built-in debouncing (300ms default):

```tsx
const { query, setQuery, suggestions, loading } = useLocationSearch(
  500 // Custom debounce delay (ms)
)
```

### Caching with React Query (Optional)

```tsx
import { useQuery } from '@tanstack/react-query'
import { useGeocoding } from '@/hooks/useMapbox'

export function CachedLocationSearch() {
  const { forward } = useGeocoding()

  const { data } = useQuery({
    queryKey: ['geocoding', query],
    queryFn: () => forward(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return <div>{data?.features.length} results found</div>
}
```

### Server-Side Optimization

API routes include:
- ✅ Supabase authentication (prevents unauthorized use)
- ✅ Zod validation (catch errors early)
- ✅ Rate limiting ready (add with Upstash Redis)
- ✅ Error handling (graceful failures)

To add rate limiting:

```tsx
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
})

export async function POST(request: NextRequest) {
  const { success } = await ratelimit.limit(`geocoding:${user.id}`)
  if (!success) return new Response('Rate limited', { status: 429 })
  // ...
}
```

## Troubleshooting

### "Mapbox not configured" Error
- Ensure `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env.local`
- Check token is valid in Mapbox dashboard
- Rebuild app after env changes

### Empty Search Results
- Verify coordinates are in correct order: `[longitude, latitude]` (not lat/lon)
- Add `country` parameter to limit results
- Check Mapbox API limits (1000 requests/day free tier)

### "Unauthorized" Error on API Routes
- Ensure user is logged in with Supabase
- Check Supabase auth configuration
- Verify session cookie is being sent

### Slow Auto-complete
- Adjust debounce time in `useLocationSearch(debounceMs)`
- Add `proximity` parameter to prioritize nearby results
- Consider using Search Box API (faster than forward geocoding)

## Best Practices

1. **Always handle loading states** - Mapbox calls take 200-800ms
2. **Show errors to users** - Network can be unreliable
3. **Debounce search inputs** - Don't call API on every keystroke
4. **Cache results** - Use React Query or localStorage for frequent searches
5. **Validate coordinates** - Ensure [lng, lat] order (not [lat, lng])
6. **Use proximity bias** - When user has current location, prioritize near results
7. **Batch requests** - Use Matrix API instead of multiple Direction calls

## Next Steps

1. **Map Display**: Add Mapbox GL JS component for interactive maps
2. **Route Visualization**: Display directions on map with Leaflet/Mapbox GL
3. **PDF Export**: Use static images to create shareable trip PDFs
4. **Email Sharing**: Send trip itineraries with embedded map images
5. **Mobile**: Adapt components for mobile using Tailwind responsive classes

---

**Questions?** Check [MAPBOX_API_INTEGRATION.md](./MAPBOX_API_INTEGRATION.md) for architecture details.
