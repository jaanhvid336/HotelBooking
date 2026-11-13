package com.stillstay.booking.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    @Bean
    public OpenAPI stillstayOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Stillstay Hotel Booking API")
                        .version("1.0.0")
                        .description("Explore stays, check availability, and create or manage hotel bookings. "
                                + "Use Try it out in Swagger UI to send requests to the running API."));
    }
}
