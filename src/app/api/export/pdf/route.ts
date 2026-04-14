import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tripId = req.nextUrl.searchParams.get('tripId')
  if (!tripId)
    return NextResponse.json(
      { error: 'Trip ID required' },
      { status: 400 }
    )

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })
  if (dbUser?.plan === 'FREE') {
    return NextResponse.json(
      { error: 'PDF export is a Pro feature' },
      { status: 403 }
    )
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: dbUser!.id },
    include: { days: true, flights: true, hotels: true },
  })

  if (!trip)
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

  // Generate HTML for PDF
  const html = generateTripHTML(trip)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'X-Trip-Title': encodeURIComponent(trip.title),
    },
  })
}

function generateTripHTML(trip: any): string {
  const itinerary = trip.aiItinerary as any
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', sans-serif; color: #0F172A; margin: 0; padding: 40px; }
  .header { border-bottom: 3px solid #F59E0B; padding-bottom: 24px; margin-bottom: 32px; }
  .trip-title { font-size: 32px; font-weight: 700; margin: 0; }
  .trip-meta { color: #64748B; font-size: 14px; margin-top: 8px; }
  .day-card { margin-bottom: 32px; page-break-inside: avoid; }
  .day-header { background: #F59E0B; color: #0F172A; padding: 12px 16px; border-radius: 8px 8px 0 0; font-weight: 700; }
  .activity { padding: 12px 16px; border-bottom: 1px solid #E2E8F0; }
  .activity:last-child { border-bottom: none; }
  .activity-time { font-size: 12px; color: #94A3B8; font-weight: 600; }
  .activity-name { font-weight: 600; margin: 2px 0; }
  .activity-desc { font-size: 13px; color: #64748B; }
</style>
</head>
<body>
  <div class="header">
    <div class="trip-title">${trip.title}</div>
    <div class="trip-meta">${trip.origin} → ${trip.destination} · ${new Date(trip.startDate).toLocaleDateString()} – ${new Date(trip.endDate).toLocaleDateString()} · ${trip.travelers} traveller(s)</div>
  </div>
  ${itinerary?.days
    ?.map(
      (day: any) => `
    <div class="day-card">
      <div class="day-header">Day ${day.dayNumber} — ${day.title}</div>
      ${day.activities
        ?.map(
          (a: any) => `
        <div class="activity">
          <div class="activity-time">${a.time}</div>
          <div class="activity-name">${a.name}</div>
          <div class="activity-desc">${a.description}</div>
        </div>
      `
        )
        .join('') ?? ''}
    </div>
  `
    )
    .join('') ?? ''}
</body>
</html>`
}
