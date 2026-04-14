'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlannerChat } from '@/components/ai/PlannerChat'
import { ItineraryView } from '@/components/trip/ItineraryView'
import { useTripStore } from '@/store/tripStore'
import { GeneratedItinerary } from '@/types/ai'
import { Loader2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [tripId, setTripId] = useState<string | null>(null)
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const itinerary = useTripStore((s) => s.itinerary)
  const setItinerary = useTripStore((s) => s.setItinerary)

  useEffect(() => {
    const loadTrip = async () => {
      const { id } = await params
      setTripId(id)

      try {
        const res = await fetch(`/api/trips/${id}`)
        if (!res.ok) throw new Error('Failed to fetch trip')
        const data = await res.json()
        setTrip(data.trip)
        if (data.trip.aiItinerary) {
          setItinerary(data.trip.aiItinerary)
        }
      } catch (error) {
        toast.error('Failed to load trip')
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [params, setItinerary])

  const handleSaveItinerary = async () => {
    if (!tripId || !itinerary) return

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiItinerary: itinerary }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Itinerary saved!')
    } catch (error) {
      toast.error('Failed to save itinerary')
    }
  }

  const handleExportPDF = async () => {
    if (!tripId) return
    try {
      const res = await fetch(`/api/export/pdf?tripId=${tripId}`)
      if (!res.ok) throw new Error('Failed to export')
      const html = await res.text()
      // Open in new tab for printing
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Failed to export PDF')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!trip) {
    return <div>Trip not found</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{trip.title}</h1>
        <p className="text-muted-foreground">
          {trip.origin} → {trip.destination}
        </p>
      </div>

      <Tabs defaultValue={itinerary ? 'itinerary' : 'planner'}>
        <TabsList>
          <TabsTrigger value="planner">AI Planner</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="mt-6">
          <PlannerChat
            request={{
              destination: trip.destination,
              origin: trip.origin,
              startDate: trip.startDate,
              endDate: trip.endDate,
              travelers: trip.travelers,
              budget: trip.budget,
              style: trip.style,
              preferences: trip.userNotes,
            }}
            onItineraryGenerated={(newItinerary) => {
              setItinerary(newItinerary)
            }}
          />
        </TabsContent>

        {itinerary && (
          <TabsContent value="itinerary" className="mt-6">
            <div className="mb-4 flex gap-2">
              <Button onClick={handleSaveItinerary} variant="default">
                Save Itinerary
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
            <ItineraryView itinerary={itinerary} />
          </TabsContent>
        )}

        <TabsContent value="flights" className="mt-6">
          <div className="text-muted-foreground">
            Flight search coming soon
          </div>
        </TabsContent>

        <TabsContent value="hotels" className="mt-6">
          <div className="text-muted-foreground">
            Hotel search coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
