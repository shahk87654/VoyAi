'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hotel, Star, MapPin, Users, Wifi, Coffee, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface HotelDeal {
  id: string
  name: string
  city: string
  rating: number
  reviews: number
  originalPrice: number
  dealPrice: number
  discount: number
  amenities: string[]
  image: string
}

// Mock hotel deals
const HOTEL_DEALS: HotelDeal[] = [
  {
    id: '1',
    name: 'Ocean View Resort',
    city: 'Miami, FL',
    rating: 4.8,
    reviews: 1240,
    originalPrice: 249,
    dealPrice: 129,
    discount: 48,
    amenities: ['Free WiFi', 'Beach Access', 'Pool', 'Spa'],
    image: '🏖️',
  },
  {
    id: '2',
    name: 'Downtown Boutique Hotel',
    city: 'New York, NY',
    rating: 4.6,
    reviews: 856,
    originalPrice: 299,
    dealPrice: 149,
    discount: 50,
    amenities: ['Free WiFi', 'Gym', 'Restaurant', 'Business Center'],
    image: '🏢',
  },
  {
    id: '3',
    name: 'Desert Oasis Inn',
    city: 'Phoenix, AZ',
    rating: 4.5,
    reviews: 632,
    originalPrice: 179,
    dealPrice: 89,
    discount: 50,
    amenities: ['Pool', 'Hot Tub', 'Free Breakfast', 'WiFi'],
    image: '🏜️',
  },
  {
    id: '4',
    name: 'Mountain Lodge',
    city: 'Denver, CO',
    rating: 4.7,
    reviews: 945,
    originalPrice: 199,
    dealPrice: 129,
    discount: 35,
    amenities: ['Fireplace', 'Hiking Trails', 'Restaurant', 'WiFi'],
    image: '🏔️',
  },
  {
    id: '5',
    name: 'Tech Hub Hotel',
    city: 'San Francisco, CA',
    rating: 4.4,
    reviews: 1105,
    originalPrice: 329,
    dealPrice: 189,
    discount: 43,
    amenities: ['High-Speed WiFi', 'Co-Working', 'Bar', 'Gym'],
    image: '🌉',
  },
  {
    id: '6',
    name: 'Historic Palace',
    city: 'Boston, MA',
    rating: 4.9,
    reviews: 756,
    originalPrice: 279,
    dealPrice: 159,
    discount: 43,
    amenities: ['Concierge', 'Restaurant', 'Spa', 'Parking'],
    image: '🏛️',
  },
]

export default function HotelsPage() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'price' | 'discount' | 'rating'>('price')
  const [selectedCity, setSelectedCity] = useState<string>('all')

  const cities = ['all', ...new Set(HOTEL_DEALS.map((h) => h.city))]

  let filteredAndSorted = HOTEL_DEALS.filter(
    (hotel) => selectedCity === 'all' || hotel.city === selectedCity
  )

  filteredAndSorted.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.dealPrice - b.dealPrice
      case 'discount':
        return b.discount - a.discount
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const handleBook = (hotel: HotelDeal) => {
    const bookingData = {
      type: 'hotel',
      price: hotel.dealPrice,
      currency: 'USD',
      hotelName: hotel.name,
      rating: hotel.rating,
    }
    
    const query = encodeURIComponent(JSON.stringify(bookingData))
    router.push(`/booking?booking=${query}`)
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/30 backdrop-blur-sm">
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;utf8,<svg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M0 0h40v40H0z%22 fill=%22%23000%22 fill-opacity=%22.05%22/%></svg>')] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Hotel className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">🏨 Best Hotel Deals</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--color-text)]">
                Amazing Discounts
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
            Discover exclusive hotel deals with huge discounts. Book now and save up to 50% off!
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* City Filter */}
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">Filter by City:</p>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCity === city
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-emerald-500/50'
                }`}
              >
                {city === 'all' ? '🌍 All Cities' : city.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">Sort by:</p>
          <div className="flex gap-2 flex-wrap">
            {(['price', 'discount', 'rating'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  sortBy === option
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-emerald-500/50'
                }`}
              >
                {option === 'price' && '💰 Lowest Price'}
                {option === 'discount' && '📉 Best Discount'}
                {option === 'rating' && '⭐ Top Rated'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSorted.map((hotel) => (
          <div
            key={hotel.id}
            className="group bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-emerald-500/50 transition-all duration-300 overflow-hidden hover:shadow-lg"
          >
            {/* Hotel Card */}
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-4xl mb-2">{hotel.image}</div>
                  <h3 className="font-semibold text-lg text-[var(--color-text)] mb-1">{hotel.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <MapPin className="w-3 h-3" />
                    {hotel.city}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(hotel.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-sm text-[var(--color-text)]">{hotel.rating}</span>
                <span className="text-xs text-[var(--color-text-muted)]">({hotel.reviews})</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-display font-bold text-emerald-500">${hotel.dealPrice}</span>
                  <span className="text-sm line-through text-[var(--color-text-muted)]">${hotel.originalPrice}</span>
                  <span className="text-sm font-bold text-emerald-500">-{hotel.discount}%</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">per night</p>
              </div>

              {/* Amenities */}
              <div className="mb-4 pb-4 border-b border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text)] mb-2 uppercase tracking-wider">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 text-xs bg-emerald-500/10 text-emerald-600 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => handleBook(hotel)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm p-8 sm:p-12 text-center">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;utf8,<svg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22><g fill=%22none%22 fill-rule=%22evenodd%22><g fill=%22%23000%22 fill-opacity=%22.05%22><path d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/></g></g></svg>')] pointer-events-none" />
        <div className="relative">
          <div className="inline-block mb-6">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--color-text)] mb-4">
            Build your complete trip itinerary
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto">
            Combine flights, hotels, and activities into one perfect trip plan with VoyAI.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-accent)] to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5" />
            Plan My Trip
          </Link>
        </div>
      </div>
    </div>
  )
}
