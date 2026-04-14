'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { MapPin, Calendar, Users, Plus, Compass, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

interface Trip {
  id: string
  destination: string
  days: number
  travelers: number
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        setTrips([])
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading your trips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-text)]">My Trips</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Manage and explore all your planned adventures</p>
        </div>
        <Link
          href="/builder"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-accent)] to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
        >
          <Plus size={20} />
          <span>New Trip</span>
        </Link>
      </div>

      {trips.length === 0 ? (
        <Card className="rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/5 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-[var(--color-accent)]/10">
                <Compass className="w-12 h-12 text-[var(--color-accent)]" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--color-text)] mb-2">No trips yet</h2>
              <p className="text-[var(--color-text-muted)] mb-6 text-sm sm:text-base max-w-md mx-auto">Start planning your next adventure and let AI craft the perfect itinerary just for you</p>
            </div>
            <Link
              href="/builder"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--color-accent)] to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
            >
              <Plus size={18} />
              <span>Create Your First Trip</span>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/dashboard/trips/${trip.id}`}>
              <Card className="h-full rounded-xl overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-xl hover:scale-105 active:scale-95">
                <div className="h-32 sm:h-40 bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-orange-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M0 0h40v40H0z%22 fill=%22%23000%22 fill-opacity=%22.05%22/%></svg>')] opacity-20" />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-200 line-clamp-2">
                    {trip.destination}
                  </h3>
                  <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-3 hover:text-[var(--color-text)] transition-colors">
                      <Calendar size={16} className="flex-shrink-0" />
                      <span>{trip.days} {trip.days === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="flex items-center gap-3 hover:text-[var(--color-text)] transition-colors">
                      <Users size={16} className="flex-shrink-0" />
                      <span>{trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent)]/20 transition-colors font-semibold text-sm">
                    <span>View Trip</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
