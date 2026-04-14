'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flight } from '@/types/flight'
import { Plane, Wind } from 'lucide-react'

interface Props {
  flight: Flight
  selected?: boolean
  onClick?: () => void
}

export function FlightCard({ flight, selected, onClick }: Props) {
  const departTime = new Date(flight.departure).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const arriveTime = new Date(flight.arrival).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const hours = Math.floor(flight.durationMinutes / 60)
  const mins = flight.durationMinutes % 60

  return (
    <Card
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all ${
        selected ? 'ring-2 ring-primary' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="font-semibold">{flight.airline}</div>
        <Badge variant="secondary">${flight.price}</Badge>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="font-bold text-lg">{departTime}</div>
          <div className="text-xs text-muted-foreground">
            {flight.origin}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Plane className="w-4 h-4 text-muted-foreground" />
            {flight.stops > 0 && (
              <Badge variant="outline">{flight.stops} stop(s)</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {hours}h {mins}m
          </div>
        </div>

        <div className="text-center">
          <div className="font-bold text-lg">{arriveTime}</div>
          <div className="text-xs text-muted-foreground">
            {flight.destination}
          </div>
        </div>
      </div>

      {flight.co2Kg && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Wind className="w-3 h-3" />
          {flight.co2Kg} kg CO₂
        </div>
      )}
    </Card>
  )
}
