'use client'

import { useState } from 'react'
import { Plane, TrendingDown, Calendar, MapPin, Users,ChevronDown, Zap, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface CheapestFlight {
  date: string
  from: string
  to: string
  price: number
  airline: string
  duration: string
  savings: number
}

// Mock data for cheapest flights
const CHEAPEST_FLIGHTS: CheapestFlight[] = [
  {
    date: '2026-04-20',
    from: 'LAX',
    to: 'NYC',
    price: 149,
    airline: 'Southwest',
    duration: '5h 30m',
    savings: 120,
  },
  {
    date: '2026-04-22',
    from: 'LAX',
    to: 'MIA',
    price: 89,
    airline: 'Spirit',
    duration: '5h 10m',
    savings: 180,
  },
  {
    date: '2026-04-25',
    from: 'LAX',
    to: 'ORD',
    price: 119,
    airline: 'United',
    duration: '4h 45m',
    savings: 95,
  },
  {
    date: '2026-04-28',
    from: 'LAX',
    to: 'BOS',
    price: 199,
    airline: 'JetBlue',
    duration: '5h 8m',
    savings: 150,
  },
  {
    date: '2026-05-01',
    from: 'SFO',
    to: 'SEA',
    price: 59,
    airline: 'Alaska',
    duration: '1h 25m',
    savings: 40,
  },
  {
    date: '2026-05-05',
    from: 'DEN',
    to: 'LAS',
    price: 79,
    airline: 'Frontier',
    duration: '1h 40m',
    savings: 65,
  },
]

export default function FlightsPage() {
  const [sortBy, setSortBy] = useState<'price' | 'savings' | 'date'>('price')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const sortedFlights = [...CHEAPEST_FLIGHTS].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'savings':
        return b.savings - a.savings
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      default:
        return 0
    }
  })

  const handleBooking = (flight: CheapestFlight) => {
    toast.success(`Booking ${flight.from} → ${flight.to} for $${flight.price}!`)
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent border border-blue-500/30 backdrop-blur-sm">
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;utf8,<svg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M0 0h40v40H0z%22 fill=%22%23000%22 fill-opacity=%22.05%22/%></svg>')] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Plane className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">✈️ Cheapest Flights Today</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--color-text)]">
                Find Amazing Deals
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
            Discover the cheapest flights across popular routes. Updated in real-time to show you incredible savings.
          </p>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-3 sm:mb-0">Sort by:</p>
          <div className="flex gap-2 flex-wrap">
            {(['price', 'savings', 'date'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  sortBy === option
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-blue-500/50'
                }`}
              >
                {option === 'price' && '💰 Lowest Price'}
                {option === 'savings' && '📉 Most Savings'}
                {option === 'date' && '📅 Soonest'}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          Showing <span className="font-bold text-[var(--color-accent)]">{sortedFlights.length}</span> deals
        </div>
      </div>

      {/* Flights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedFlights.map((flight, idx) => (
          <div
            key={idx}
            className="group bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-blue-500/50 transition-all duration-300 overflow-hidden hover:shadow-lg"
          >
            {/* Flight Card Content */}
            <div className="p-6">
              {/* Route and Price */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-display font-bold text-[var(--color-text)]">
                      {flight.from}
                    </span>
                    <Plane className="w-5 h-5 text-blue-400" />
                    <span className="text-2xl font-display font-bold text-[var(--color-text)]">
                      {flight.to}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {new Date(flight.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-blue-500">${flight.price}</div>
                  <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold mt-1">
                    <TrendingDown className="w-4 h-4" />
                    Save ${flight.savings}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3 text-sm">
                  <Plane className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text-muted)]">{flight.airline}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text-muted)]">{flight.duration}</span>
                </div>
              </div>

              {/* Booking Button */}
              <button
                onClick={() => handleBooking(flight)}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group"
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
            <div className="text-6xl animate-bounce">✨</div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--color-text)] mb-4">
            Want a personalized itinerary?
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto">
            Let VoyAI create a complete trip plan including flights, hotels, and activities tailored to your preferences.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-accent)] to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5" />
            Plan Full Trip
          </Link>
        </div>
      </div>
    </div>
  )
}
