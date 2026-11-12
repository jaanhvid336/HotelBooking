package com.stillstay.booking.hotel;

import java.math.BigDecimal;
import java.util.List;

public record HotelResponse(
        Long id,
        String name,
        String city,
        String country,
        String description,
        List<String> amenities,
        List<RoomResponse> rooms
) {
    public record RoomResponse(
            Long id,
            String name,
            String description,
            BigDecimal pricePerNight,
            int totalUnits,
            Integer availableUnits,
            int maxGuests
    ) {
    }
}
