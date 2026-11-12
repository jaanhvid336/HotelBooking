import { useState } from 'react'
import type { FormEvent } from 'react'
import { cancelBooking, createBooking, findBooking, getHotel, searchHotels } from './api/hotels'
import type { Booking, Hotel, StayDates } from './api/hotels'
import goaPhoto from './assets/travel/goa-coast.jpg'
import jaipurPhoto from './assets/travel/jaipur-haveli.jpg'
import kochiPhoto from './assets/travel/kochi-waterfront.jpg'
import manaliPhoto from './assets/travel/manali-lodge.jpg'
import udaipurPhoto from './assets/travel/udaipur-lake.jpg'
import { buildTripPlan, getDestinationGuide, getSeasonAdvice } from './data/destinationGuides'
import './App.css'

const destinationPhotos: Record<string, string> = {
  goa: goaPhoto,
  jaipur: jaipurPhoto,
  kochi: kochiPhoto,
  manali: manaliPhoto,
  udaipur: udaipurPhoto,
}

function localDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function stayNights(checkIn: string, checkOut: string) {
  return Math.round((Date.parse(`${checkOut}T00:00:00`) - Date.parse(`${checkIn}T00:00:00`)) / 86_400_000)
}

const today = localDateString(new Date())
const nextDay = new Date()
nextDay.setDate(nextDay.getDate() + 1)
const tomorrow = localDateString(nextDay)

