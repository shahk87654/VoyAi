import { FlightSearchParams, Flight } from '@/types/flight'
import { redis } from './redis'

const BASE_URL = 'https://serpapi.com/search'

export async function searchFlights(params: FlightSearchParams): Promise<Flight[]> {
  const cacheKey = `flights:${JSON.stringify(params)}`

  // Check Redis cache — flight prices are valid for 15 minutes
  const cached = await redis.get<Flight[]>(cacheKey)
  if (cached) return cached

  const searchParams = new URLSearchParams({
    engine: 'google_flights',
    api_key: process.env.SERPAPI_KEY!,
    departure_id: params.origin,
    arrival_id: params.destination,
    outbound_date: params.departureDate,
    type: params.returnDate ? '1' : '2',
    currency: params.currency ?? 'USD',
    hl: 'en',
    adults: params.adults.toString(),
    ...(params.returnDate && {
      return_date: params.returnDate,
    }),
    ...(params.cabinClass && {
      travel_class: getCabinCode(params.cabinClass),
    }),
  })

  const res = await fetch(`${BASE_URL}?${searchParams}`)
  if (!res.ok) {
    const errorBody = await res.text()
    console.error(`SerpAPI error ${res.status} for route ${params.origin}→${params.destination}`)
    console.error(`Request URL: ${BASE_URL}?${searchParams}`)
    console.error(`Response: ${errorBody}`)
    throw new Error(`SerpAPI error: ${res.status}`)
  }

  const data = await res.json()
  const flights = parseSerpFlights(data)

  // Cache for 15 minutes
  await redis.setex(cacheKey, 900, flights)
  return flights
}

function getCabinCode(cabin: string): string {
  const codes: Record<string, string> = {
    economy: '1',
    premium_economy: '2',
    business: '3',
    first: '4',
  }
  return codes[cabin] ?? '1'
}

function parseSerpFlights(data: any): Flight[] {
  const results = data.best_flights ?? data.other_flights ?? []

  return results.flatMap((group: any) =>
    (group.flights ?? [group]).map((f: any, i: number) => ({
      id: `${f.flight_number ?? 'FL'}-${i}-${Date.now()}`,
      airline: f.airline ?? group.flights?.[0]?.airline ?? 'Unknown',
      airlineLogo: f.airline_logo,
      flightNumber: f.flight_number ?? '',
      origin: f.departure_airport?.name ?? '',
      originCode: f.departure_airport?.id ?? '',
      destination: f.arrival_airport?.name ?? '',
      destinationCode: f.arrival_airport?.id ?? '',
      departure: f.departure_airport?.time ?? '',
      arrival: f.arrival_airport?.time ?? '',
      durationMinutes: group.total_duration ?? f.duration ?? 0,
      stops: group.layovers?.length ?? 0,
      price: group.price ?? 0,
      currency: 'USD',
      cabinClass: 'economy' as const,
      co2Kg: group.carbon_emissions?.this_flight,
      available: true,
    }))
  )
}
