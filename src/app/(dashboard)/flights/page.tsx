'use client'

import { useState, useEffect } from 'react'
import { Plane, TrendingDown, Calendar, MapPin, Users, ChevronDown, Zap, Sparkles, Loader, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Flight } from '@/types/flight'

export default function FlightsPage() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'price' | 'savings' | 'date'>('price')
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  
  // Search form state
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState('1')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  useEffect(() => {
    const fetchCheapestFlights = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/search/cheapest-flights?sort=${sortBy}`)
        if (!res.ok) throw new Error('Failed to fetch flights')
        const data = await res.json()
        setFlights(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load cheapest flights'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch cheapest flights if no search has been performed
    if (!searchPerformed) {
      fetchCheapestFlights()
    }
  }, [sortBy, searchPerformed])

  const handleFlightSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!from || !to || !departDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSearchLoading(true)
      setError(null)
      setSearchPerformed(true)
      
      const params = new URLSearchParams({
        origin: from,
        destination: to,
        departureDate: departDate,
        ...(returnDate && { returnDate }),
        adults: passengers,
      })
      
      const res = await fetch(`/api/search/flights?${params}`)
      if (!res.ok) throw new Error('Failed to search flights')
      const data = await res.json()
      setFlights(data.flights || [])
      
      if (!data.flights?.length) {
        toast.error('No flights found for your search')
      } else {
        toast.success(`Found ${data.flights.length} flights`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search flights'
      setError(message)
      toast.error(message)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleBooking = (flight: Flight) => {
    const bookingData = {
      type: 'flight',
      price: flight.price,
      currency: flight.currency,
      origin: flight.origin,
      originCode: flight.originCode,
      destination: flight.destination,
      destinationCode: flight.destinationCode,
      departure: flight.departure,
      arrival: flight.arrival,
      duration: flight.durationMinutes,
      stops: flight.stops,
      airline: flight.airline,
    }
    
    const query = encodeURIComponent(JSON.stringify(bookingData))
    router.push(`/booking?booking=${query}`)
  }

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateString
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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
            <div className="flex-1">
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">✈️ {searchPerformed ? 'Flight Search Results' : 'Cheapest Flights Today'}</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--color-text)]">
                {searchPerformed ? 'Your Search Results' : 'Find Amazing Deals'}
              </h1>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
            {searchPerformed
              ? 'Browse flights matching your search criteria'
              : 'Discover the cheapest flights across popular routes. Updated in real-time to show you incredible savings.'}
          </p>
        </div>
      </div>

      {/* Search Form */}
      {showSearch && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6">Search Flights</h3>
          <form onSubmit={handleFlightSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* From */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">From (IATA Code)</label>
                <input
                  type="text"
                  placeholder="e.g., LAX"
                  value={from}
                  onChange={(e) => setFrom(e.target.value.toUpperCase())}
                  maxLength={3}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* To */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">To (IATA Code)</label>
                <input
                  type="text"
                  placeholder="e.g., MIA"
                  value={to}
                  onChange={(e) => setTo(e.target.value.toUpperCase())}
                  maxLength={3}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Depart Date */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Depart</label>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Return (Optional)</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Passengers</label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false)
                  setSearchPerformed(false)
                }}
                className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searchLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search Flights
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sorting Options */}
      {!searchPerformed && (
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
            {loading ? 'Loading...' : `Showing ${flights.length} deals`}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          <p className="font-semibold">Unable to load flights</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {(loading || searchLoading) && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4">
            </div>
            <p className="text-[var(--color-text-muted)]">
              {searchLoading ? 'Searching flights...' : 'Searching for cheapest flights...'}
            </p>
          </div>
        </div>
      )}

      {/* Flights Grid */}
      {!loading && flights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="group bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-blue-500/50 transition-all duration-300 overflow-hidden hover:shadow-lg"
            >
              {/* Flight Card Content */}
              <div className="p-6">
                {/* Route and Price */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-display font-bold text-[var(--color-text)]">
                        {flight.originCode}
                      </span>
                      <Plane className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-display font-bold text-[var(--color-text)]">
                        {flight.destinationCode}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(flight.departure).toLocaleDateString('en-US', {
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
                      Best deal
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
                    <span className="text-[var(--color-text-muted)]">
                      {formatTime(flight.departure)} → {formatTime(flight.arrival)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text-muted)]">
                      {formatDuration(flight.durationMinutes)} • {flight.stops} stop{flight.stops !== 1 ? 's' : ''}
                    </span>
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
      )}

      {/* Empty State */}
      {!loading && !searchLoading && flights.length === 0 && !error && (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Plane className="w-16 h-16 text-blue-400/50" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                {searchPerformed ? 'No flights found' : 'Set up SerpAPI to see live flights'}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                {searchPerformed
                  ? 'Try adjusting your search criteria and searching again'
                  : 'To enable real-time flight search, add your SerpAPI key to '}
                {!searchPerformed && <code className="bg-black/20 px-2 py-1 rounded">.env.local</code>}
              </p>
              {!searchPerformed && (
                <ol className="text-sm text-[var(--color-text-muted)] text-left inline-block">
                  <li>1. Get a free API key from{' '}
                    <a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      serpapi.com
                    </a>
                  </li>
                  <li>2. Add <code className="bg-black/20 px-2 py-1 rounded">SERPAPI_KEY=your_key</code> to .env.local</li>
                  <li>3. Restart the dev server</li>
                </ol>
              )}
            </div>
          </div>
        </div>
      )}

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
