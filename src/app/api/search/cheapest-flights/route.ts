import { NextRequest, NextResponse } from 'next/server'
import { searchFlights } from '@/lib/serpapi'
import { Flight, FlightSearchParams } from '@/types/flight'

// Popular flight routes with today + 7 days
function getPopularRoutes(): FlightSearchParams[] {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  return [
    { origin: 'LAX', destination: 'JFK', departureDate: formatDate(nextWeek), adults: 1 },
    { origin: 'LAX', destination: 'MIA', departureDate: formatDate(nextWeek), adults: 1 },
    { origin: 'LAX', destination: 'ORD', departureDate: formatDate(nextWeek), adults: 1 },
    { origin: 'LAX', destination: 'BOS', departureDate: formatDate(nextWeek), adults: 1 },
    { origin: 'SFO', destination: 'SEA', departureDate: formatDate(nextWeek), adults: 1 },
    { origin: 'DEN', destination: 'LAS', departureDate: formatDate(nextWeek), adults: 1 },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sortBy = searchParams.get('sort') || 'price'

    // Get popular routes
    const routes = getPopularRoutes()

    // Search all routes in parallel
    const allFlights = await Promise.all(
      routes.map(async (route) => {
        try {
          const flights = await searchFlights(route)
          // Return cheapest flight from each route
          if (flights.length > 0) {
            const cheapest = flights.reduce((min, f) => (f.price < min.price ? f : min))
            return cheapest
          }
          return null
        } catch (error) {
          console.error(`Error searching for ${route.origin} → ${route.destination}:`, error)
          return null
        }
      })
    )

    // Filter out null results and sort
    let results = allFlights.filter((f): f is Flight => f !== null)

    // Sort results
    if (sortBy === 'savings') {
      // Mock savings for demo (would be based on historical data in production)
      results = results.sort((a, b) => (b.price * 0.4 - a.price * 0.4)) // assuming 40% typical markup
    } else if (sortBy === 'date') {
      results = results.sort((a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime())
    } else {
      // Default: sort by price
      results = results.sort((a, b) => a.price - b.price)
    }

    return NextResponse.json(results.slice(0, 6))
  } catch (error) {
    console.error('Cheapest flights API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cheapest flights', details: (error as Error).message },
      { status: 500 }
    )
  }
}
