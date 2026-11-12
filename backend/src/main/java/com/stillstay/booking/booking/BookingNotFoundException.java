package com.stillstay.booking.booking;

public class BookingNotFoundException extends RuntimeException {
    public BookingNotFoundException() {
        super("No booking matches that reference and email address.");
    }
}
