export interface GuidePlace {
  name: string
  note: string
  visitMinutes: number
  travelMinutesToNext?: number
}

export interface DestinationGuide {
  city: string
  seasonLabel: string
  preferredMonths: number[]
  peakAdvice: string
  mixedSeasonAdvice: string
  offSeasonAdvice: string
  places: GuidePlace[]
  sources: { label: string; url: string }[]
}

const guides: Record<string, DestinationGuide> = {
  jaipur: {
    city: 'Jaipur',
    seasonLabel: 'cooler winter months (November to February)',
    preferredMonths: [10, 11, 0, 1],
    peakAdvice: 'Your stay falls in Jaipur’s cooler sightseeing season. Plan the outdoor forts in the morning and leave time for the old-city palaces and bazaars.',
    mixedSeasonAdvice: 'Your dates cross Jaipur’s cooler season and a warmer shoulder period. Put outdoor forts earlier in the day and keep the plan flexible.',
    offSeasonAdvice: 'Your dates are outside Jaipur’s cooler winter window. Rajasthan can be very hot in warmer months, so plan outdoor sights early or late and take a midday break.',
    places: [
      { name: 'Amber (Amer) Fort', note: 'Hilltop fort and courtyards; allow time for the climb and views.', visitMinutes: 150 },
      { name: 'City Palace', note: 'Palace courtyards, royal collections, and architecture in the old city.', visitMinutes: 120 },
      { name: 'Hawa Mahal', note: 'The Palace of Winds, known for its pink façade and windowed frontage.', visitMinutes: 60 },
      { name: 'Jantar Mantar', note: 'Historic astronomical observatory near City Palace and Hawa Mahal.', visitMinutes: 75 },
    ],
    sources: [
      { label: 'Incredible India: Jaipur sights', url: 'https://www.incredibleindia.gov.in/en/rajasthan/jaipur/city-palace' },
      { label: 'Incredible India: winter visit guidance', url: 'https://www.incredibleindia.gov.in/en/rajasthan/jaipur/dialab-lake' },
    ],
  },
  goa: {
    city: 'Goa',
    seasonLabel: 'beach-friendly winter months (November to February)',
    preferredMonths: [10, 11, 0, 1],
    peakAdvice: 'Your dates fall in Goa’s popular beach season. Keep a beach day and an Old Goa heritage visit in the plan.',
    mixedSeasonAdvice: 'Your dates span more than one seasonal pattern. Keep beach time flexible and balance it with heritage stops that work in different weather.',
    offSeasonAdvice: 'Goa has something to offer year-round. Monsoon months bring greener scenery and rain; hotter months suit early or evening outings. Check sea and activity conditions locally.',
    places: [
      { name: 'Old Goa churches', note: 'Visit the Basilica of Bom Jesus and Se Cathedral for heritage architecture.', visitMinutes: 120 },
      { name: 'Fort Aguada', note: 'Historic fort overlooking the coast; pair with nearby Sinquerim.', visitMinutes: 90 },
      { name: 'Anjuna and Vagator', note: 'Coastal scenery, markets, and the Chapora Fort viewpoint.', visitMinutes: 150 },
      { name: 'Baga and Calangute', note: 'Popular north-Goa beaches with cafés and water activities.', visitMinutes: 150 },
    ],
    sources: [
      { label: 'Incredible India: Goa seasons', url: 'https://www.incredibleindia.gov.in/en/goa/goa/what-is-the-best-season-to-visit-goa' },
      { label: 'Incredible India: Goa attractions', url: 'https://www.incredibleindia.gov.in/en/destinations/goa' },
    ],
  },
  manali: {
    city: 'Manali',
    seasonLabel: 'April to July and October to December sightseeing periods',
    preferredMonths: [3, 4, 5, 6, 9, 10, 11],
    peakAdvice: 'Your dates are in a commonly popular Manali sightseeing period. Keep outdoor plans flexible because mountain weather can change quickly.',
    mixedSeasonAdvice: 'Your stay spans seasons in the mountains. Check local road and attraction conditions before planning longer excursions.',
    offSeasonAdvice: 'Your dates are outside the usual sightseeing window. Snow, cold, or changing mountain conditions can affect access; check local updates before day trips.',
    places: [
      { name: 'Hidimba Devi Temple', note: 'Wood-and-stone temple set among deodar trees near town.', visitMinutes: 75 },
      { name: 'Solang Valley', note: 'Mountain valley for views and seasonal outdoor activities.', visitMinutes: 180 },
      { name: 'Vashisht village and temple', note: 'A short outing from town with a temple and hot springs.', visitMinutes: 120 },
      { name: 'Manali Mall Road', note: 'A relaxed walk for cafés, local shops, and an easy evening.', visitMinutes: 120 },
    ],
    sources: [
      { label: 'Himachal Tourism: Manali', url: 'https://himachaltourism.gov.in/destination/manali/' },
      { label: 'Himachal Tourism: seasons', url: 'https://himachaltourism.gov.in/types/seasonal/' },
    ],
  },
  kochi: {
    city: 'Kochi',
    seasonLabel: 'the pleasant November to February period',
    preferredMonths: [10, 11, 0, 1],
    peakAdvice: 'Your dates fall in Kerala’s commonly preferred cooler season. Fort Kochi’s heritage stops and waterfront are a good fit for the itinerary.',
    mixedSeasonAdvice: 'Your dates cross seasons. Keep outdoor walks flexible and use the heritage museums and churches as alternate stops.',
    offSeasonAdvice: 'Your dates are outside the November to February peak period. Warmer or monsoon weather may affect long walks, so keep indoor heritage stops as flexible alternatives.',
    places: [
      { name: 'Fort Kochi waterfront', note: 'See the Chinese fishing nets and walk the historic shoreline.', visitMinutes: 90 },
      { name: 'St. Francis Church', note: 'Historic church in the Fort Kochi heritage district.', visitMinutes: 60 },
      { name: 'Mattancherry Palace', note: 'Museum and palace known for Kerala murals and regional history.', visitMinutes: 90 },
      { name: 'Jew Town and Paradesi Synagogue', note: 'Heritage lanes and historic sites around Mattancherry.', visitMinutes: 120 },
    ],
    sources: [
      { label: 'Kerala Tourism: visit seasons', url: 'https://www.keralatourism.org/faq/20-things-to-know-before-you-visit-kerala' },
      { label: 'Kerala Tourism: Fort Kochi attractions', url: 'https://www.keralatourism.org/destination/fort-kochi/422/' },
    ],
  },
  udaipur: {
    city: 'Udaipur',
    seasonLabel: 'the September to March visit season',
    preferredMonths: [8, 9, 10, 11, 0, 1, 2],
    peakAdvice: 'Your stay falls within Udaipur’s suggested visit season. Put the palace and lakeside stops on separate parts of the day.',
    mixedSeasonAdvice: 'Your dates partly overlap Udaipur’s suggested season. Keep lake and boat plans flexible and balance them with palace and temple visits.',
    offSeasonAdvice: 'Your dates are outside Udaipur’s suggested September to March period. Warmer weather is possible, so plan outdoor lake visits early or near sunset.',
    places: [
      { name: 'City Palace', note: 'Palace museum and courtyards overlooking Lake Pichola.', visitMinutes: 150 },
      { name: 'Lake Pichola and Jag Mandir', note: 'Lakeside views and boat trips when services are operating.', visitMinutes: 150 },
      { name: 'Jagdish Temple', note: 'Carved historic temple in the old city.', visitMinutes: 60 },
      { name: 'Fateh Sagar Lake', note: 'A second lakeside stop for a relaxed walk and views.', visitMinutes: 90 },
    ],
    sources: [
      { label: 'Incredible India: Udaipur seasons and places', url: 'https://www.incredibleindia.gov.in/en/rajasthan/udaipur' },
      { label: 'Incredible India: City Palace', url: 'https://www.incredibleindia.gov.in/en/rajasthan/udaipur/city-palace' },
    ],
  },
}

