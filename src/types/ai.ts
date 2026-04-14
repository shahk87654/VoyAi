export interface TripPlanRequest {
  destination: string
  origin: string
  startDate: string
  endDate: string
  travelers: number
  budget?: string
  style?: string[]
  preferences?: string
  existingFlights?: any
  existingHotels?: any
}

export interface GeneratedItinerary {
  tripTitle: string
  overview: string
  highlights: string[]
  days: ItineraryDay[]
  travelTips: string[]
  estimatedTotalCost: {
    min: number
    max: number
    currency: string
  }
  bestTimeToVisit: string
  weatherNote: string
}

export interface ItineraryDay {
  dayNumber: number
  date: string
  title: string
  theme: string
  activities: Activity[]
  meals: Meal[]
  transportNotes: string
  estimatedCost: number
}

export interface Activity {
  id: string
  time: string
  name: string
  description: string
  duration: string
  category:
    | 'sightseeing'
    | 'food'
    | 'adventure'
    | 'culture'
    | 'shopping'
    | 'relaxation'
    | 'transport'
  location: string
  lat?: number
  lng?: number
  bookingRequired: boolean
  estimatedCost: number
  tips: string
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner'
  restaurantName: string
  cuisine: string
  priceRange: string
  mustTry: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
