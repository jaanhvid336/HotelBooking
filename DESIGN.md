# Design notes

## Architecture

The React and TypeScript client sends JSON requests to a Spring Boot REST API. Controllers bind and validate request data, services own hotel search and booking rules, and Spring Data JPA repositories persist entities to MySQL. Flyway owns the schema and seeds five example hotels and their rooms. The frontend only presents an estimated total; the backend owns the authoritative price and availability decision.

## Data model

- `Hotel` has many `Room` records. Hotel amenities are stored as a MySQL JSON array.
- `Room` belongs to one hotel and stores its nightly price, physical capacity (`total_units`), and maximum guests per room.
- `Booking` reserves one room unit for a date interval and stores guest details, the total at booking time, a unique reference, and a `CONFIRMED` or `CANCELLED` status.
- Foreign keys, unique booking references, positive room/guest/price checks, and `check_out > check_in` are enforced by the schema. Flyway migrations are append-only.

## API design

- `GET /api/hotels` searches by partial city or country name. Supplying both ISO `checkIn` and `checkOut` returns availability for that interval.
- `GET /api/hotels/{id}` returns a hotel's description, amenities, rooms, and (when dates are supplied) availability.
- `POST /api/bookings` creates a reservation from `roomId`, guest name/email, dates, and guest count. It returns a confirmation with a generated reference and server-calculated total.
- `GET /api/bookings?reference=...&email=...` retrieves a reservation. Both values are required so the reference alone does not disclose booking information.
- `POST /api/bookings/cancel` accepts the same reference/email pair and marks the reservation cancelled. Repeating a cancellation returns the cancelled booking.

Invalid input and booking rules return a JSON error with a readable `message`; missing hotel/booking resources return 404.

## Booking logic and overlap assumptions

Check-in must be today or later, check-out must be strictly after check-in, and both dates describe a half-open interval `[check-in, check-out)`. Therefore, a guest checking out on a date does not overlap a new guest checking in on that same date. Each reservation holds exactly one room unit, including reservations for multiple guests. Guest count cannot exceed the room's maximum occupancy.

The server counts confirmed reservations whose intervals overlap the requested interval. Before creating a reservation it takes a pessimistic write lock on the room row, then checks the count and saves the booking in the same transaction. Requests competing for the last room serialize on that lock: after the first commits, the next request recounts and is rejected if capacity is full. Cancelled reservations do not count toward availability, so cancellation releases the unit. Prices are multiplied by the number of nights using the room's database price; clients cannot send or override a total.

## Design decisions and trade-offs

- Room row locking is simple and effective for this small catalogue and prevents concurrent requests from both claiming the final unit. It serializes reservations for the same room even when dates do not overlap; a more scalable design could lock inventory by room and night or use a dedicated allocation table.
- A booking stores its total so a later nightly price change does not alter an existing reservation's charged amount.
- Reference plus email is a lightweight retrieval check appropriate for the assignment. Production booking management should use stronger identity verification, rate limits, audit logging, and privacy controls.
- The frontend shortlist is an opt-in convenience feature stored only in browser `localStorage`; it is not a server-side saved list and does not require authentication.

## Surprise feature: trip-ready confirmation

After a booking, the confirmation doubles as a trip-ready card with the dates, nights, guests, total, and reference. For each seeded destination it suggests popular sights, distributes them across the booked nights, and compares the dates with typical preferred travel months. The guide links to official tourism sources. It is static seasonal context, not a live weather forecast or a guarantee that venues are open; travelers should check current local conditions and hours.

The browser-local saved-stays shortlist is the starting point for comparison. From “Saved stays,” a traveler can opt into comparison, select two or three saved hotels, and view location, room, nightly price, estimated stay total, availability, and amenities side by side. Neither feature needs a database migration or account system.

## Limitations and possible next steps

- There is no authentication, payment processing, admin interface, or user account history.
- The shortlist is browser-local and does not sync across devices.
- Inventory counts bookings, with one room unit per reservation. Multiple rooms in one booking and per-night variable inventory are not supported.
- Backend unit tests cover server-side pricing, full capacity, and invalid check-out dates. Run them with `mvn test` before submission; Maven was not available in the implementation environment.
- Capture screenshots or a short demo recording of search, booking confirmation, and cancellation for the submission.
- Complete the approximate time-spent entry in `README.md` and publish the repository with public visibility when submitting.
