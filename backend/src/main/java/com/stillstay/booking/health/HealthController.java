package com.stillstay.booking.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Check API service status.")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check API health", description = "Returns the current service status.")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "stillstay-api");
    }
}
