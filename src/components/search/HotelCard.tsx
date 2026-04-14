'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hotel } from '@/types/hotel'
import { Star, Utensils } from 'lucide-react'

interface Props {
  hotel: Hotel
  selected?: boolean
  onClick?: () => void
}

export function HotelCard({ hotel, selected, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      className={`overflow-hidden cursor-pointer transition-all ${
        selected ? 'ring-2 ring-primary' : 'hover:shadow-lg'
      }`}
    >
      {hotel.imageUrls[0] && (
        <div className="h-40 bg-muted overflow-hidden">
          <img
            src={hotel.imageUrls[0]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold line-clamp-2">{hotel.name}</h3>
          <Badge variant="secondary">
            ${hotel.pricePerNight}/nt
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-3 text-sm">
          {hotel.stars > 0 && (
            <div className="flex">
              {[...Array(hotel.stars)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          )}
          {hotel.rating > 0 && (
            <span className="text-muted-foreground">
              {hotel.rating.toFixed(1)}/5
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {hotel.city}, {hotel.country}
        </div>

        <div className="flex flex-wrap gap-1">
          {hotel.freeCancellation && (
            <Badge className="bg-green-100 text-green-700">
              Free cancellation
            </Badge>
          )}
          {hotel.breakfastIncluded && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Utensils className="w-3 h-3" />
              Breakfast
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
