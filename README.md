# Stillstay hotel booking portal

A full-stack hotel search and booking portal built with React, TypeScript, Spring Boot, and MySQL. It includes five seeded stays, date-aware availability, booking confirmation, booking lookup and cancellation, a saved-stays shortlist, side-by-side comparisons, and a trip-ready itinerary with a daily pace check.

## Prerequisites

- Java 17
- Maven 3.9 or later
- Node.js 20.19+ or 22.12+ and npm
- MySQL 8.0+

## Run locally

1. Start MySQL and create a local database user with permission to create/use the `stillstay` database. The application creates the database if it does not exist and applies Flyway migrations at startup.
2. Configure backend connection details in your shell. Keep real credentials in environment variables or an ignored local configuration file; do not commit them.

   PowerShell example:

   ```powershell
   $env:DB_URL = 'jdbc:mysql://localhost:3306/stillstay?createDatabaseIfNotExist=true&serverTimezone=UTC'
   $env:DB_USERNAME = 'your-local-mysql-user'
   $env:DB_PASSWORD = 'your-local-mysql-password'
   ```

3. Start the API from `backend/`:

   ```powershell
   mvn spring-boot:run
   ```

   It listens on `http://localhost:8080`. Flyway creates the hotel, room, and booking tables and inserts sample hotels on the first run.
4. In another terminal, start the frontend from `frontend/`:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

   Open the local URL printed by Vite (normally `http://localhost:5173`). Vite proxies `/api` requests to the backend. Set `VITE_API_BASE_URL` only when using a separately hosted API; the variable can be added to an ignored `.env.local` file.

## Project flow

### Approach taken to complete the assessment

I started with the MySQL schema and sample hotel data, then built the Spring Boot API for searching hotels and managing bookings. I connected the React interface to those endpoints and completed the guest flow: browse or filter stays, select dates and a room, confirm a booking, and look it up or cancel it later.

### Key assumptions made

Each booking reserves one room unit, even when it includes multiple guests. Check-out day is not counted as an occupied night, so another guest can check in that day. For this demo, guests retrieve bookings with the unique reference and the email address used at booking.

### Challenges faced and how they were addressed

The main challenge was preventing two guests from booking the last available room at the same time. The backend locks the room record, checks for overlapping confirmed bookings, and saves the new booking in one transaction. The server also calculates the total from the room price and stay length, so it does not rely on a total sent by the browser.

### Additional enhancements or improvements with more time

**AI trip planner flow:** After choosing a stay and dates, the guest selects interests, preferred pace, budget, and any accessibility needs. The backend combines these preferences with a curated list of local attractions and asks the AI to create a day-by-day itinerary for the stay. It checks that the plan fits the dates and available time, then shows it for the guest to edit or regenerate. If the AI service is unavailable, the app shows its existing curated suggestions.

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

5. Extra element

**Saved-stay comparison**

**What the feature does:** Guests can save stays they like, then compare up to three options side by side. The comparison shows location, room, nightly price, estimated stay total, availability, and amenities.

**Why it was added:** Hotel details are easier to evaluate when guests can see the shortlisted options together, using the same dates and key details.

**How it works:** The React frontend stores saved hotel IDs in the browser's `localStorage`. When guests open their saved stays, the frontend requests current hotel details and date-based availability from `GET /api/hotels/{id}`. In compare mode, each saved card has a checkbox-style selector; selected cards are highlighted, and guests can choose up to three. Selecting “Compare selected options” scrolls to a table showing the room, location, nightly price, estimated total, availability, and amenities from the fetched hotel data. Saved lists remain local to the browser and are not stored in the backend.

## View saved bookings in MySQL

Bookings are stored in the `stillstay.bookings` table. Connect to the same local MySQL server with MySQL Workbench (commonly `localhost:3306`) and run:

```sql
USE stillstay;
SELECT id, booking_reference, guest_name, guest_email, room_id,
       check_in, check_out, guests, total_amount, status, created_at
FROM bookings
ORDER BY created_at DESC;
```

Confirmed and cancelled reservations remain in this table; the `status` column shows which is which. A cancellation releases room availability by changing the status to `CANCELLED`.

## API overview

- `GET /api/health` — report whether the API is running.
- `GET /api/hotels?location=&checkIn=&checkOut=` — search stays; dates are optional but must be provided together.
- `GET /api/hotels/{id}?checkIn=&checkOut=` — hotel details and room availability.
- `POST /api/bookings` — create a one-room booking; the server calculates the amount.
- `GET /api/bookings?reference=&email=` — retrieve a booking by its full 20-character confirmation reference and email (reference matching ignores case).
- `POST /api/bookings/cancel` — cancel a booking using its reference and email.
- `POST /api/itinerary/pace-check` — analyze the generated daily attractions against available sightseeing hours.

## Build and tests

Run the frontend checks from `frontend/`:

```powershell
npm.cmd run build
npm.cmd run lint
```

Run the backend unit tests from `backend/`:

```powershell
mvn test
```

The backend tests cover server-side booking totals, invalid dates, capacity limits, and itinerary pace estimates.

### Interactive API documentation

With the backend running, open [Swagger UI](http://localhost:8080/swagger-ui.html) to inspect the Hotels, Bookings, and Health endpoints. Use **Try it out** to send requests to the local API. The raw OpenAPI specification is available at `http://localhost:8080/v3/api-docs`.

See [DESIGN.md](DESIGN.md) for the architecture, schema, booking rules, trade-offs, and remaining submission items.
