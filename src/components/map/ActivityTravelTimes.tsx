'use client'

import { useActivityTravelTimes } from '@/hooks/useMapbox'
import { Loader2, Clock, AlertCircle } from 'lucide-react'

interface Activity {
  name: string
  lat: number
  lng: number
}

interface ActivityTravelTimesProps {
  activities: Activity[]
  className?: string
}

/**
 * Component displaying travel times between consecutive activities
 * Shows: Activity A -> (5 min) -> Activity B -> (10 min) -> Activity C
 */
export function ActivityTravelTimes({
  activities,
  className = '',
}: ActivityTravelTimesProps) {
  const { travelTimes, loading, error } = useActivityTravelTimes(activities)

  if (activities.length < 2) {
    return null
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-500 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span>Could not calculate travel times</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-500 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Calculating travel times...</span>
      </div>
    )
  }

  if (travelTimes.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div key={index}>
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-full bg-amber-500 h-2 w-2 flex-shrink-0"></div>
              <span className="font-medium text-slate-900">{activity.name}</span>
            </div>

            {index < travelTimes.length && (
              <div className="ml-1 mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>
                  {travelTimes[index]} min to{' '}
                  {activities[index + 1]?.name || 'next activity'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Timeline view showing activities with travel times between them
 */
export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const { travelTimes, loading } = useActivityTravelTimes(activities)

  if (activities.length < 1) {
    return null
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => (
        <div key={index}>
          {/* Activity node */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-amber-500 h-4 w-4 border-4 border-white shadow-md z-10"></div>
              {index < activities.length - 1 && (
                <div className="w-1 h-16 bg-gradient-to-b from-amber-500 to-amber-200 my-1"></div>
              )}
            </div>
            <div className="pb-8">
              <h3 className="font-semibold text-slate-900">{activity.name}</h3>
              {index < travelTimes.length && (
                <p className="text-xs text-slate-500 mt-1">
                  {loading
                    ? 'Calculating...'
                    : `${travelTimes[index]} min to next activity`}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