export interface PlannedDay {
  date: string
  places: GuidePlace[]
}

export function getDestinationGuide(city: string): DestinationGuide | undefined {
  return guides[city.trim().toLowerCase()]
}

function dateAtOffset(date: string, offset: number): string {
  const result = new Date(`${date}T12:00:00`)
  result.setDate(result.getDate() + offset)
  const year = result.getFullYear()
  const month = String(result.getMonth() + 1).padStart(2, '0')
  const day = String(result.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getSeasonAdvice(guide: DestinationGuide, checkIn: string, nights: number): string {
  let preferredNights = 0
  for (let offset = 0; offset < nights; offset += 1) {
    const month = new Date(`${dateAtOffset(checkIn, offset)}T00:00:00`).getMonth()
    if (guide.preferredMonths.includes(month)) preferredNights += 1
  }
  if (preferredNights === nights) return guide.peakAdvice
  if (preferredNights > 0) return guide.mixedSeasonAdvice
  return guide.offSeasonAdvice
}

export function buildTripPlan(guide: DestinationGuide, checkIn: string, nights: number): PlannedDay[] {
  const dayCount = Math.max(0, Math.trunc(nights))
  const placeCount = guide.places.length
  return Array.from({ length: dayCount }, (_, index) => {
    const firstPlace = placeCount > 0 ? index % placeCount : 0
    const places = placeCount === 0
      ? []
      : [guide.places[firstPlace], guide.places[(firstPlace + 1) % placeCount]]

    return {
      date: dateAtOffset(checkIn, index),
      places,
    }
  })
}
