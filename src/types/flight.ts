export interface Flight {
  id: string
  airline: string
  airlineLogo?: string
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  departure: string // ISO datetime
  arrival: string // ISO datetime
  durationMinutes: number
  stops: number
  stopDetails?: StopDetail[]
  price: number
  currency: string
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first'
  co2Kg?: number
  bookingUrl?: string
  available: boolean
}

export interface StopDetail {
  airport: string
  code: string
  layoverMinutes: number
}

export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string // YYYY-MM-DD
  returnDate?: string
  adults: number
  cabinClass?: string
  currency?: string
}
