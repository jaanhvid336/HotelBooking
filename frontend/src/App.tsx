import { useState } from 'react'
import type { FormEvent } from 'react'
import { cancelBooking, createBooking, findBooking, getHotel, searchHotels } from './api/hotels'
import type { Booking, Hotel, StayDates } from './api/hotels'
import './App.css'

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

  function toggleFavorite(hotelId: number) {
    setFavorites((current) => {
      const next = current.includes(hotelId)
        ? current.filter((id) => id !== hotelId)
        : [...current, hotelId]
      localStorage.setItem('stillstay-favorites', JSON.stringify(next))
      return next
    })
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
        <button className="header-cta saved-toggle" type="button" onClick={() => { setShowSavedOnly((value) => !value); document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' }) }}>
          Saved stays ({favorites.length})
        </button>
      </header>

      <section className="hero" id="search" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A little more room to feel at home</p>
          <h1 id="hero-title">Go somewhere.<br /><em>Feel everywhere.</em></h1>
          <p className="hero-description">
            Find welcoming places, thoughtful details, and a stay that feels like part of the journey.
          </p>
          <a className="text-link" href="#stays">Discover your next stay <span aria-hidden="true">→</span></a>
        </div>

        <div className="hero-art" role="img" aria-label="Illustration of a quiet hillside retreat at sunset">
          <div className="sun" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="cabin">
            <div className="cabin-roof" />
            <div className="cabin-body">
              <span className="cabin-window" />
              <span className="cabin-door" />
            </div>
          </div>
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
            onChange={(event) => setCheckOut(event.target.value)}
          />
        </label>
        <button className="search-button" type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search stays'} <span aria-hidden="true">→</span>
        </button>
      </form>

      <section className="results-section" aria-live="polite">
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        {searchComplete && (
          <>
            <div className="results-heading">
              <div>
                <p className="eyebrow">A good place to begin</p>
                <h2>{showSavedOnly ? 'Your saved stays' : `${hotels.length} ${hotels.length === 1 ? 'stay' : 'stays'} to explore`}</h2>
              </div>
              {dates && <p className="results-dates">{dates.checkIn} — {dates.checkOut}</p>}
            </div>
            {showSavedOnly && <button className="saved-reset" type="button" onClick={() => setShowSavedOnly(false)}>Show all search results</button>}
            {(showSavedOnly ? hotels.filter((hotel) => favorites.includes(hotel.id)) : hotels).length === 0 ? (
              <p className="empty-state">{showSavedOnly ? 'No saved stays in these search results yet.' : 'No stays found for that destination. Try another city or country.'}</p>
            ) : (
              <div className="hotel-grid">
                {(showSavedOnly ? hotels.filter((hotel) => favorites.includes(hotel.id)) : hotels).map((hotel) => {
                  const room = hotel.rooms[0]
                  return (
                    <article className="hotel-card" key={hotel.id}>
                      <div className={`hotel-art hotel-art-${(hotel.id - 1) % 5 + 1}`} aria-hidden="true">
                        <span>{hotel.city}, {hotel.country}</span>
                      </div>
                      <div className="hotel-card-content">
                        <p className="hotel-location">{hotel.city} <span>·</span> {hotel.country}</p>
                        <h3>{hotel.name}</h3>
                        <p className="hotel-description">{hotel.description}</p>
                        <button className="favorite-button" type="button" onClick={() => toggleFavorite(hotel.id)} aria-pressed={favorites.includes(hotel.id)}>
                          {favorites.includes(hotel.id) ? 'Saved to shortlist' : 'Save this stay'}
                        </button>
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
        <section className="booking-confirmation" aria-live="polite">
          <p className="eyebrow">Your stay is confirmed</p>
          <h2>You're all set, {booking.guestName}.</h2>
          <p>{booking.hotelName} · {booking.roomName} · {booking.checkIn} to {booking.checkOut}</p>
          <p>Booking reference <strong>{booking.reference}</strong> · ₹{booking.totalAmount.toLocaleString('en-IN')}</p>
          <p className="confirmation-hint">Keep your reference and email handy to retrieve or cancel your booking.</p>
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
