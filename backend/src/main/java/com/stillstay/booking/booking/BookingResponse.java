package com.stillstay.booking.booking;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingResponse(
        String reference,
        String status,
        String guestName,
        String guestEmail,
        LocalDate checkIn,
        LocalDate checkOut,
        int nights,
        int guests,
        BigDecimal totalAmount,
        Long hotelId,
        String hotelName,
        String roomName
) {
    public static BookingResponse from(Booking booking) {
        var room = booking.getRoom();
        var hotel = room.getHotel();
        int nights = Math.toIntExact(java.time.temporal.ChronoUnit.DAYS.between(
                booking.getCheckIn(), booking.getCheckOut()));
        return new BookingResponse(
                booking.getBookingReference(),
                booking.getStatus().name(),
                booking.getGuestName(),
                booking.getGuestEmail(),
                booking.getCheckIn(),
                booking.getCheckOut(),
                nights,
                booking.getGuests(),
                booking.getTotalAmount(),
                hotel.getId(),
                hotel.getName(),
                room.getName()
        );
    }
}
