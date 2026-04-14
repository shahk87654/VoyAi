'use client'

import { Clock, MapPin, Utensils, Ticket } from 'lucide-react'

interface Activity {
  time: string
  title: string
  description: string
  location: string
  type: 'activity' | 'meal' | 'transport'
}

interface ItineraryDay {
  day: number
  date: string
  activities: Activity[]
}

interface ItineraryViewProps {
  destination: string
  duration: number
  itinerary: ItineraryDay[]
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'meal':
      return <Utensils size={18} />
    case 'transport':
      return <Ticket size={18} />
    default:
      return <MapPin size={18} />
  }
}

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'meal':
      return 'bg-emerald-500/10 text-emerald-600'
    case 'transport':
      return 'bg-sky-500/10 text-sky-600'
    default:
      return 'bg-amber-500/10 text-amber-600'
  }
}

export function ItineraryView({ destination, duration, itinerary }: ItineraryViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-[var(--color-text)] mb-2">
          Your {duration}-Day Itinerary
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Personalized AI-generated plan for {destination}
        </p>
      </div>

      {/* Days */}
      <div className="space-y-6">
        {itinerary.map((day) => (
          <div
            key={day.day}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
          >
            {/* Day Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-border)]">
              <div className="w-12 h-12 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center font-display font-bold">
                {day.day}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-[var(--color-text)]">
                  Day {day.day}
                </h2>
                <p className="text-[var(--color-text-muted)]">{day.date}</p>
              </div>
            </div>

            {/* Activities Timeline */}
            <div className="space-y-4">
              {day.activities.map((activity, idx) => (
                <div key={idx} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    {idx !== day.activities.length - 1 && (
                      <div className="w-0.5 h-16 bg-[var(--color-border)] my-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={16} className="text-[var(--color-accent)]" />
                          <span className="font-semibold text-[var(--color-text)]">{activity.time}</span>
                        </div>
                        <h3 className="text-lg font-display font-bold text-[var(--color-text)] mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-[var(--color-text-muted)] mb-2">{activity.description}</p>
                        <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                          <MapPin size={14} />
                          {activity.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[var(--color-accent)]/10 rounded-2xl p-6 border border-[var(--color-accent)]/20 text-center">
        <p className="text-[var(--color-text)] mb-4">
          Love this itinerary? Refine it with our AI chat or export as PDF.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
            Refine with AI
          </button>
          <button className="px-6 py-2 border border-[var(--color-accent)] text-[var(--color-accent)] rounded-lg font-medium hover:bg-[var(--color-accent)]/10 transition-colors">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}
