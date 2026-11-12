package com.stillstay.booking.booking;

import com.stillstay.booking.hotel.Hotel;
import com.stillstay.booking.hotel.Room;
import com.stillstay.booking.hotel.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock RoomRepository roomRepository;
    @Mock Room room;
    @Mock Hotel hotel;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, roomRepository);
    }

    private void stubRoom() {
        when(roomRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(room));
        when(room.getId()).thenReturn(8L);
        when(room.getPricePerNight()).thenReturn(new BigDecimal("5200.00"));
        when(room.getTotalUnits()).thenReturn(2);
        when(room.getMaxGuests()).thenReturn(2);
        when(room.getHotel()).thenReturn(hotel);
        when(room.getName()).thenReturn("Garden Room");
        when(hotel.getId()).thenReturn(3L);
        when(hotel.getName()).thenReturn("The Fern & Foundry");
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void calculatesTotalFromRoomPriceAndNumberOfNights() {
        stubRoom();
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = checkIn.plusDays(3);
        when(bookingRepository.countOverlappingBookings(8L, checkIn, checkOut, Booking.Status.CONFIRMED))
                .thenReturn(0L);

        BookingResponse response = bookingService.create(new CreateBookingRequest(
                8L, "Asha Guest", "asha@example.com", checkIn, checkOut, 2));

        assertEquals(new BigDecimal("15600.00"), response.totalAmount());
        assertEquals(3, response.nights());
        assertEquals("CONFIRMED", response.status());
        verify(bookingRepository).countOverlappingBookings(8L, checkIn, checkOut, Booking.Status.CONFIRMED);
    }

    @Test
    void rejectsReservationWhenAllRoomUnitsAreAlreadyReserved() {
        stubRoom();
        LocalDate checkIn = LocalDate.now().plusDays(4);
        LocalDate checkOut = checkIn.plusDays(1);
        when(bookingRepository.countOverlappingBookings(8L, checkIn, checkOut, Booking.Status.CONFIRMED))
                .thenReturn(2L);

        assertThrows(IllegalArgumentException.class, () -> bookingService.create(new CreateBookingRequest(
                8L, "Asha Guest", "asha@example.com", checkIn, checkOut, 1)));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void rejectsCheckoutThatDoesNotFollowCheckin() {
        LocalDate checkIn = LocalDate.now().plusDays(4);
        LocalDate checkOut = checkIn;

        assertThrows(IllegalArgumentException.class, () -> bookingService.create(new CreateBookingRequest(
                8L, "Asha Guest", "asha@example.com", checkIn, checkOut, 1)));

        verify(roomRepository, never()).findByIdForUpdate(8L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
