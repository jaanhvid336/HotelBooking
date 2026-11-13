package com.stillstay.booking.itinerary;

import static com.stillstay.booking.itinerary.ItineraryPaceResponse.DayPace;
import static com.stillstay.booking.itinerary.ItineraryPaceResponse.Pace;

import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ItineraryPaceService {

    private static final double RELAXED_LIMIT = 0.60;
    private static final double BALANCED_LIMIT = 0.85;

    private final int mealBreakBufferMinutes;
    private final int defaultTravelMinutes;

    public ItineraryPaceService(
            @Value("${smart-itinerary.pace.meal-break-buffer-minutes:90}") int mealBreakBufferMinutes,
            @Value("${smart-itinerary.pace.default-travel-minutes:30}") int defaultTravelMinutes
    ) {
        if (mealBreakBufferMinutes < 0 || defaultTravelMinutes < 0) {
            throw new IllegalArgumentException("Itinerary pace estimates cannot be negative.");
        }
        this.mealBreakBufferMinutes = mealBreakBufferMinutes;
        this.defaultTravelMinutes = defaultTravelMinutes;
    }

    public ItineraryPaceResponse analyze(ItineraryPaceRequest request) {
        int availableMinutes = (int) Math.round(request.availableHoursPerDay() * 60);
        List<DayPace> days = request.days().stream()
                .map(day -> analyzeDay(day, availableMinutes))
                .toList();
        return new ItineraryPaceResponse(mealBreakBufferMinutes, defaultTravelMinutes, days);
    }

    private DayPace analyzeDay(ItineraryPaceRequest.Day day, int availableMinutes) {
        List<ItineraryPaceRequest.Attraction> attractions = day.attractions();
        int sightseeingMinutes = attractions.stream()
                .mapToInt(ItineraryPaceRequest.Attraction::visitMinutes)
                .sum();
        int travelMinutes = 0;
        boolean travelEstimateApproximate = false;

        for (int index = 0; index < attractions.size() - 1; index++) {
            Integer providedTravelMinutes = attractions.get(index).travelMinutesToNext();
            if (providedTravelMinutes == null) {
                travelMinutes += defaultTravelMinutes;
                travelEstimateApproximate = true;
            } else {
                travelMinutes += providedTravelMinutes;
            }
        }

        int totalMinutes = sightseeingMinutes + travelMinutes + mealBreakBufferMinutes;
        double loadRatio = totalMinutes / (double) availableMinutes;
        Pace pace = loadRatio <= RELAXED_LIMIT
                ? Pace.RELAXED
                : loadRatio <= BALANCED_LIMIT ? Pace.BALANCED : Pace.PACKED;
        boolean overloaded = totalMinutes > availableMinutes;
        String warning = overloaded
                ? "This plan exceeds your available time by "
                        + formatHours((totalMinutes - availableMinutes) / 60.0) + " hours."
                : null;
        String suggestion = overloaded && !attractions.isEmpty()
                ? "Consider moving “" + attractions.get(attractions.size() - 1).name()
                        + "” to another day with more open time."
                : null;

        return new DayPace(
                day.date(),
                attractions.size(),
                attractions.stream().map(ItineraryPaceRequest.Attraction::name).toList(),
                sightseeingMinutes,
                travelMinutes,
                travelEstimateApproximate,
                mealBreakBufferMinutes,
                totalMinutes,
                roundedHours(totalMinutes),
                availableMinutes,
                roundedHours(availableMinutes),
                pace,
                overloaded,
                warning,
                suggestion
        );
    }

    private static double roundedHours(int minutes) {
        return Math.round(minutes / 60.0 * 100.0) / 100.0;
    }

    private static String formatHours(double hours) {
        return String.format(Locale.ROOT, "%.2f", hours).replaceAll("0+$", "").replaceAll("\\.$", "");
    }
}
