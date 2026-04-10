package com.travelnest.flightservice.service;

import com.travelnest.flightservice.dto.BookFlightRequest;
import com.travelnest.flightservice.dto.BookingResponse;
import com.travelnest.flightservice.dto.FlightResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightService {
    List<FlightResponse> searchFlights(String origin, String destination, LocalDateTime travelDateStart, LocalDateTime travelDateEnd);
    FlightResponse getFlightById(Long id);
    BookingResponse bookFlight(Long userId, BookFlightRequest request);
    List<BookingResponse> getMyBookings(Long userId);
    void cancelBooking(Long userId, Long bookingId);

    // Admin Features
    FlightResponse createFlight(FlightRequest request);
    FlightResponse updateFlight(Long id, FlightRequest request);
    void deleteFlight(Long id);
    List<BookingResponse> getAllBookings();
}
