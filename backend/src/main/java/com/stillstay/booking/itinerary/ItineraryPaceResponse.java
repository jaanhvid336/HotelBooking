package com.stillstay.booking.itinerary;

import java.time.LocalDate;
import java.util.List;

public record ItineraryPaceResponse(
        int mealBreakBufferMinutes,
        int defaultTravelMinutes,
        List<DayPace> days
) {
    public enum Pace {
        RELAXED,
        BALANCED,
        PACKED
    }

    public record DayPace(
            LocalDate date,
            int attractionCount,
            List<String> attractions,
            int sightseeingMinutes,
            int travelMinutes,
            boolean travelEstimateApproximate,
            int mealBreakBufferMinutes,
            int totalRequiredMinutes,
            double totalRequiredHours,
            int availableMinutes,
            double availableHours,
            Pace pace,
            boolean overloaded,
            String warning,
            String suggestion
    ) {
    }
}
