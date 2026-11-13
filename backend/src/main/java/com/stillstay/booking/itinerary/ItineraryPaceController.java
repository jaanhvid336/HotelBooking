package com.stillstay.booking.itinerary;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/itinerary")
@Tag(name = "Itinerary", description = "Check the pace of an already generated day plan.")
@CrossOrigin(origins = {
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "http://localhost:5176", "http://127.0.0.1:5176"
})
public class ItineraryPaceController {

    private final ItineraryPaceService paceService;

    public ItineraryPaceController(ItineraryPaceService paceService) {
        this.paceService = paceService;
    }

    @PostMapping("/pace-check")
    @Operation(
            summary = "Check daily itinerary pace",
            description = "Calculates attraction, transfer, and meal/break time for each generated day and compares it with the guest's available sightseeing hours."
    )
    @ApiResponse(responseCode = "200", description = "Daily pace calculations")
    @ApiResponse(responseCode = "400", description = "Invalid hours, dates, or attraction estimates")
    public ItineraryPaceResponse checkPace(@Valid @RequestBody ItineraryPaceRequest request) {
        return paceService.analyze(request);
    }
}
