# Stillstay hotel booking portal

A full-stack hotel search and booking demo built with React, TypeScript, Spring Boot, and MySQL. It includes five seeded stays, date-aware availability, booking confirmation, booking lookup/cancellation, and a saved-stays shortlist.

## Prerequisites

- Java 17
- Maven 3.9 or later
- Node.js 20.19+ and npm
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

## Main flow

Search by city/country and dates, open a stay, select a room, and enter the guest details. The displayed total is an estimate; the API recalculates and validates the amount before it saves the reservation. The confirmation includes a reference. Use that reference and the booking email in “Look up your stay” to view or cancel it. The saved-stays shortlist is stored in this browser with `localStorage`.

Check-in defaults to today's local date and check-out to tomorrow. Both are native date fields with calendar pickers and can be changed before searching or booking.

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

- `GET /api/hotels?location=&checkIn=&checkOut=` — search stays; dates are optional but must be provided together.
- `GET /api/hotels/{id}?checkIn=&checkOut=` — hotel details and room availability.
- `POST /api/bookings` — create a one-room booking; the server calculates the amount.
- `GET /api/bookings?reference=&email=` — retrieve a booking by its full 20-character confirmation reference and email (reference matching ignores case).
- `POST /api/bookings/cancel` — cancel a booking using its reference and email.

See [DESIGN.md](DESIGN.md) for the architecture, schema, booking rules, trade-offs, and remaining submission items.

## Submission notes

- Approximate time spent: fill in before submission.
- Screenshots or a short demo recording: capture the search, confirmation, and cancellation flow before submission.
- Significant AI assistance was used to implement and document the booking flow; review the code and be ready to explain the choices during the interview.
- Publish the repository as public when submitting; no repository visibility or remote changes have been made from this workspace.
