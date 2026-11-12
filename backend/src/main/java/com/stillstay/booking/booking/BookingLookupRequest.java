package com.stillstay.booking.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BookingLookupRequest(
        @NotBlank @Size(max = 20) String reference,
        @NotBlank @Email @Size(max = 254) String email
) {
}
