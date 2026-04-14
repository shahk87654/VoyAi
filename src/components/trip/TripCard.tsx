'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trip } from '@/types/trip'
import { MapPin, Users, Calendar } from 'lucide-react'

interface Props {
  trip: Trip
  onClick?: () => void
}

export function TripCard({ trip, onClick }: Props) {
  const startDate = new Date(trip.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const endDate = new Date(trip.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const days = Math.ceil(
    (new Date(trip.endDate).getTime() -
      new Date(trip.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <Card
      onClick={onClick}
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold line-clamp-2">{trip.title}</h3>
        <Badge variant="outline">{trip.status}</Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>
            {trip.origin} → {trip.destination}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {startDate} - {endDate} · {days} days
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{trip.travelers} traveler(s)</span>
        </div>
      </div>

      {trip.style.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {trip.style.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">
              {s}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
