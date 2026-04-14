import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateICalEvent(
  title: string,
  description: string,
  startDate: Date,
  endDate: Date,
  location?: string
): string {
  const uid = `${Date.now()}@voyai.com`
  const now = new Date().toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')
  const start = startDate.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')
  const end = endDate.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')

  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description || ''}
${location ? `LOCATION:${location}` : ''}
END:VEVENT`
}

function generateICal(tripTitle: string, tripDays: any[]): string {
  const now = new Date().toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')

  let events = ''
  tripDays.forEach((day, idx) => {
    const dayDate = new Date()
    dayDate.setDate(dayDate.getDate() + idx)
    const nextDay = new Date(dayDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const activities = day.activities || []
    const activitiesText = activities.map((a: any) => a.name || a.activity).join(', ')

    events += generateICalEvent(
      `Day ${idx + 1} - ${day.title || 'Travel Day'}`,
      `Activities: ${activitiesText}\n\n${day.description || ''}`,
      dayDate,
      nextDay,
      day.location
    )
  })

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VoyAI//VoyAI Trip Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${tripTitle}
X-WR-TIMEZONE:UTC
X-WR-CALDESC:Trip itinerary for ${tripTitle}
${events}
END:VCALENDAR`
}

export async function GET(request: NextRequest) {
  try {
    const tripId = request.nextUrl.searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID required' },
        { status: 400 }
      )
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Parse itinerary data
    const itinerary = typeof trip.itinerary === 'string' 
      ? JSON.parse(trip.itinerary) 
      : trip.itinerary

    const tripDays = Array.isArray(itinerary) ? itinerary : itinerary.days || []

    // Generate iCal format
    const icalContent = generateICal(trip.destination, tripDays)

    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${trip.destination}-itinerary.ics"`,
      },
    })
  } catch (error) {
    console.error('Error generating calendar:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
      { status: 500 }
    )
  }
}
