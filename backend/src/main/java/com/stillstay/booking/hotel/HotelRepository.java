package com.stillstay.booking.hotel;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Override
    @EntityGraph(attributePaths = "rooms")
    List<Hotel> findAll();

    @EntityGraph(attributePaths = "rooms")
    List<Hotel> findDistinctByCityContainingIgnoreCaseOrCountryContainingIgnoreCaseOrderByNameAsc(
            String city,
            String country
    );

    @EntityGraph(attributePaths = "rooms")
    Optional<Hotel> findWithRoomsById(Long id);
}
