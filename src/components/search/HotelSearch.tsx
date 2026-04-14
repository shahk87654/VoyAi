'use client'

import { useState } from 'react'
import { Building2, MapPin, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface HotelSearchProps {
  onSearch?: (params: HotelSearchParams) => void
  isLoading?: boolean
}

export interface HotelSearchParams {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
  rooms: number
}

export function HotelSearch({ onSearch, isLoading }: HotelSearchProps) {
  const [params, setParams] = useState<HotelSearchParams>({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
  })

  const handleSearch = () => {
    if (!params.destination || !params.checkIn || !params.checkOut) {
      toast.error('Please fill in all required fields')
      return
    }
    onSearch?.(params)
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-[var(--color-accent)]" />
        <h3 className="text-xl font-display font-bold text-[var(--color-text)]">Find Hotels</h3>
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Destination
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Paris, Tokyo..."
              value={params.destination}
              onChange={(e) => setParams({ ...params, destination: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Check In */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Check In
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <input
              type="date"
              value={params.checkIn}
              onChange={(e) => setParams({ ...params, checkIn: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Check Out */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Check Out
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <input
              type="date"
              value={params.checkOut}
              onChange={(e) => setParams({ ...params, checkOut: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Guests
          </label>
          <div className="relative">
            <Users size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <select
              value={params.guests}
              onChange={(e) => setParams({ ...params, guests: parseInt(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rooms */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Rooms
          </label>
          <div className="relative">
            <Building2 size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <select
              value={params.rooms}
              onChange={(e) => setParams({ ...params, rooms: parseInt(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Room' : 'Rooms'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={isLoading}
        className="w-full mt-6 px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Building2 size={18} />
            Search Hotels
          </>
        )}
      </button>
    </div>
  )
}
