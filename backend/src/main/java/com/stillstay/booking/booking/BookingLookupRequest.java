package com.stillstay.booking.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Booking reference and guest email used to verify a booking.")
public record BookingLookupRequest(
        @Schema(description = "20-character reference returned when the booking was created", example = "A1B2C3D4E5F6G7H8I9J0", maxLength = 20)
        @NotBlank @Size(max = 20) String reference,
        @Schema(description = "Email address used for the booking", example = "alex@example.com", maxLength = 254)
        @NotBlank @Email @Size(max = 254) String email
) {
}
