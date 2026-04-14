'use client'

import { Card } from '@/components/ui/card'
import { GeneratedItinerary } from '@/types/ai'
import { DayCard } from './DayCard'

interface Props {
  itinerary: GeneratedItinerary
}

export function ItineraryView({ itinerary }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{itinerary.tripTitle}</h1>
        <p className="text-lg text-muted-foreground">
          {itinerary.overview}
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Highlights</h3>
            <ul className="space-y-2 text-sm">
              {itinerary.highlights.slice(0, 5).map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Trip Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Best time to visit:
                </span>
                <p>{itinerary.bestTimeToVisit}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Weather:
                </span>
                <p>{itinerary.weatherNote}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Est. Budget:
                </span>
                <p>
                  ${itinerary.estimatedTotalCost.min} - $
                  {itinerary.estimatedTotalCost.max}{' '}
                  {itinerary.estimatedTotalCost.currency}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        {itinerary.days.map((day) => (
          <DayCard key={day.dayNumber} day={day} />
        ))}
      </div>

      {itinerary.travelTips.length > 0 && (
        <Card className="p-6 bg-muted/30">
          <h3 className="font-semibold mb-4">Travel Tips</h3>
          <ul className="space-y-2 text-sm">
            {itinerary.travelTips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
