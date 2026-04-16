'use client'

import { useState } from 'react'
import { useLocationSearch } from '@/hooks/useMapbox'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin } from 'lucide-react'

interface LocationSearchProps {
  onSelect: (location: any) => void
  placeholder?: string
  country?: string
}

/**
 * Location search component with autocomplete
 * Uses Mapbox Search Box API with debouncing
 */
export function LocationSearch({
  onSelect,
  placeholder = 'Search locations...',
  country,
}: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { query, setQuery, suggestions, loading, error } = useLocationSearch(300)

  const handleSelect = (suggestion: any) => {
    onSelect(suggestion)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-amber-500" />
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-slate-200 bg-white shadow-lg">
          {error && (
            <div className="px-4 py-3 text-sm text-red-500">{error.message}</div>
          )}

          {suggestions.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {suggestions.map((suggestion: any, index: number) => (
                <li key={index}>
                  <button
                    onClick={() => handleSelect(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                      <div className="flex-1 text-xs">
                        <div className="font-medium text-slate-900">
                          {suggestion.properties?.name || suggestion.text}
                        </div>
                        {suggestion.properties?.address && (
                          <div className="text-slate-500">
                            {suggestion.properties.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                No locations found
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
