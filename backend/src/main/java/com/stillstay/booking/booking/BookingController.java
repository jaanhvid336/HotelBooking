package com.stillstay.booking.booking;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Create, find, and cancel hotel bookings.")
@CrossOrigin(origins = {
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "http://localhost:5176", "http://127.0.0.1:5176"
})
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(
            summary = "Create a booking",
            description = "Creates a confirmed booking. The server checks stay dates, guest capacity, room availability, and calculates the total from the nightly price."
    )
    @ApiResponse(responseCode = "201", description = "Booking created", content = @Content(schema = @Schema(implementation = BookingResponse.class)))
    @ApiResponse(responseCode = "400", description = "Invalid request, dates, capacity, or no room availability")
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request));
    }

    @GetMapping
    @Operation(
            summary = "Find a booking",
            description = "Retrieves a booking using its reference and the email address used at booking."
    )
    @ApiResponse(responseCode = "404", description = "No booking matches the supplied reference and email")
    @ApiResponse(responseCode = "400", description = "Missing or invalid lookup parameters")
    public BookingResponse find(
            @Parameter(description = "20-character booking reference", example = "A1B2C3D4E5F6G7H8I9J0")
            @RequestParam("reference") String reference,
            @Parameter(description = "Email address used for the booking", example = "guest@example.com")
            @RequestParam("email") String email
    ) {
        return bookingService.find(reference, email);
    }

    @PostMapping("/cancel")
    @Operation(
            summary = "Cancel a booking",
            description = "Cancels a booking after verifying its reference and email. Cancelled bookings release room availability."
    )
    @ApiResponse(responseCode = "404", description = "No booking matches the supplied reference and email")
    @ApiResponse(responseCode = "400", description = "Invalid request or booking cannot be cancelled")
    public BookingResponse cancel(@Valid @RequestBody BookingLookupRequest request) {
        return bookingService.cancel(request.reference(), request.email());
    }
}

@RestControllerAdvice(assignableTypes = BookingController.class)
class BookingApiExceptionHandler {

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(BookingNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Not Found", "message", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidBooking(IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid booking", "message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleInvalidRequest(MethodArgumentNotValidException exception) {
        FieldError firstError = exception.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        String message = firstError == null ? "Check the booking details and try again."
                : firstError.getField() + " " + firstError.getDefaultMessage();
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid request", "message", message));
    }

    @ExceptionHandler({
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<Map<String, String>> handleMalformedRequest(Exception exception) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid request",
                "message", "Provide a valid booking reference, email, and request body."
        ));
    }
}
