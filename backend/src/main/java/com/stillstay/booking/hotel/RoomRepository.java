package com.stillstay.booking.hotel;

import com.stillstay.booking.booking.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select room from Room room where room.id = :id")
    Optional<Room> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            select new com.stillstay.booking.hotel.RoomBookingCount(room.id, count(booking.id))
            from Room room
            left join Booking booking on booking.room = room
                and booking.status = :status
                and booking.checkIn < :checkOut
                and booking.checkOut > :checkIn
            group by room.id
            """)
    List<RoomBookingCount> findBookingCountsForStay(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("status") Booking.Status status
    );
}
