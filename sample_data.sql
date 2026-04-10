-- Sample Data for TravelNest Microservices
-- Use this to seed the databases

-- 1. Users (Database: travelnest_users)
-- Password is BCrypt hash of "password123"
INSERT INTO travelnest_users.users (full_name, email, password, role, created_at) VALUES
('John Doe', 'john@example.com', '$2a$10$w7kQ8/vKx2uV9v5vH.oFxeRjJm2rFqS3Hl.vKx2uV9v5vH.oFxeRj', 'USER', NOW()),
('Jane Smith', 'jane@example.com', '$2a$10$w7kQ8/vKx2uV9v5vH.oFxeRjJm2rFqS3Hl.vKx2uV9v5vH.oFxeRj', 'USER', NOW()),
('Admin User', 'admin@travelnest.com', '$2a$10$w7kQ8/vKx2uV9v5vH.oFxeRjJm2rFqS3Hl.vKx2uV9v5vH.oFxeRj', 'ADMIN', NOW());

-- 2. Flights (Database: travelnest_flights)
INSERT INTO travelnest_flights.flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats) VALUES
('UL-101', 'Colombo', 'Dubai', '2025-10-15 10:30:00', '2025-10-15 13:45:00', 350.00, 180),
('EK-252', 'Dubai', 'Colombo', '2025-10-20 18:00:00', '2025-10-21 00:15:00', 380.00, 200),
('SQ-468', 'Singapore', 'Colombo', '2025-11-05 09:15:00', '2025-11-05 10:30:00', 420.00, 150),
('UL-308', 'Colombo', 'Singapore', '2025-11-12 23:50:00', '2025-11-13 06:20:00', 410.00, 160),
('BA-117', 'London', 'Singapore', '2026-01-10 21:00:00', '2026-01-11 17:30:00', 850.00, 250),
('SQ-001', 'Singapore', 'London', '2026-01-25 01:15:00', '2026-01-25 07:45:00', 880.00, 240),
('TG-307', 'Bangkok', 'Dubai', '2025-12-01 14:20:00', '2025-12-01 18:10:00', 550.00, 210),
('EK-385', 'Dubai', 'Bangkok', '2025-12-10 03:00:00', '2025-12-10 12:05:00', 540.00, 220),
('UL-402', 'Colombo', 'Bangkok', '2026-03-05 07:15:00', '2026-03-05 12:30:00', 290.00, 140),
('TG-308', 'Bangkok', 'Colombo', '2026-03-15 20:00:00', '2026-03-15 23:15:00', 310.00, 150);

-- 3. Hotels (Database: travelnest_hotels)
INSERT INTO travelnest_hotels.hotels (name, location, rating, price_per_night, available_rooms, image_url, description) VALUES
('Marina Bay Sands', 'Singapore', 5.0, 450.00, 50, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb', 'Iconic luxury hotel with infinity pool.'),
('Burj Al Arab', 'Dubai', 5.0, 950.00, 20, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b', 'The world''s only 7-star hotel experience.'),
('Cinnamon Grand', 'Colombo', 4.5, 150.00, 100, 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 'Luxury in the heart of Colombo.'),
('The Savoy', 'London', 5.0, 600.00, 30, 'https://images.unsplash.com/photo-1517840901100-8179e982ad93', 'Historic luxury on the Strand.'),
('Amari Bangkok', 'Bangkok', 4.0, 120.00, 80, 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c', 'Modern comfort in Pratunam.'),
('Shangri-La Colombo', 'Colombo', 4.8, 200.00, 60, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'Breathtaking ocean views.'),
('Jumeirah Beach Hotel', 'Dubai', 4.7, 350.00, 45, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d', 'Premium family resort by the beach.'),
('Ibis London', 'London', 3.5, 95.00, 120, 'https://images.unsplash.com/photo-1551882547-ff43c61f3c33', 'Budget-friendly comfort near city center.');

-- 4. Tour Packages (Database: travelnest_packages)
INSERT INTO travelnest_packages.tour_packages (title, description, destination, duration_days, price, max_people, image_url, highlights) VALUES
('Bali Adventure 7 Days', 'Explore the beautiful beaches and culture of Bali.', 'Bali, Indonesia', 7, 899.00, 12, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', 'Uluwatu Temple, Ubud Monkey Forest, Rice Terraces, Beach Dinner'),
('Europe Grand Tour', 'A 14-day journey through London, Paris, and Rome.', 'Western Europe', 14, 2499.00, 20, 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b', 'Eiffel Tower, Colosseum, London Eye, Wine Tasting in Tuscany'),
('Sri Lanka Cultural Trip', 'Discover the rich history and heritage of Sri Lanka.', 'Sri Lanka', 5, 550.00, 15, 'https://images.unsplash.com/photo-1546708973-b339540b5162', 'Sigiriya Rock, Kandy Temple, Tea Plantations, Galle Fort'),
('Bangkok City Break', 'Experience the vibrant nightlife and street food of Bangkok.', 'Bangkok, Thailand', 3, 350.00, 10, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365', 'Grand Palace, Wat Arun, Street Food Tour, Floating Market'),
('Dubai Desert Safari', 'Feel the thrill of sand dunes and Arabian hospitality.', 'Dubai, UAE', 4, 650.00, 8, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', 'Desert Safari, Burj Khalifa, Dubai Mall, Dhow Cruise'),
('Singapore Skyline Escape', 'Modern luxury and futuristic gardens in the Lion City.', 'Singapore', 4, 750.00, 12, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd', 'Gardens by the Bay, Sentosa Island, Night Safari, Orchard Road Shopping');
