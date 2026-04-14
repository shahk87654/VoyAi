'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GeneratedItinerary } from '@/types/ai'
import { Flight } from '@/types/flight'
import { Hotel } from '@/types/hotel'

interface TripDraft {
  destination: string
  origin: string
  startDate: string
  endDate: string
  travelers: number
  budget: string
  style: string[]
  preferences: string
}

interface TripStore {
  draft: TripDraft
  selectedFlight: Flight | null
  selectedHotel: Hotel | null
  itinerary: GeneratedItinerary | null

  updateDraft: (updates: Partial<TripDraft>) => void
  setFlight: (flight: Flight | null) => void
  setHotel: (hotel: Hotel | null) => void
  setItinerary: (itinerary: GeneratedItinerary | null) => void
  reset: () => void
}

const initialDraft: TripDraft = {
  destination: '',
  origin: '',
  startDate: '',
  endDate: '',
  travelers: 1,
  budget: 'moderate',
  style: [],
  preferences: '',
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      selectedFlight: null,
      selectedHotel: null,
      itinerary: null,

      updateDraft: (updates) =>
        set((s) => ({ draft: { ...s.draft, ...updates } })),
      setFlight: (flight) => set({ selectedFlight: flight }),
      setHotel: (hotel) => set({ selectedHotel: hotel }),
      setItinerary: (itinerary) => set({ itinerary }),
      reset: () =>
        set({
          draft: initialDraft,
          selectedFlight: null,
          selectedHotel: null,
          itinerary: null,
        }),
    }),
    { name: 'voyai-trip-draft' }
  )
)
