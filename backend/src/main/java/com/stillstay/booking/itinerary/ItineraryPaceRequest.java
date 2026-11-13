package com.stillstay.booking.itinerary;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Generated itinerary attractions and the travel time the guest has available each day.")
public record ItineraryPaceRequest(
        @NotNull
        @DecimalMin("1.0")
        @DecimalMax("16.0")
        @Schema(description = "Sightseeing hours available per day", example = "8.0", minimum = "1", maximum = "16")
        Double availableHoursPerDay,
        @NotNull
        @Size(min = 1, max = 14)
        @Valid
        List<Day> days
) {
    public record Day(
            @NotNull
            @Schema(description = "Date of this itinerary day", example = "2027-01-10", format = "date")
            LocalDate date,
            @NotNull
            @Size(max = 20)
            @Valid
            List<Attraction> attractions
    ) {
    }

    public record Attraction(
            @NotBlank
            @Size(max = 160)
            @Schema(description = "Attraction name from the generated itinerary", example = "Amber (Amer) Fort")
            String name,
            @Min(1)
            @Max(600)
            @Schema(description = "Estimated time to visit this attraction, in minutes", example = "120", minimum = "1", maximum = "600")
            int visitMinutes,
            @Min(0)
            @Max(360)
            @Schema(description = "Optional estimated travel time from this attraction to the next one, in minutes", example = "25", nullable = true)
            Integer travelMinutesToNext
    ) {
    }
}
