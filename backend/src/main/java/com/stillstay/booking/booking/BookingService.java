package com.stillstay.booking.booking;

import com.stillstay.booking.hotel.Room;
import com.stillstay.booking.hotel.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public BookingResponse create(CreateBookingRequest request) {
        validateStay(request.checkIn(), request.checkOut());
        Room room = roomRepository.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new IllegalArgumentException("This room is no longer available."));
        long reserved = bookingRepository.countOverlappingBookings(
                room.getId(), request.checkIn(), request.checkOut(), Booking.Status.CONFIRMED);
        if (reserved >= room.getTotalUnits()) {
            throw new IllegalArgumentException("This room is fully booked for those dates. Choose another stay.");
        }
        if (request.guests() > room.getMaxGuests()) {
            throw new IllegalArgumentException("This room allows up to " + room.getMaxGuests() + " guests.");
        }

        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        BigDecimal total = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        String reference = UUID.randomUUID().toString().replace("-", "")
                .substring(0, 20).toUpperCase(Locale.ROOT);
        Booking booking = Booking.confirmed(
                reference,
                room,
                request.guestName().trim(),
                normalizeEmail(request.guestEmail()),
                request.checkIn(),
                request.checkOut(),
                request.guests(),
                total
        );
        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public BookingResponse find(String reference, String email) {
        return BookingResponse.from(findBooking(reference, email));
    }

    @Transactional
    public BookingResponse cancel(String reference, String email) {
        Booking booking = findBooking(reference, email);
        roomRepository.findByIdForUpdate(booking.getRoom().getId())
                .orElseThrow(() -> new IllegalArgumentException("This room is no longer available."));
        if (booking.getStatus() == Booking.Status.CANCELLED) {
            return BookingResponse.from(booking);
        }
        booking.cancel();
        return BookingResponse.from(booking);
    }

    private Booking findBooking(String reference, String email) {
        return bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(
                        reference.trim().toUpperCase(Locale.ROOT), normalizeEmail(email))
                .orElseThrow(() -> new BookingNotFoundException());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void validateStay(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in cannot be in the past.");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out must be after check-in.");
        }
    }
}
