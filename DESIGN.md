# Design notes

## Architecture

The application has three parts:

- **Frontend:** React and TypeScript provide the hotel catalogue, search filters, booking forms, saved stays, comparison view, and trip-ready itinerary. In local development, Vite proxies `/api` requests to the backend.
- **Backend:** Java 17 and Spring Boot expose REST endpoints. Controllers bind and validate HTTP input, service classes apply booking and itinerary rules, and Spring Data JPA repositories handle persistence.
- **Database:** MySQL stores hotels, room categories, and bookings. Flyway applies the schema and sample-data migrations at startup.

The frontend shows an estimated stay total for convenience. The backend reads the room's current nightly price, checks capacity, and calculates the authoritative total when it creates a booking.

## Database design

- `hotels` stores each stay's name, city, country, description, and amenities. Amenities are stored as a MySQL JSON array.
- `rooms` belongs to one hotel and stores the room category's nightly price, physical unit capacity, and maximum guest count. A hotel can have multiple room categories.
- `bookings` belongs to one room category and stores guest details, dates, guest count, the total at booking time, a unique reference, and status (`CONFIRMED` or `CANCELLED`). Each booking reserves one unit of its room category.

Foreign keys prevent orphan rooms and bookings. The schema also enforces unique room names within a hotel, unique booking references, positive prices/capacity/guest counts, valid booking dates, nonnegative totals, and the supported booking statuses. The room/date/status index supports overlap checks. Migrations in `backend/src/main/resources/db/migration/` are append-only; `V1` creates the schema and `V2` seeds five hotels and their room categories.

## API design

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Return API health status. |
| `GET /api/hotels?location=&checkIn=&checkOut=` | List all hotels or filter by partial, case-insensitive city/country; optional dates add room availability. Both dates must be supplied together. |
| `GET /api/hotels/{id}?checkIn=&checkOut=` | Return one hotel's details, rooms, and optional date-aware availability. |
| `POST /api/bookings` | Validate and create one room booking; return a unique reference and server-calculated total. |
| `GET /api/bookings?reference=...&email=...` | Retrieve a booking using its reference and the email supplied at booking. |
| `POST /api/bookings/cancel` | Verify the same reference/email pair and cancel the booking. |
| `POST /api/itinerary/pace-check` | Compare up to 14 itinerary days per request with the selected sightseeing time. The frontend batches longer stays. |

Booking and hotel validation errors return HTTP 400 with a JSON `error` and readable `message`; unknown hotels or bookings return HTTP 404. Successful booking creation returns HTTP 201. Request records apply field validation before the service layer runs. Interactive API documentation is available at `/swagger-ui.html` while the backend is running.

## Booking rules and assumptions

- Check-in cannot be earlier than the server's current date. Check-out must be later than check-in.
- Stays use a half-open interval `[check-in, check-out)`. A guest checking out on a date does not overlap a new guest checking in on that date.
- A booking reserves one room unit regardless of guest count. The guest count must fit within that room category's maximum occupancy.
- The server calculates `nightly price × number of nights` from the database price. The client cannot supply or override the total. The booking stores that total so later price changes do not rewrite a past booking.
- Availability counts only confirmed bookings that overlap the requested dates. Cancelling changes the status to `CANCELLED`, releasing that unit for the affected dates. Repeating a cancellation returns the cancelled booking.
- Booking lookup requires both the reference and guest email; matching is case-insensitive after trimming and normalization. This is a lightweight assignment-level check, not full account authentication.

## Simultaneous bookings

Creating or cancelling a booking runs in a database transaction and obtains a pessimistic write lock on the room row. The service counts overlapping confirmed bookings while holding the lock, then saves the booking. Requests for the same room are serialized: after one request commits the last unit, the next request recounts reservations and is rejected if capacity is full. This prevents two requests from both claiming the last unit. The trade-off is that bookings for the same room category wait on one another even when their date ranges do not overlap. A higher-volume system could lock inventory per room and night or use a dedicated allocation table.

## Design decisions and trade-offs

- The sample inventory is represented by a room category's `total_units`, rather than a separate database row for each physical room. This keeps the assignment model small while supporting multiple units and room categories.
- The reservation lock is straightforward and protects the capacity check, but reduces concurrency for unrelated dates in the same category.
- Reference plus email keeps lookup simple without implementing accounts. A production system should add stronger identity verification, rate limiting, audit logging, and privacy controls.
- The saved-stays shortlist is stored in browser `localStorage`; it is private to that browser and does not need an account or database migration.
- Seasonal and sightseeing suggestions are curated sample data for the five seeded destinations. They are useful trip-planning context, not live venue hours, route estimates, weather, or safety advice.

## Surprise feature
## Surprise element

1. what the feature does

This feature provides guests with a well-planned itinerary after their booking has been confirmed. It will suggest places to see, how long you should spend there, seasonality advice and how fast you will be travelling. Guests can choose how many hours they want to spend sightseeing each day.

2. why you chose it

Booking confirmations typically just show transactional information. This feature will allow guests to start planning their holiday and know which days might be too busy.

3. how did you implement?

Frontend

When a booking is confirmed, the React app will find the curated destination guide for the hotel city. An itinerary will then be created day-by-day using the check-in date and number of nights. This will give the guest suggestions on where to visit, how long to spend there, seasonality advice and tourism resources. When the available sightseeing hours change, the places to visit and times spent there each day will be sent to the backend pacing endpoint. The response will be shown to the user with estimates, pacing labels, and progress bars or an error if one occurs.

Backend

The Spring Boot itinerary controller checks that the request is valid and sends it to the pacing service. The service will calculate the total time spent visiting places and travelling between them. If there is no routing information, it will use an approximate time that can be configured. It will then add the configured meal and break buffer. Each day will be labelled as Relaxed, Balanced or Packed. This will return any warnings about overloading and suggestions. The frontend will combine this with the itinerary. The pacing endpoint can handle up to 14 days per request, so the frontend will group larger stays.

4. Note

The suggested destinations and seasonality notes are curated examples for each of the 5 destinations supported. They are not dynamic and will not be generated by AI or based on real time.

## Automated checks

`BookingServiceTest` covers server-side total calculation, a full-capacity rejection, and invalid check-out dates. `ItineraryPaceServiceTest` covers visit and transfer totals, pace categories, fallback estimates, and overload warnings. Run the backend tests from `backend/` with `mvn test`. Build and lint the React application from `frontend/` with `npm.cmd run build` and `npm.cmd run lint`.
