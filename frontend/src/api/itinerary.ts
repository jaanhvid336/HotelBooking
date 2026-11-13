const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export interface PaceCheckRequest {
  availableHoursPerDay: number
  days: {
    date: string
    attractions: {
      name: string
      visitMinutes: number
      travelMinutesToNext?: number
    }[]
  }[]
}

export interface DayPace {
  date: string
  attractionCount: number
  attractions: string[]
  sightseeingMinutes: number
  travelMinutes: number
  travelEstimateApproximate: boolean
  mealBreakBufferMinutes: number
  totalRequiredMinutes: number
  totalRequiredHours: number
  availableMinutes: number
  availableHours: number
  pace: 'RELAXED' | 'BALANCED' | 'PACKED'
  overloaded: boolean
  warning: string | null
  suggestion: string | null
}

export interface ItineraryPaceResponse {
  mealBreakBufferMinutes: number
  defaultTravelMinutes: number
  days: DayPace[]
}

export async function checkItineraryPace(request: PaceCheckRequest): Promise<ItineraryPaceResponse> {
  const response = await fetch(`${apiBaseUrl}/api/itinerary/pace-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const message =
      typeof body === 'object' && body !== null && 'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'Unable to check the itinerary pace right now.'
    throw new Error(message)
  }

  return response.json() as Promise<ItineraryPaceResponse>
}
