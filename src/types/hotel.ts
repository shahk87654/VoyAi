export interface Hotel {
  id: string
  name: string
  address: string
  city: string
  country: string
  lat: number
  lng: number
  stars: number
  rating: number
  reviewCount: number
  pricePerNight: number
  totalPrice: number
  currency: string
  imageUrls: string[]
  amenities: string[]
  description: string
  bookingUrl: string // Booking.com affiliate URL
  checkIn: string
  checkOut: string
  freeCancellation: boolean
  breakfastIncluded: boolean
}

export interface HotelSearchParams {
  city: string
  checkIn: string // YYYY-MM-DD
  checkOut: string
  adults: number
  rooms?: number
  currency?: string
  minRating?: number
}
