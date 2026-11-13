package com.stillstay.booking.hotel;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@Tag(name = "Hotels", description = "Search stays and check room availability.")
@CrossOrigin(origins = {
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "http://localhost:5176", "http://127.0.0.1:5176"
})
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    @Operation(
            summary = "Search hotels",
            description = "Optionally filter by city or country and provide both stay dates to see date-aware availability. Dates use YYYY-MM-DD."
    )
    @ApiResponse(responseCode = "400", description = "Invalid search parameters or dates")
    public List<HotelResponse> search(
            @Parameter(description = "Optional city or country to search", example = "Goa")
            @RequestParam(name = "location", required = false) String location,
            @Parameter(description = "Check-in date (must be provided with checkOut)", example = "2027-01-10")
            @RequestParam(name = "checkIn", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @Parameter(description = "Check-out date (must be after checkIn)", example = "2027-01-13")
            @RequestParam(name = "checkOut", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return hotelService.search(location, checkIn, checkOut);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get a hotel",
            description = "Returns stay details and room availability for the optional date range."
    )
    @ApiResponse(responseCode = "404", description = "Hotel ID was not found")
    @ApiResponse(responseCode = "400", description = "Invalid hotel ID or dates")
    public HotelResponse getById(
            @Parameter(description = "Hotel identifier", example = "1", required = true)
            @PathVariable("id") Long id,
            @Parameter(description = "Optional check-in date", example = "2027-01-10")
            @RequestParam(name = "checkIn", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @Parameter(description = "Optional check-out date, after checkIn", example = "2027-01-13")
            @RequestParam(name = "checkOut", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return hotelService.getById(id, checkIn, checkOut);
    }
}

@RestControllerAdvice(assignableTypes = HotelController.class)
class HotelApiExceptionHandler {

    @ExceptionHandler(HotelNotFoundException.class)
    public org.springframework.http.ResponseEntity<Map<String, String>> handleNotFound(
            HotelNotFoundException exception
    ) {
        return org.springframework.http.ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Not Found", "message", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public org.springframework.http.ResponseEntity<Map<String, String>> handleInvalidSearch(
            IllegalArgumentException exception
    ) {
        return org.springframework.http.ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid search", "message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public org.springframework.http.ResponseEntity<Map<String, String>> handleInvalidParameter(
            MethodArgumentTypeMismatchException exception
    ) {
        return org.springframework.http.ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid parameter", "message", "Check the hotel ID and ISO date parameters."));
    }
}
