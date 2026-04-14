'use client'

import { Star, Building2, MapPin, User } from 'lucide-react'

interface HotelCardProps {
  id: string
  name: string
  location: string
  rating: number
  reviews: number
  price: number
  image?: string
  amenities?: string[]
}

export function HotelCard({
  id,
  name,
  location,
  rating,
  reviews,
  price,
  image,
  amenities = ['WiFi', 'Pool', 'Gym'],
}: HotelCardProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-accent)] transition-colors">
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-amber-500/10 to-amber-600/10 flex items-center justify-center">
        <Building2 size={48} className="text-[var(--color-accent)]/20" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-2">
          <h3 className="text-lg font-display font-bold text-[var(--color-text)] mb-1 line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
            <MapPin size={14} />
            {location}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(rating) ? 'fill-amber-500 text-amber-500' : 'text-[var(--color-border)]'}
              />
            ))}
          </div>
          <span className="text-sm text-[var(--color-text-muted)]">
            {rating.toFixed(1)} ({reviews} reviews)
          </span>
        </div>

        {/* Amenities */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {amenities.slice(0, 2).map((amenity) => (
            <span
              key={amenity}
              className="text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] px-2 py-1 rounded"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Per night</p>
            <p className="text-2xl font-display font-bold text-[var(--color-accent)]">${price}</p>
          </div>
          <button className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
            Book
          </button>
        </div>
      </div>
    </div>
  )
}
