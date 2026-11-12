CREATE TABLE hotels (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amenities JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_hotels_city (city)
) ENGINE=InnoDB;

CREATE TABLE rooms (
    id BIGINT NOT NULL AUTO_INCREMENT,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_units INT NOT NULL,
    max_guests INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_rooms_hotel
        FOREIGN KEY (hotel_id) REFERENCES hotels (id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_rooms_hotel_name UNIQUE (hotel_id, name),
    CONSTRAINT chk_rooms_price_positive CHECK (price_per_night > 0),
    CONSTRAINT chk_rooms_units_positive CHECK (total_units > 0),
    CONSTRAINT chk_rooms_max_guests_positive CHECK (max_guests > 0),
    INDEX idx_rooms_hotel (hotel_id)
) ENGINE=InnoDB;

CREATE TABLE bookings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    booking_reference VARCHAR(20) NOT NULL,
    room_id BIGINT NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(254) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_bookings_room
        FOREIGN KEY (room_id) REFERENCES rooms (id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_bookings_reference UNIQUE (booking_reference),
    CONSTRAINT chk_bookings_dates CHECK (check_out > check_in),
    CONSTRAINT chk_bookings_guests_positive CHECK (guests > 0),
    CONSTRAINT chk_bookings_total_nonnegative CHECK (total_amount >= 0),
    CONSTRAINT chk_bookings_status CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    INDEX idx_bookings_room_dates_status (room_id, check_in, check_out, status),
    INDEX idx_bookings_reference_email (booking_reference, guest_email)
) ENGINE=InnoDB;
