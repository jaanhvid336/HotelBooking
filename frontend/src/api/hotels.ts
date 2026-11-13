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

async function responseError(response: Response): Promise<Error> {
  const body: unknown = await response.json().catch(() => null)
  if (typeof body === 'object' && body !== null) {
    const errorBody = body as Record<string, unknown>
    for (const field of ['message', 'detail']) {
      if (typeof errorBody[field] === 'string') return new Error(errorBody[field])
    }
    if (response.status === 404) {
      return new Error('The API endpoint was not found (HTTP 404). This page may be connected to an older backend; open the latest app server and try again.')
    }
    if (typeof errorBody.error === 'string') {
      return new Error(`${errorBody.error} (HTTP ${response.status}). Please try again.`)
    }
  }

  if (response.status === 502 || response.status === 503) {
    return new Error('The hotel API is unavailable. Start the backend and check its MySQL connection, then try again.')
  }

  return new Error(`The request failed with HTTP ${response.status}. Please try again.`)
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`)
  if (!response.ok) throw await responseError(response)
  return response.json() as Promise<T>
}

async function send<T>(path: string, method: 'POST', body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw await responseError(response)
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
