import { HotelSearchParams, Hotel } from '@/types/hotel'
import { redis } from './redis'

// Booking.com Affiliate API v2
const BASE_URL = 'https://distribution-xml.booking.com/2.9/json'

export async function searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
  const cacheKey = `hotels:${JSON.stringify(params)}`
  const cached = await redis.get<Hotel[]>(cacheKey)
  if (cached) return cached

  const nights = Math.ceil(
    (new Date(params.checkOut).getTime() -
      new Date(params.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const searchParams = new URLSearchParams({
    city_ids: await getCityId(params.city),
    checkin: params.checkIn,
    checkout: params.checkOut,
    room1: `A,A`.repeat(Math.ceil(params.adults / 2)),
    rows: '20',
    order_by: 'popularity',
    currency: params.currency ?? 'USD',
    ...(params.minRating && {
      review_score: (params.minRating * 10).toString(),
    }),
  })

  const res = await fetch(`${BASE_URL}/hotels?${searchParams}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.BOOKING_AFFILIATE_ID}:${process.env.BOOKING_API_KEY}`
      ).toString('base64')}`,
    },
  })

  if (!res.ok) throw new Error(`Booking.com API error: ${res.status}`)

  const data = await res.json()
  const hotels = parseBookingHotels(data.result ?? [], params, nights)

  await redis.setex(cacheKey, 1800, hotels) // 30-minute cache
  return hotels
}

async function getCityId(cityName: string): Promise<string> {
  // Cache city ID lookups indefinitely
  const cached = await redis.get<string>(
    `city:${cityName.toLowerCase()}`
  )
  if (cached) return cached

  const res = await fetch(
    `${BASE_URL}/cities?name=${encodeURIComponent(cityName)}&rows=1`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.BOOKING_AFFILIATE_ID}:${process.env.BOOKING_API_KEY}`
        ).toString('base64')}`,
      },
    }
  )
  const data = await res.json()
  const id = data.result?.[0]?.city_id?.toString() ?? '-2601889'
  await redis.set(`city:${cityName.toLowerCase()}`, id)
  return id
}

function parseBookingHotels(
  results: any[],
  params: HotelSearchParams,
  nights: number
): Hotel[] {
  return results.map((h: any) => ({
    id: h.hotel_id?.toString(),
    name: h.name,
    address: h.address,
    city: h.city,
    country: h.country,
    lat: h.location?.latitude ?? 0,
    lng: h.location?.longitude ?? 0,
    stars: h.stars ?? 0,
    rating: (h.review_score ?? 0) / 2, // Booking uses 10-point scale
    reviewCount: h.number_of_reviews ?? 0,
    pricePerNight: h.price_breakdown?.gross_price ?? 0,
    totalPrice: (h.price_breakdown?.gross_price ?? 0) * nights,
    currency: params.currency ?? 'USD',
    imageUrls: h.main_photo_url ? [h.main_photo_url] : [],
    amenities: h.amenities_cleaned ?? [],
    description: h.description ?? '',
    bookingUrl: buildAffiliateUrl(h.hotel_id, params),
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    freeCancellation: h.is_free_cancellable ?? false,
    breakfastIncluded: h.breakfast_included ?? false,
  }))
}

function buildAffiliateUrl(hotelId: string, params: HotelSearchParams): string {
  // Build a Booking.com affiliate deep link
  return (
    `https://www.booking.com/hotel/xx/hotel-${hotelId}.html?` +
    `aid=${process.env.BOOKING_AFFILIATE_ID}` +
    `&checkin=${params.checkIn}` +
    `&checkout=${params.checkOut}` +
    `&no_rooms=1` +
    `&group_adults=${params.adults}`
  )
}
