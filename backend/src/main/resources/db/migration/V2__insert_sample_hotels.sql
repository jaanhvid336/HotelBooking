INSERT INTO hotels (name, city, country, description, amenities) VALUES
(
    'The Fern & Foundry',
    'Jaipur',
    'India',
    'A restored haveli with quiet courtyards, hand-finished details, and an easy walk to the old city.',
    JSON_ARRAY('Courtyard', 'Breakfast', 'Wi-Fi', 'Air conditioning')
),
(
    'Mango House',
    'Goa',
    'India',
    'A relaxed coastal hideaway with leafy verandas and the beach a short stroll away.',
    JSON_ARRAY('Garden', 'Beach access', 'Breakfast', 'Wi-Fi')
),
(
    'The Cedar Post',
    'Manali',
    'India',
    'A small mountain lodge made for slow mornings, pine-scented walks, and views of the valley.',
    JSON_ARRAY('Mountain views', 'Fireplace', 'Restaurant', 'Wi-Fi')
),
(
    'Riverlight Residency',
    'Kochi',
    'India',
    'A considered waterfront stay close to the old harbour, local galleries, and spice markets.',
    JSON_ARRAY('River views', 'Restaurant', 'Wi-Fi', 'Air conditioning')
),
(
    'Blue Banyan',
    'Udaipur',
    'India',
    'A peaceful lakeside guesthouse with a shaded terrace and generous views across the water.',
    JSON_ARRAY('Lake views', 'Terrace', 'Breakfast', 'Wi-Fi')
);

INSERT INTO rooms (hotel_id, name, description, price_per_night, total_units, max_guests)
SELECT id, 'Garden Room', 'A comfortable, thoughtfully furnished room with a private bathroom.', 5200.00, 6, 2
FROM hotels
WHERE name = 'The Fern & Foundry';

INSERT INTO rooms (hotel_id, name, description, price_per_night, total_units, max_guests)
SELECT id, 'Veranda Room', 'A breezy room with a private veranda and space to unwind.', 6800.00, 5, 2
FROM hotels
WHERE name = 'Mango House';

INSERT INTO rooms (hotel_id, name, description, price_per_night, total_units, max_guests)
SELECT id, 'Pine View Room', 'A warm room with mountain views and a comfortable reading corner.', 6100.00, 4, 2
FROM hotels
WHERE name = 'The Cedar Post';

INSERT INTO rooms (hotel_id, name, description, price_per_night, total_units, max_guests)
SELECT id, 'Harbour Room', 'A light-filled room close to the waterfront and the old quarter.', 5700.00, 5, 2
FROM hotels
WHERE name = 'Riverlight Residency';

INSERT INTO rooms (hotel_id, name, description, price_per_night, total_units, max_guests)
SELECT id, 'Lakeview Room', 'A quiet room with a private balcony overlooking the lake.', 7400.00, 3, 2
FROM hotels
WHERE name = 'Blue Banyan';
