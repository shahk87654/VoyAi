'use client'

import { Star, Plane, Clock, MapPin } from 'lucide-react'

interface FlightCardProps {
  id: string
  airline: string
  departure: string
  arrival: string
  departTime: string
  arrivalTime: string
  duration: string
  price: number
  stops: number
}

export function FlightCard({
  id,
  airline,
  departure,
  arrival,
  departTime,
  arrivalTime,
  duration,
  price,
  stops,
}: FlightCardProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 hover:border-[var(--color-accent)] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plane size={18} className="text-[var(--color-accent)]" />
          <span className="font-medium text-[var(--color-text)]">{airline}</span>
        </div>
        <span className="text-sm bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full">
          {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Flight Times */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-text)]">{departTime}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{departure}</p>
          </div>

          <div className="flex-1 mx-4 flex items-center justify-center">
            <div className="flex-1 h-0.5 bg-[var(--color-border)]" />
            <div className="px-3 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Clock size={14} />
              {duration}
            </div>
            <div className="flex-1 h-0.5 bg-[var(--color-border)]" />
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-text)]">{arrivalTime}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{arrival}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Price per person</p>
          <p className="text-2xl font-display font-bold text-[var(--color-accent)]">${price}</p>
        </div>
        <button className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
          Select
        </button>
      </div>
    </div>
  )
}
