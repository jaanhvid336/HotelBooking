package com.stillstay.booking.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateBookingRequest(
        @NotNull Long roomId,
        @NotBlank @Size(max = 150) String guestName,
        @NotBlank @Email @Size(max = 254) String guestEmail,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @Min(1) @Max(20) int guests
) {
}
