'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Share2, Download, MapPin, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface SharedTrip {
  id: string
  destination: string
  departureDate: string
  returnDate: string
  travelers: number
  itinerary: any
  description?: string
}

export default function SharedTripPage() {
  const params = useParams()
  const token = params.token as string
  const [trip, setTrip] = useState<SharedTrip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/trips/share?token=${token}`)
        if (!res.ok) {
          setError('This trip link has expired or is invalid')
          return
        }
        const data = await res.json()
        setTrip(data)
      } catch (err) {
        setError('Failed to load shared trip')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchSharedTrip()
    }
  }, [token])

  const handleExportCalendar = async () => {
    try {
      const res = await fetch(`/api/export/calendar?tripId=${trip?.id}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${trip?.destination}-itinerary.ics`
        a.click()
        toast.success('Calendar exported!')
      }
    } catch (error) {
      toast.error('Failed to export calendar')
    }
  }

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Shared link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-muted)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-text-muted)]">Loading shared trip...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-muted)]">
        <div className="max-w-md w-full mx-4 p-8 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Trip Not Found</h1>
          <p className="text-[var(--color-text-muted)] mb-6">{error || 'This trip link is no longer available.'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[var(--color-accent)] to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  const itinerary = typeof trip.itinerary === 'string' ? JSON.parse(trip.itinerary) : trip.itinerary
  const days = Array.isArray(itinerary) ? itinerary : itinerary.days || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-muted)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-[var(--color-text)] mb-2">
            {trip.destination}
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg">Trip Itinerary</p>
        </div>

        {/* Trip Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] text-center">
            <Calendar className="w-7 h-7 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Duration</p>
            <p className="text-lg font-bold text-[var(--color-text)]">
              {new Date(trip.departureDate).toLocaleDateString()} - {new Date(trip.returnDate).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] text-center">
            <MapPin className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Destination</p>
            <p className="text-lg font-bold text-[var(--color-text)]">{trip.destination}</p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] text-center">
            <Users className="w-7 h-7 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Travelers</p>
            <p className="text-lg font-bold text-[var(--color-text)]">{trip.travelers} person{trip.travelers !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-12 flex-col sm:flex-row">
          <button
            onClick={handleExportCalendar}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Export to Calendar
          </button>
          <button
            onClick={handleShareLink}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share This Trip
          </button>
        </div>

        {/* Itinerary */}
        <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden">
          {days.length > 0 ? (
            <div className="divide-y divide-[var(--color-border)]">
              {days.map((day: any, idx: number) => (
                <div key={idx} className="p-6 sm:p-8 hover:bg-[var(--color-bg-muted)]/30 transition-colors">
                  <h3 className="text-2xl font-display font-bold text-[var(--color-text)] mb-3">
                    Day {idx + 1} {day.title && `• ${day.title}`}
                  </h3>
                  {day.description && (
                    <p className="text-[var(--color-text-muted)] mb-4">{day.description}</p>
                  )}

                  {day.activities && day.activities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase">Activities</p>
                      <ul className="space-y-2">
                        {day.activities.map((activity: any, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 p-3 bg-[var(--color-bg-muted)]/50 rounded-lg"
                          >
                            <span className="text-xl">📍</span>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">
                                {activity.name || activity.activity}
                              </p>
                              {activity.time && (
                                <p className="text-xs text-[var(--color-text-muted)]">{activity.time}</p>
                              )}
                              {activity.description && (
                                <p className="text-sm text-[var(--color-text-muted)] mt-1">{activity.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-[var(--color-text-muted)]">No itinerary details available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-[var(--color-text-muted)]">
          <p>✨ Shared via VoyAI - Your AI Travel Agent ✈️</p>
        </div>
      </div>
    </div>
  )
}
