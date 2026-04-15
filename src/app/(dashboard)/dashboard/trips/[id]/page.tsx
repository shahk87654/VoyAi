'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlannerChat } from '@/components/ai/PlannerChat'
import { ItineraryView } from '@/components/trip/ItineraryView'
import { useTripStore } from '@/store/tripStore'
import { GeneratedItinerary } from '@/types/ai'
import { Flight } from '@/types/flight'
import { Hotel } from '@/types/hotel'
import { Loader2, Download, MapPin, DollarSign, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [tripId, setTripId] = useState<string | null>(null)
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [flights, setFlights] = useState<Flight[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loadingFlights, setLoadingFlights] = useState(false)
  const [loadingHotels, setLoadingHotels] = useState(false)
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

  useEffect(() => {
    if (!trip) return

    // Fetch flights for the trip
    const fetchFlights = async () => {
      setLoadingFlights(true)
      try {
        const params = new URLSearchParams({
          origin: trip.origin,
          destination: trip.destination,
          departureDate: trip.startDate.split('T')[0],
          ...(trip.endDate && { returnDate: trip.endDate.split('T')[0] }),
          adults: trip.travelers?.toString() || '1',
        })
        const res = await fetch(`/api/search/flights?${params}`)
        if (res.ok) {
          const data = await res.json()
          setFlights(data.flights || [])
        }
      } catch (error) {
        console.error('Failed to fetch flights:', error)
      } finally {
        setLoadingFlights(false)
      }
    }

    // Fetch hotels for the trip
    const fetchHotels = async () => {
      setLoadingHotels(true)
      try {
        const checkOut = new Date(trip.endDate)
        checkOut.setDate(checkOut.getDate() + 1) // Checkout next day
        const params = new URLSearchParams({
          city: trip.destination,
          checkIn: trip.startDate.split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
          adults: trip.travelers?.toString() || '1',
        })
        const res = await fetch(`/api/search/hotels?${params}`)
        if (res.ok) {
          const data = await res.json()
          setHotels(data.hotels || [])
        }
      } catch (error) {
        console.error('Failed to fetch hotels:', error)
      } finally {
        setLoadingHotels(false)
      }
    }

    fetchFlights()
    fetchHotels()
  }, [trip])

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
          {loadingFlights ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : flights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flights.map((flight) => (
                <div
                  key={flight.id}
                  className="p-6 border rounded-lg hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {flight.originCode} → {flight.destinationCode}
                      </h3>
                      <p className="text-sm text-muted-foreground">{flight.airline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${flight.price}</p>
                      <p className="text-xs text-muted-foreground">{flight.currency}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p>
                      <span className="text-muted-foreground">Departure:</span> {new Date(flight.departure).toLocaleString()}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Arrival:</span> {new Date(flight.arrival).toLocaleString()}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Duration:</span> {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                    </p>
                    <p>
                      <span className="text-muted-foreground">Stops:</span> {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <Button className="w-full" variant="default">Book Flight</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No flights found for your trip dates and destinations.
            </div>
          )}
        </TabsContent>

        <TabsContent value="hotels" className="mt-6">
          {loadingHotels ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="p-6 border rounded-lg hover:shadow-lg transition-all"
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{hotel.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{hotel.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {hotel.address}, {hotel.city}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p>
                      <span className="text-muted-foreground">Price per night:</span> <span className="font-semibold">${hotel.pricePerNight}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Total:</span> <span className="font-bold">${hotel.totalPrice}</span>
                    </p>
                    {hotel.breakfastIncluded && (
                      <p className="text-green-600">✓ Breakfast included</p>
                    )}
                    {hotel.freeCancellation && (
                      <p className="text-green-600">✓ Free cancellation</p>
                    )}
                  </div>
                  <Button className="w-full" variant="default">Book Hotel</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hotels found for your trip dates and destination.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
