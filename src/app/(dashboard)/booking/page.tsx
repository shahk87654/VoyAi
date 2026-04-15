'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, MapPin, Clock, Plane, Hotel, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface BookingData {
  type: 'flight' | 'hotel'
  price: number
  currency: string
  origin?: string
  originCode?: string
  destination?: string
  destinationCode?: string
  departure?: string
  arrival?: string
  duration?: number
  stops?: number
  airline?: string
  hotelName?: string
  checkin?: string
  checkout?: string
  rating?: number
  bookingUrl?: string
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const bookingData = searchParams.get('booking')
      if (!bookingData) {
        setError('No booking data provided')
        return
      }

      const decoded = JSON.parse(decodeURIComponent(bookingData))
      console.log('Booking data received:', decoded)
      setBooking(decoded)
    } catch (err) {
      console.error('Error parsing booking data:', err)
      setError('Invalid booking data')
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Error</h1>
          <p className="text-[var(--color-text-muted)]">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-500 hover:text-blue-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full" />
          </div>
          <p className="text-[var(--color-text-muted)]">Loading booking details...</p>
          <p className="text-xs text-[var(--color-text-muted)]">Make sure you clicked 'Book Now' from flights or hotels page</p>
        </div>
      </div>
    )
  }

  const getExternalUrl = () => {
    if (booking.type === 'flight') {
      // Use Kayak for flight search (more reliable URL structure)
      const departDate = booking.departure 
        ? new Date(booking.departure).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      
      return `https://www.kayak.com/flights/${booking.originCode}-${booking.destinationCode}/${departDate}`
    } else {
      // Booking.com search with hotel name and location
      return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(booking.hotelName || '')}`
    }
  }

  return (
    <div className="min-h-screen pb-8 pt-4">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">Booking Confirmation</h1>
          <p className="text-[var(--color-text-muted)]">
            Review your {booking.type === 'flight' ? 'flight' : 'hotel'} details before booking
          </p>
        </div>

        {/* Debug Info */}
        {!booking.price && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-600">⚠️ Price not found. Make sure you clicked 'Book Now' button properly.</p>
          </div>
        )}

        {/* Booking Details Card */}
        <div className="rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm p-8 mb-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            {booking.type === 'flight' ? (
              <Plane className="w-8 h-8 text-blue-500" />
            ) : (
              <Hotel className="w-8 h-8 text-emerald-500" />
            )}
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              {booking.type === 'flight' ? 'Flight Details' : 'Hotel Details'}
            </h2>
          </div>

          {booking.type === 'flight' ? (
            // Flight Details
            <div className="space-y-6">
              {/* Route */}
              <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">Route</p>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[var(--color-text)]">{booking.originCode}</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">{booking.origin}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500/50 to-blue-500/10"></div>
                    <ArrowRight className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500/10 to-blue-500/50"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[var(--color-text)]">{booking.destinationCode}</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">{booking.destination}</p>
                  </div>
                </div>
              </div>

              {/* Flight Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Airline</p>
                  <p className="font-semibold text-[var(--color-text)]">{booking.airline || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Stops</p>
                  <p className="font-semibold text-[var(--color-text)]">{booking.stops === 0 ? 'Nonstop' : `${booking.stops} stop${booking.stops !== 1 ? 's' : ''}`}</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-blue-400 uppercase tracking-wider">Duration</p>
                  </div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {booking.duration ? `${Math.floor(booking.duration / 60)}h ${booking.duration % 60}m` : 'N/A'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Departure</p>
                  <p className="font-semibold text-[var(--color-text)]">
                    {booking.departure
                      ? new Date(booking.departure).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Hotel Details
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Hotel</p>
                <h3 className="text-2xl font-bold text-[var(--color-text)]">{booking.hotelName}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {booking.rating && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Rating</p>
                    <p className="font-semibold text-[var(--color-text)]">⭐ {booking.rating}/5</p>
                  </div>
                )}

                {booking.checkin && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Check-in</p>
                    <p className="font-semibold text-[var(--color-text)]">
                      {new Date(booking.checkin).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {booking.checkout && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Check-out</p>
                    <p className="font-semibold text-[var(--color-text)]">
                      {new Date(booking.checkout).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
            <div className="flex items-baseline justify-between">
              <span className="text-lg text-[var(--color-text-muted)]">Total Price:</span>
              <div className="text-right">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
                  ${booking.price}
                </span>
                <span className="text-sm text-[var(--color-text-muted)] ml-2">{booking.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="flex-1 px-6 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] font-semibold hover:bg-white/5 transition-colors text-center">
            Back to Dashboard
          </Link>

          <a
            href={getExternalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            Continue to Booking
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Info Note */}
        <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-sm text-[var(--color-text-muted)]">
            ℹ️ You will be redirected to our booking partner to complete your reservation. Prices may vary based on current availability.
          </p>
        </div>
      </div>
    </div>
  )
}
