package com.stillstay.booking.hotel;

public class HotelNotFoundException extends RuntimeException {

    public HotelNotFoundException(Long id) {
        super("Hotel " + id + " was not found.");
    }
}