function App() {
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [confirmedHotel, setConfirmedHotel] = useState<Hotel | null>(null)
  const [savedHotels, setSavedHotels] = useState<Hotel[]>([])
  const [compareHotels, setCompareHotels] = useState<Hotel[]>([])
  const [compareError, setCompareError] = useState('')
  const [savedError, setSavedError] = useState('')
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [error, setError] = useState('')
  const [searchComplete, setSearchComplete] = useState(false)
  const [bookingRoomId, setBookingRoomId] = useState<number | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [bookingError, setBookingError] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [lookupReference, setLookupReference] = useState('')
  const [lookupEmail, setLookupEmail] = useState('')
  const [managedBooking, setManagedBooking] = useState<Booking | null>(null)
  const [isManagingBooking, setIsManagingBooking] = useState(false)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('stillstay-favorites') ?? '[]') as number[]
    } catch {
      return []
    }
  })
  const dates: StayDates | undefined = checkIn && checkOut ? { checkIn, checkOut } : undefined
  const visibleHotels = showSavedOnly ? savedHotels : hotels

  function toggleFavorite(hotel: Hotel) {
    const isSaved = favorites.includes(hotel.id)
    const next = isSaved
      ? favorites.filter((id) => id !== hotel.id)
      : [...favorites, hotel.id]
    setFavorites(next)
    localStorage.setItem('stillstay-favorites', JSON.stringify(next))
    if (isSaved) {
      setSavedHotels(savedHotels.filter((item) => item.id !== hotel.id))
      setCompareHotels(compareHotels.filter((item) => item.id !== hotel.id))
      setShowComparison(false)
    } else if (!savedHotels.some((item) => item.id === hotel.id)) {
      setSavedHotels([...savedHotels, hotel])
    }
  }

  async function handleToggleSavedView() {
    if (showSavedOnly) {
      setShowSavedOnly(false)
      setCompareMode(false)
      setShowComparison(false)
      setCompareHotels([])
      return
    }

    setShowSavedOnly(true)
    setSearchComplete(true)
    setCompareMode(false)
    setShowComparison(false)
    setCompareHotels([])
    setSavedError('')
    if (favorites.length === 0) {
      setSavedHotels([])
      return
    }

    setIsLoadingSaved(true)
    const results = await Promise.all(favorites.map((hotelId) => getHotel(hotelId, dates).catch(() => null)))
    const loaded = results.filter((hotel): hotel is Hotel => hotel !== null)
    setSavedHotels(loaded)
    if (loaded.length < favorites.length) {
      setSavedError('Some saved stays could not be refreshed. Try searching again or remove unavailable entries.')
    }
    setIsLoadingSaved(false)
  }

  function toggleComparison(hotel: Hotel) {
    setCompareError('')
    setShowComparison(false)
    const isAlreadyComparing = compareHotels.some((item) => item.id === hotel.id)
    if (isAlreadyComparing) {
      setCompareHotels(compareHotels.filter((item) => item.id !== hotel.id))
      return
    }
    if (compareHotels.length >= 3) {
      setCompareError('Compare up to three stays at a time. Remove one to add another.')
      return
    }
    setCompareHotels([...compareHotels, hotel])
  }

  async function handleBooking(event: FormEvent<HTMLFormElement>, roomId: number) {
    event.preventDefault()
    setBookingError('')
    if (!dates) {
      setBookingError('Choose check-in and check-out dates before booking.')
      return
    }
    setIsBooking(true)
    try {
      const confirmation = await createBooking({
        roomId, guestName, guestEmail, checkIn: dates.checkIn, checkOut: dates.checkOut, guests: guestCount,
      })
      setBooking(confirmation)
      setConfirmedHotel(selectedHotel)
      setLookupReference(confirmation.reference)
      setLookupEmail(confirmation.guestEmail)
      setBookingRoomId(null)
      setGuestName('')
      setGuestEmail('')
    } catch (bookingFailure) {
      setBookingError(bookingFailure instanceof Error ? bookingFailure.message : 'Unable to complete this booking.')
    } finally {
      setIsBooking(false)
    }
  }

  async function handleFindBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBookingError('')
    setIsManagingBooking(true)
    try {
      setManagedBooking(await findBooking(lookupReference, lookupEmail))
    } catch (lookupFailure) {
      setManagedBooking(null)
      setBookingError(lookupFailure instanceof Error ? lookupFailure.message : 'Unable to find this booking.')
    } finally {
      setIsManagingBooking(false)
    }
  }

  async function handleCancelBooking() {
    if (!managedBooking) return
    setBookingError('')
    setIsManagingBooking(true)
    try {
      setManagedBooking(await cancelBooking(managedBooking.reference, lookupEmail))
    } catch (cancelFailure) {
      setBookingError(cancelFailure instanceof Error ? cancelFailure.message : 'Unable to cancel this booking.')
    } finally {
      setIsManagingBooking(false)
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSelectedHotel(null)
    setShowSavedOnly(false)
    setCompareMode(false)
    setShowComparison(false)
    setCompareHotels([])
    setCompareError('')
    if (Boolean(checkIn) !== Boolean(checkOut)) {
      setError('Add both check-in and check-out dates, or leave both empty.')
      return
    }
    if (checkIn && checkOut <= checkIn) {
      setError('Check-out must be after check-in.')
      return
    }
    setIsSearching(true)
    try {
      const results = await searchHotels(location, dates)
      setHotels(results)
      setSearchComplete(true)
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Unable to search stays.')
      setHotels([])
      setSearchComplete(false)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleViewHotel(id: number) {
    setError('')
    setIsLoadingDetails(true)
    try {
      setSelectedHotel(await getHotel(id, dates))
    } catch (detailsError) {
      setError(detailsError instanceof Error ? detailsError.message : 'Unable to load this stay.')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Stillstay home">
          <span className="wordmark-mark" aria-hidden="true">s</span>
          stillstay
        </a>
        <nav className="header-links" aria-label="Main navigation">
          <a href="#stays">Find a stay</a>
          <a href="#manage-booking">Manage booking</a>
          <a href="#about">Our approach</a>
        </nav>
        <button className="header-cta saved-toggle" type="button" onClick={() => { void handleToggleSavedView(); document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' }) }}>
          {showSavedOnly ? 'Back to search' : `Saved stays (${favorites.length})`}
        </button>
      </header>

      <section className="hero" id="search" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A little more room to feel at home</p>
          <h1 id="hero-title">Go somewhere.<br /><em>Feel everywhere.</em></h1>
          <p className="hero-description">
            Find welcoming places, thoughtful details, and a stay that feels like part of the journey.
          </p>
          <a
            className="hero-discover"
            href="#stays"
            onClick={(event) => {
              event.preventDefault()
              document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          >
            <span>Discover your next stay</span>
            <span className="hero-discover-arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <div className="hero-art" role="img" aria-label="A traditional houseboat on the Kerala backwaters at sunset">
          <span className="art-note">Somewhere worth slowing down</span>
        </div>
      </section>

      <form className="search-panel" id="stays" aria-label="Search for a hotel" onSubmit={handleSearch}>
        <label className="search-field">
          <span className="field-label">Where to?</span>
          <input
            className="field-input"
            type="text"
            placeholder="City or destination"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>
        <label className="search-field">
          <span className="field-label">Check in</span>
          <input
            className="field-input"
            type="date"
            min={today}
            value={checkIn}
            onChange={(event) => {
              setCheckIn(event.target.value)
              setCompareHotels([])
              setShowComparison(false)
              if (showSavedOnly) setShowSavedOnly(false)
              if (checkOut && event.target.value && checkOut <= event.target.value) setCheckOut('')
            }}
          />
        </label>
        <label className="search-field">
          <span className="field-label">Check out</span>
          <input
            className="field-input"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(event) => {
              setCheckOut(event.target.value)
              setCompareHotels([])
              setShowComparison(false)
              if (showSavedOnly) setShowSavedOnly(false)
            }}
          />
        </label>
        <button className="search-button" type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search stays'} <span aria-hidden="true">→</span>
        </button>
      </form>

      <section className="results-section" aria-live="polite">
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        {compareError && <p className="notice notice-error" role="alert">{compareError}</p>}
        {searchComplete && (
          <>
            <div className="results-heading">
              <div>
                <p className="eyebrow">A good place to begin</p>
                <h2>{showSavedOnly ? 'Your saved stays' : `${hotels.length} ${hotels.length === 1 ? 'stay' : 'stays'} to explore`}</h2>
              </div>
              {dates && <p className="results-dates">{dates.checkIn} — {dates.checkOut}</p>}
            </div>
            {savedError && showSavedOnly && <p className="notice notice-error" role="alert">{savedError}</p>}
            {isLoadingSaved && showSavedOnly && <p className="empty-state">Loading your saved stays for these dates...</p>}
            {showSavedOnly && !isLoadingSaved && savedHotels.length >= 2 && !compareMode && (
              <div className="compare-invite">
                <div><strong>Would you like to compare these options?</strong><span>Select saved stays to compare them side by side.</span></div>
                <button className="search-button" type="button" onClick={() => { setCompareMode(true); setCompareError('') }}>Yes, compare options</button>
              </div>
            )}
            {showSavedOnly && compareMode && (
              <div className="compare-controls">
                <p>Select two or three saved stays. <strong>{compareHotels.length}/3 selected</strong></p>
                <div>
                  <button className="search-button" type="button" disabled={compareHotels.length < 2} onClick={() => setShowComparison(true)}>Compare selected options</button>
                  <button className="saved-reset" type="button" onClick={() => { setCompareMode(false); setCompareHotels([]); setShowComparison(false) }}>Cancel</button>
                </div>
              </div>
            )}
            {showSavedOnly && !isLoadingSaved && savedHotels.length === 1 && (
              <p className="empty-state">Save at least one more stay to compare options side by side.</p>
            )}
            {isLoadingSaved && showSavedOnly ? null : visibleHotels.length === 0 ? (
              <p className="empty-state">{showSavedOnly ? 'No stays saved yet. Search hotels and choose “Save this stay”.' : 'No stays found for that destination. Try another city or country.'}</p>
            ) : (
              <div className="hotel-grid">
                {visibleHotels.map((hotel) => {
                  const room = hotel.rooms[0]
                  return (
                    <article className="hotel-card" key={hotel.id}>
                      <div className="hotel-art">
                        <img
                          src={destinationPhotos[hotel.city.toLowerCase()] ?? udaipurPhoto}
                          alt={`${hotel.city} landscape and stay`}
                          loading="lazy"
                        />
                        <span>{hotel.city}, {hotel.country}</span>
                      </div>
                      <div className="hotel-card-content">
                        <p className="hotel-location">{hotel.city} <span>·</span> {hotel.country}</p>
                        <h3>{hotel.name}</h3>
                        <p className="hotel-description">{hotel.description}</p>
                        <button className="favorite-button" type="button" onClick={() => toggleFavorite(hotel)} aria-pressed={favorites.includes(hotel.id)}>
                          {favorites.includes(hotel.id) ? 'Saved to shortlist' : 'Save this stay'}
                        </button>
                        {showSavedOnly && compareMode && (
                          <button className="comparison-toggle" type="button" onClick={() => toggleComparison(hotel)} aria-pressed={compareHotels.some((item) => item.id === hotel.id)}>
                            {compareHotels.some((item) => item.id === hotel.id) ? 'Selected for comparison' : 'Select to compare'}
                          </button>
                        )}
                        <div className="hotel-card-bottom">
                          <div>
                            <strong>{room ? `₹${room.pricePerNight.toLocaleString('en-IN')}` : 'Unavailable'}</strong>
                            {room && <span className="price-unit"> / night</span>}
                            {room && dates && room.availableUnits !== null && (
                              <span className="availability">{room.availableUnits} rooms available</span>
                            )}
                          </div>
                          <button
                            className="card-link"
                            type="button"
                            onClick={() => handleViewHotel(hotel.id)}
                            disabled={isLoadingDetails}
                          >
                            View stay <span aria-hidden="true">→</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>

      {showSavedOnly && compareMode && showComparison && compareHotels.length >= 2 && (
        <section className="compare-section" aria-labelledby="compare-title">
          <div className="compare-heading">
            <div>
              <p className="eyebrow">Make the choice that fits</p>
              <h2 id="compare-title">Stay comparison</h2>
              <p>Comparing the saved stays you selected for {dates ? `${dates.checkIn} to ${dates.checkOut}` : 'your selected dates'}.</p>
            </div>
            <button className="saved-reset" type="button" onClick={() => setShowComparison(false)}>Edit selection</button>
          </div>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">Stay details</th>
                  {compareHotels.map((hotel) => (
                    <th scope="col" key={hotel.id}>
                      <strong>{hotel.name}</strong>
                      <button className="compare-remove" type="button" onClick={() => toggleComparison(hotel)}>Remove</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Location</th>
                  {compareHotels.map((hotel) => <td key={hotel.id}>{hotel.city}, {hotel.country}</td>)}
                </tr>
                <tr>
                  <th scope="row">Room</th>
                  {compareHotels.map((hotel) => <td key={hotel.id}>{hotel.rooms[0]?.name ?? 'No rooms listed'}</td>)}
                </tr>
                <tr>
                  <th scope="row">Price per night</th>
                  {compareHotels.map((hotel) => {
                    const room = hotel.rooms[0]
                    return <td key={hotel.id}>{room ? `₹${room.pricePerNight.toLocaleString('en-IN')}` : 'Unavailable'}</td>
                  })}
                </tr>
                <tr>
                  <th scope="row">Estimated stay total</th>
                  {compareHotels.map((hotel) => {
                    const room = hotel.rooms[0]
                    const nights = dates ? stayNights(dates.checkIn, dates.checkOut) : 0
                    return <td key={hotel.id}>{room && nights > 0 ? `₹${(room.pricePerNight * nights).toLocaleString('en-IN')} · ${nights} ${nights === 1 ? 'night' : 'nights'}` : 'Choose dates'}</td>
                  })}
                </tr>
                <tr>
                  <th scope="row">Availability</th>
                  {compareHotels.map((hotel) => {
                    const room = hotel.rooms[0]
                    return <td key={hotel.id}>{room?.availableUnits === null || !room ? 'Choose dates' : `${room.availableUnits} of ${room.totalUnits} rooms`}</td>
                  })}
                </tr>
                <tr>
                  <th scope="row">Highlights</th>
                  {compareHotels.map((hotel) => <td key={hotel.id}>{hotel.amenities.join(' · ') || 'No highlights listed'}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedHotel && (
        <section className="detail-panel" aria-labelledby="detail-title">
          <button className="detail-close" type="button" onClick={() => setSelectedHotel(null)}>Close</button>
          <p className="eyebrow">{selectedHotel.city} · {selectedHotel.country}</p>
          <h2 id="detail-title">{selectedHotel.name}</h2>
          <p className="detail-description">{selectedHotel.description}</p>
          <h3>Thoughtful touches</h3>
          <ul className="amenity-list">
            {selectedHotel.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}
          </ul>
          <h3>Rooms</h3>
          <div className="room-list">
            {selectedHotel.rooms.map((room) => (
              <div className="room-row" key={room.id}>
                <div>
                  <strong>{room.name}</strong>
                  <p>{room.description}</p>
                  <span>
                    {dates && room.availableUnits !== null
                      ? `${room.availableUnits} of ${room.totalUnits} rooms available`
                      : `${room.totalUnits} rooms in this category`}
                    {' · '}up to {room.maxGuests} guests
                  </span>
                </div>
                <div className="room-booking-action">
                  <strong>₹{room.pricePerNight.toLocaleString('en-IN')} <small>/ night</small></strong>
                  <button
                    className="book-room-button"
                    type="button"
                    disabled={dates !== undefined && room.availableUnits !== null && room.availableUnits <= 0}
                    onClick={() => { setBookingRoomId(bookingRoomId === room.id ? null : room.id); setBookingError('') }}
                  >
                    {dates && room.availableUnits !== null && room.availableUnits <= 0 ? 'Fully booked' : bookingRoomId === room.id ? 'Close form' : 'Book this room'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {bookingRoomId !== null && (() => {
            const room = selectedHotel.rooms.find((candidate) => candidate.id === bookingRoomId)
            if (!room) return null
            const nights = dates ? stayNights(dates.checkIn, dates.checkOut) : 0
            return (
              <form className="booking-form" onSubmit={(event) => handleBooking(event, room.id)}>
                <h3>Reserve {room.name}</h3>
                {dates ? (
                  <p className="booking-estimate">{nights} {nights === 1 ? 'night' : 'nights'} · estimated total <strong>₹{(room.pricePerNight * nights).toLocaleString('en-IN')}</strong></p>
                ) : (
                  <p className="booking-estimate">Choose your dates in the search form above to see your total.</p>
                )}
                <label className="booking-input"><span>Your name</span><input required maxLength={150} value={guestName} onChange={(event) => setGuestName(event.target.value)} /></label>
                <label className="booking-input"><span>Email address</span><input required type="email" maxLength={254} value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} /></label>
                <label className="booking-input"><span>Guests</span><select value={guestCount} onChange={(event) => setGuestCount(Number(event.target.value))}>{Array.from({ length: room.maxGuests }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
                {bookingError && <p className="notice notice-error" role="alert">{bookingError}</p>}
                <button className="search-button" type="submit" disabled={isBooking || !dates}>{isBooking ? 'Confirming...' : 'Confirm booking'}</button>
              </form>
            )
          })()}
        </section>
      )}

      {booking && (
        <section className="booking-confirmation trip-ready" aria-live="polite">
          <div className="trip-confirmation-heading">
            <p className="eyebrow">Your stay is confirmed</p>
            <h2>You're all set, {booking.guestName}.</h2>
            <p>{booking.hotelName} · {booking.roomName}</p>
          </div>
          <dl className="trip-summary">
            <div><dt>Check-in</dt><dd>{booking.checkIn}</dd></div>
            <div><dt>Check-out</dt><dd>{booking.checkOut}</dd></div>
            <div><dt>Length</dt><dd>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</dd></div>
            <div><dt>Guests</dt><dd>{booking.guests}</dd></div>
            <div><dt>Total</dt><dd>₹{booking.totalAmount.toLocaleString('en-IN')}</dd></div>
            <div><dt>Booking reference</dt><dd className="trip-reference">{booking.reference}</dd></div>
          </dl>
          <p className="confirmation-hint">Your booking reference and email are ready in the lookup form below if you need to view or cancel this stay.</p>
          {confirmedHotel && (() => {
            const guide = getDestinationGuide(confirmedHotel.city)
            if (!guide) {
              return <p className="booking-estimate">A local guide for {confirmedHotel.city} is not available yet.</p>
            }
            const plan = buildTripPlan(guide, booking.checkIn, booking.nights)
            return (
              <div className="trip-guide">
                <div className="trip-guide-heading">
                  <p className="eyebrow">A little local inspiration</p>
                  <h3>Your {guide.city} trip plan</h3>
                  <p>Suggestions shaped around your {booking.nights}-night stay.</p>
                </div>
                <div className="season-note">
                  <strong>Seasonal note for your dates</strong>
                  <p>{getSeasonAdvice(guide, booking.checkIn, booking.nights)}</p>
                  <p className="season-window">Typical preferred period: {guide.seasonLabel}.</p>
                  <span>Typical seasonal guidance, not a live weather forecast. Check opening times and local conditions before setting out.</span>
                </div>
                <div className="itinerary-list">
                  {plan.map((day, index) => (
                    <article className="itinerary-day" key={day.date}>
                      <p className="itinerary-date">Day {index + 1} · {new Date(`${day.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      {day.places.length > 0 ? (
                        <ul>{day.places.map((place) => <li key={place.name}><strong>{place.name}</strong><span>{place.note}</span></li>)}</ul>
                      ) : (
                        <p className="flex-day-note">Keep this day flexible for a slow start, local food, or revisiting a favorite.</p>
                      )}
                    </article>
                  ))}
                </div>
                {booking.nights > plan.length && (
                  <p className="trip-plan-note">The plan shows the first {plan.length} days; keep the remaining {booking.nights - plan.length} {booking.nights - plan.length === 1 ? 'day' : 'days'} open for rest or local discoveries.</p>
                )}
                <div className="trip-source-links">
                  <span>Destination guides:</span>
                  {guide.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}
                </div>
              </div>
            )
          })()}
        </section>
      )}

      <section className="manage-booking" id="manage-booking" aria-labelledby="manage-title">
        <div>
          <p className="eyebrow">Already booked?</p>
          <h2 id="manage-title">Look up your stay</h2>
          <p>Enter the booking reference and email used at checkout.</p>
        </div>
        <form className="lookup-form" onSubmit={handleFindBooking}>
          <label className="booking-input">
            <span>Booking reference</span>
            <input
              required
              minLength={20}
              maxLength={20}
              pattern="[A-Fa-f0-9]{20}"
              title="Enter the full 20-character reference from your confirmation."
              placeholder="20-character confirmation code"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={lookupReference}
              onChange={(event) => setLookupReference(event.target.value)}
            />
            <small className="input-hint">Use the full code shown after booking, not the guest name.</small>
          </label>
          <label className="booking-input"><span>Email address</span><input required type="email" value={lookupEmail} onChange={(event) => setLookupEmail(event.target.value)} /></label>
          <button className="search-button" type="submit" disabled={isManagingBooking}>{isManagingBooking ? 'Looking up...' : 'Find booking'}</button>
        </form>
        {bookingError && !bookingRoomId && <p className="notice notice-error" role="alert">{bookingError}</p>}
        {managedBooking && (
          <div className="managed-booking">
            <div><strong>{managedBooking.hotelName} · {managedBooking.roomName}</strong><p>{managedBooking.checkIn} to {managedBooking.checkOut} · {managedBooking.nights} nights · ₹{managedBooking.totalAmount.toLocaleString('en-IN')}</p><span>Reference {managedBooking.reference} · {managedBooking.status}</span></div>
            {managedBooking.status === 'CONFIRMED' && <button className="cancel-button" type="button" disabled={isManagingBooking} onClick={handleCancelBooking}>Cancel booking</button>}
          </div>
        )}
      </section>

      <footer className="page-footer" id="about">
        <span>Made for the way you travel.</span>
        <span className="footer-note">A more thoughtful way to find your stay.</span>
      </footer>
    </main>
  )
}

export default App
