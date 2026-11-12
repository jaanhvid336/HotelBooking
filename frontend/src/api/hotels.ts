export interface Room {
  id: number
  name: string
  description: string
  pricePerNight: number
  totalUnits: number
  availableUnits: number | null
  maxGuests: number
}

export interface Hotel {
  id: number
  name: string
  city: string
  country: string
  description: string
  amenities: string[]
  rooms: Room[]
}

export interface StayDates {
  checkIn: string
  checkOut: string
}

export interface Booking {
  reference: string
  status: 'CONFIRMED' | 'CANCELLED'
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  totalAmount: number
  hotelId: number
  hotelName: string
  roomName: string
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`)
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const message =
      typeof body === 'object' && body !== null && 'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'Something went wrong. Please try again.'
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

async function send<T>(path: string, method: 'POST', body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const message =
      typeof body === 'object' && body !== null && 'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'Something went wrong. Please try again.'
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export function createBooking(details: {
  roomId: number
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  guests: number
}): Promise<Booking> {
  return send<Booking>('/api/bookings', 'POST', details)
}

export function findBooking(reference: string, email: string): Promise<Booking> {
  const params = new URLSearchParams({ reference, email })
  return request<Booking>(`/api/bookings?${params.toString()}`)
}

export function cancelBooking(reference: string, email: string): Promise<Booking> {
  return send<Booking>('/api/bookings/cancel', 'POST', { reference, email })
}

export function searchHotels(location: string, dates?: StayDates): Promise<Hotel[]> {
  const params = new URLSearchParams()
  if (location.trim()) params.set('location', location.trim())
  if (dates) {
    params.set('checkIn', dates.checkIn)
    params.set('checkOut', dates.checkOut)
  }
  const query = params.size > 0 ? `?${params.toString()}` : ''
  return request<Hotel[]>(`/api/hotels${query}`)
}

export function getHotel(id: number, dates?: StayDates): Promise<Hotel> {
  const params = new URLSearchParams()
  if (dates) {
    params.set('checkIn', dates.checkIn)
    params.set('checkOut', dates.checkOut)
  }
  const query = params.size > 0 ? `?${params.toString()}` : ''
  return request<Hotel>(`/api/hotels/${id}${query}`)
}
