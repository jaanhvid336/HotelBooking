package com.stillstay.booking.hotel;

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
@CrossOrigin(origins = {
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175"
})
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    public List<HotelResponse> search(
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "checkIn", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(name = "checkOut", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return hotelService.search(location, checkIn, checkOut);
    }

    @GetMapping("/{id}")
    public HotelResponse getById(
            @PathVariable("id") Long id,
            @RequestParam(name = "checkIn", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
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
