'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ItineraryDay } from '@/types/ai'

interface Props {
  day: ItineraryDay
}

export function DayCard({ day }: Props) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sightseeing: 'bg-blue-100 text-blue-700',
      food: 'bg-orange-100 text-orange-700',
      adventure: 'bg-red-100 text-red-700',
      culture: 'bg-purple-100 text-purple-700',
      shopping: 'bg-pink-100 text-pink-700',
      relaxation: 'bg-green-100 text-green-700',
      transport: 'bg-gray-100 text-gray-700',
    }
    return colors[category] ?? 'bg-gray-100 text-gray-700'
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">
          {new Date(day.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <h3 className="text-2xl font-bold">{day.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Estimated: ${day.estimatedCost}
        </p>
      </div>

      <div className="space-y-4">
        {day.activities.map((activity) => (
          <div
            key={activity.id}
            className="border-l-4 border-primary pl-4 py-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{activity.time}</span>
              <Badge
                className={getCategoryColor(activity.category)}
                variant="outline"
              >
                {activity.category}
              </Badge>
            </div>
            <h4 className="font-semibold text-sm">{activity.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {activity.description}
            </p>
            {activity.tips && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                💡 {activity.tips}
              </p>
            )}
          </div>
        ))}
      </div>

      {day.transportNotes && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <span className="font-semibold">Transport: </span>
          {day.transportNotes}
        </div>
      )}
    </Card>
  )
}
