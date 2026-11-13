package com.stillstay.booking.itinerary;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class ItineraryPaceServiceTest {

    private final ItineraryPaceService service = new ItineraryPaceService(90, 30);

    @Test
    void includesVisitsTravelAndConfiguredBufferAndLabelsFallbackTravelApproximate() {
        var day = new ItineraryPaceRequest.Day(LocalDate.parse("2027-01-10"), List.of(
                new ItineraryPaceRequest.Attraction("Fort", 180, null),
                new ItineraryPaceRequest.Attraction("Palace", 180, null)
        ));

        var result = service.analyze(new ItineraryPaceRequest(8.0, List.of(day))).days().get(0);

        assertEquals(360, result.sightseeingMinutes());
        assertEquals(30, result.travelMinutes());
        assertEquals(90, result.mealBreakBufferMinutes());
        assertEquals(480, result.totalRequiredMinutes());
        assertEquals(8.0, result.totalRequiredHours());
        assertTrue(result.travelEstimateApproximate());
        assertEquals(ItineraryPaceResponse.Pace.PACKED, result.pace());
        assertFalse(result.overloaded());
    }

    @Test
    void usesProvidedTravelTimeAndWarnsWhenTheDayExceedsAvailableHours() {
        var day = new ItineraryPaceRequest.Day(LocalDate.parse("2027-01-11"), List.of(
                new ItineraryPaceRequest.Attraction("Fort", 120, 20),
                new ItineraryPaceRequest.Attraction("Palace", 120, null)
        ));

        var result = service.analyze(new ItineraryPaceRequest(4.0, List.of(day))).days().get(0);

        assertEquals(20, result.travelMinutes());
        assertFalse(result.travelEstimateApproximate());
        assertEquals(350, result.totalRequiredMinutes());
        assertEquals(ItineraryPaceResponse.Pace.PACKED, result.pace());
        assertTrue(result.overloaded());
        assertTrue(result.warning().contains("1.83 hours"));
        assertTrue(result.suggestion().contains("Palace"));
    }

    @Test
    void marksShortDaysRelaxedAndDoesNotAddTravelAfterTheLastAttraction() {
        var day = new ItineraryPaceRequest.Day(LocalDate.parse("2027-01-12"), List.of(
                new ItineraryPaceRequest.Attraction("Temple", 60, 45)
        ));

        var result = service.analyze(new ItineraryPaceRequest(8.0, List.of(day))).days().get(0);

        assertEquals(0, result.travelMinutes());
        assertEquals(ItineraryPaceResponse.Pace.RELAXED, result.pace());
        assertFalse(result.overloaded());
    }

    @Test
    void marksAnItineraryThatUsesMostOfTheAvailableTimeBalanced() {
        var day = new ItineraryPaceRequest.Day(LocalDate.parse("2027-01-13"), List.of(
                new ItineraryPaceRequest.Attraction("Fort", 120, null),
                new ItineraryPaceRequest.Attraction("Palace", 120, null)
        ));

        var result = service.analyze(new ItineraryPaceRequest(8.0, List.of(day))).days().get(0);

        assertEquals(360, result.totalRequiredMinutes());
        assertEquals(ItineraryPaceResponse.Pace.BALANCED, result.pace());
        assertFalse(result.overloaded());
    }
}
