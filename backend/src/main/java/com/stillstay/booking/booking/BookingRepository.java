package com.stillstay.booking.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            select count(booking.id) from Booking booking
            where booking.room.id = :roomId
                and booking.status = :status
                and booking.checkIn < :checkOut
                and booking.checkOut > :checkIn
            """)
    long countOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("status") Booking.Status status
    );

    Optional<Booking> findByBookingReferenceAndGuestEmailIgnoreCase(String bookingReference, String guestEmail);
}
