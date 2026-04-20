import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tripId = req.nextUrl.searchParams.get('tripId')
    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID required' },
        { status: 400 }
      )
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check Pro plan for PDF export
    if (dbUser.plan === 'FREE') {
      return NextResponse.json(
        { error: 'PDF export is a Pro feature. Upgrade to export itineraries.' },
        { status: 403 }
      )
    }

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: dbUser.id },
      include: {
        days: true,
      },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Generate Mapbox static map URL (note: coordinates not stored in trip model)
    let mapImageUrl = null
    // Can be added in future if coordinates are stored

    // Generate HTML for PDF
    const html = generateTripHTML(trip, mapImageUrl)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${trip.title.replace(/[^a-z0-9]/gi, '_')}.html"`,
      },
    })
  } catch (error) {
    console.error('Error in PDF export:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error details:', { message: errorMessage, stack: errorStack })
    return NextResponse.json(
      { error: 'Failed to export PDF', details: errorMessage },
      { status: 500 }
    )
  }
}

function generateTripHTML(trip: any, mapImageUrl?: string | null): string {
  const startDate = new Date(trip.startDate)
  const endDate = new Date(trip.endDate)
  const duration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trip.title} - Trip Itinerary</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      color: #0F172A;
      background: #F8FAFC;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .cover {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    .cover h1 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .cover-meta {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    .trip-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
    }
    .stat-label {
      font-size: 12px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 5px;
    }
    .map-section {
      padding: 40px;
      background: #F1F5F9;
      text-align: center;
    }
    .map-section img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    .content {
      padding: 40px;
    }
    .day-card {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .day-header {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-weight: 600;
      font-size: 16px;
    }
    .activities-section {
      margin-left: 20px;
    }
    .activity {
      padding: 16px;
      margin-bottom: 12px;
      border-left: 4px solid #F59E0B;
      background: #FFFBEB;
      border-radius: 4px;
    }
    .activity-time {
      font-size: 12px;
      font-weight: 600;
      color: #D97706;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .activity-name {
      font-weight: 600;
      font-size: 16px;
      margin: 6px 0;
      color: #0F172A;
    }
    .activity-description {
      font-size: 14px;
      color: #64748B;
      margin-top: 6px;
    }
    .restaurant {
      padding: 16px;
      margin-bottom: 12px;
      border-left: 4px solid #8B5CF6;
      background: #F5F3FF;
      border-radius: 4px;
    }
    .restaurant-time {
      font-size: 12px;
      font-weight: 600;
      color: #7C3AED;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .restaurant-name {
      font-weight: 600;
      font-size: 16px;
      margin: 6px 0;
      color: #0F172A;
    }
    .footer {
      background: #F1F5F9;
      padding: 20px 40px;
      border-top: 1px solid #E2E8F0;
      font-size: 12px;
      color: #64748B;
      text-align: center;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border-radius: 0;
      }
      .day-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="cover">
      <h1>${trip.title}</h1>
      <div class="cover-meta">
        ${trip.origin} to ${trip.destination}
      </div>
      <div class="trip-stats">
        <div class="stat">
          <div class="stat-value">${duration}</div>
          <div class="stat-label">Days</div>
        </div>
        <div class="stat">
          <div class="stat-value">${trip.travelers}</div>
          <div class="stat-label">Travellers</div>
        </div>
        <div class="stat">
          <div class="stat-value">${startDate.toLocaleDateString()}</div>
          <div class="stat-label">Start Date</div>
        </div>
      </div>
    </div>

    ${mapImageUrl ? `
    <div class="map-section">
      <img src="${mapImageUrl}" alt="Trip destination map" />
    </div>
    ` : ''}

    <div class="content">
      ${trip.days
        .sort((a: any, b: any) => a.dayNumber - b.dayNumber)
        .map(
          (day: any) => `
        <div class="day-card">
          <div class="day-header">
            Day ${day.dayNumber} - ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            ${day.title ? ` - ${day.title}` : ''}
          </div>
          <div class="activities-section">
            ${day.notes ? `<p style="margin-bottom: 16px; color: #64748B;">${day.notes}</p>` : ''}
            ${day.activities && Array.isArray(day.activities) && day.activities.length > 0
              ? day.activities
                  .map(
                    (activity: any) => `
                  <div class="activity">
                    <div class="activity-time">${typeof activity === 'string' ? activity : JSON.stringify(activity)}</div>
                  </div>
                `
                  )
                  .join('')
              : '<p style="color: #94A3B8;">No activities scheduled for this day</p>'}
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="footer">
      <p>Generated by VoyAI Travel Planner</p>
      <p>Plan exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
  </div>

  <script>
    // Auto-print functionality (optional - users can disable)
    // Uncomment the line below to auto-open print dialog
    // window.onload = () => window.print();
  </script>
</body>
</html>`
}
