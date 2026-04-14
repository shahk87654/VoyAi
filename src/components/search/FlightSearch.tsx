'use client'

import { useState } from 'react'
import { Plane, MapPin, Calendar, Users, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface FlightSearchProps {
  onSearch?: (params: FlightSearchParams) => void
  isLoading?: boolean
}

export interface FlightSearchParams {
  from: string
  to: string
  departDate: string
  returnDate?: string
  passengers: number
}

export function FlightSearch({ onSearch, isLoading }: FlightSearchProps) {
  const [roundTrip, setRoundTrip] = useState(true)
  const [params, setParams] = useState<FlightSearchParams>({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
  })

  const handleSearch = () => {
    if (!params.from || !params.to || !params.departDate) {
      toast.error('Please fill in all required fields')
      return
    }
    if (roundTrip && !params.returnDate) {
      toast.error('Please select a return date')
      return
    }
    onSearch?.(params)
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
      <div className="flex items-center gap-3 mb-6">
        <Plane className="w-6 h-6 text-[var(--color-accent)]" />
        <h3 className="text-xl font-display font-bold text-[var(--color-text)]">Find Flights</h3>
      </div>

      {/* Trip Type */}
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={roundTrip}
            onChange={() => setRoundTrip(true)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-[var(--color-text)]">Round Trip</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!roundTrip}
            onChange={() => setRoundTrip(false)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-[var(--color-text)]">One Way</span>
        </label>
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            From
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="NYC"
              value={params.from}
              onChange={(e) => setParams({ ...params, from: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            To
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="LAX"
              value={params.to}
              onChange={(e) => setParams({ ...params, to: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Depart */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Depart
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <input
              type="date"
              value={params.departDate}
              onChange={(e) => setParams({ ...params, departDate: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Return (if round trip) */}
        {roundTrip && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Return
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
              <input
                type="date"
                value={params.returnDate}
                onChange={(e) => setParams({ ...params, returnDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>
        )}

        {/* Passengers */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Passengers
          </label>
          <div className="relative">
            <Users size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <select
              value={params.passengers}
              onChange={(e) => setParams({ ...params, passengers: parseInt(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Passenger' : 'Passengers'}
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
            <Plane size={18} />
            Search Flights
          </>
        )}
      </button>
    </div>
  )
}
