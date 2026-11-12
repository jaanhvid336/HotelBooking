package com.stillstay.booking.hotel;

import com.stillstay.booking.booking.Booking;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    public HotelService(HotelRepository hotelRepository, RoomRepository roomRepository) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<HotelResponse> search(String location, LocalDate checkIn, LocalDate checkOut) {
        validateDates(checkIn, checkOut);

        List<Hotel> hotels = location == null || location.isBlank()
                ? hotelRepository.findAll()
                : hotelRepository.findDistinctByCityContainingIgnoreCaseOrCountryContainingIgnoreCaseOrderByNameAsc(
                        location.trim(),
                        location.trim()
                );

        return toResponses(hotels, checkIn, checkOut);
    }

    @Transactional(readOnly = true)
    public HotelResponse getById(Long id, LocalDate checkIn, LocalDate checkOut) {
        validateDates(checkIn, checkOut);
        Hotel hotel = hotelRepository.findWithRoomsById(id)
                .orElseThrow(() -> new HotelNotFoundException(id));
        return toResponses(List.of(hotel), checkIn, checkOut).get(0);
    }

    private List<HotelResponse> toResponses(List<Hotel> hotels, LocalDate checkIn, LocalDate checkOut) {
        Map<Long, Long> bookingCounts = new HashMap<>();
        if (checkIn != null) {
            roomRepository.findBookingCountsForStay(checkIn, checkOut, Booking.Status.CONFIRMED)
                    .forEach(count -> bookingCounts.put(count.roomId(), count.bookingCount()));
        }

        return hotels.stream()
                .map(hotel -> new HotelResponse(
                        hotel.getId(),
                        hotel.getName(),
                        hotel.getCity(),
                        hotel.getCountry(),
                        hotel.getDescription(),
                        List.copyOf(hotel.getAmenities()),
                        hotel.getRooms().stream()
                                .map(room -> {
                                    Integer availableUnits = checkIn == null
                                            ? null
                                            : Math.toIntExact(
                                                    room.getTotalUnits()
                                                            - bookingCounts.getOrDefault(room.getId(), 0L)
                                            );
                                    return new HotelResponse.RoomResponse(
                                            room.getId(),
                                            room.getName(),
                                            room.getDescription(),
                                            room.getPricePerNight(),
                                            room.getTotalUnits(),
                                            availableUnits,
                                            room.getMaxGuests()
                                    );
                                })
                                .toList()
                ))
                .toList();
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if ((checkIn == null) != (checkOut == null)) {
            throw new IllegalArgumentException("Provide both check-in and check-out dates.");
        }
        if (checkIn == null) {
            return;
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in cannot be in the past.");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out must be after check-in.");
        }
    }
}
