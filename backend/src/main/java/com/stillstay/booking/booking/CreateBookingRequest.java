package com.stillstay.booking.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Schema(description = "Details required to create a hotel booking. The server calculates the final price.")
public record CreateBookingRequest(
        @Schema(description = "Room to reserve", example = "1")
        @NotNull Long roomId,
        @Schema(description = "Name of the guest", example = "Alex Morgan", maxLength = 150)
        @NotBlank @Size(max = 150) String guestName,
        @Schema(description = "Contact email for booking lookup", example = "alex@example.com", maxLength = 254)
        @NotBlank @Email @Size(max = 254) String guestEmail,
        @Schema(description = "First night of the stay; cannot be in the past", example = "2027-01-10", format = "date")
        @NotNull LocalDate checkIn,
        @Schema(description = "Departure date; must be after check-in", example = "2027-01-13", format = "date")
        @NotNull LocalDate checkOut,
        @Schema(description = "Number of guests, within the room's capacity", example = "2", minimum = "1", maximum = "20")
        @Min(1) @Max(20) int guests
) {
}
