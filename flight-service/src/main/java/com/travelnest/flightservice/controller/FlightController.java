package com.travelnest.flightservice.controller;

import com.travelnest.flightservice.dto.BookFlightRequest;
import com.travelnest.flightservice.dto.FlightRequest;
import com.travelnest.flightservice.dto.BookingResponse;
import com.travelnest.flightservice.dto.FlightResponse;
import com.travelnest.flightservice.service.FlightService;
import com.travelnest.flightservice.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;
    private final JwtService jwtService;

    @GetMapping("/search")
    public ResponseEntity<List<FlightResponse>> searchFlights(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime travelDateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime travelDateEnd) {
        return ResponseEntity.ok(flightService.searchFlights(origin, destination, travelDateStart, travelDateEnd));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightResponse> getFlightById(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }

    @PostMapping("/book")
    public ResponseEntity<BookingResponse> bookFlight(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody BookFlightRequest request) {
        Long userId = jwtService.extractUserId(authHeader);
        return ResponseEntity.ok(flightService.bookFlight(userId, request));
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        Long userId = jwtService.extractUserId(authHeader);
        return ResponseEntity.ok(flightService.getMyBookings(userId));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> cancelBooking(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long id) {
        Long userId = jwtService.extractUserId(authHeader);
        flightService.cancelBooking(userId, id);
        return ResponseEntity.noContent().build();
    }

    // Admin Endpoints
    @PostMapping
    public ResponseEntity<FlightResponse> createFlight(
            @RequestHeader("X-Role") String role,
            @RequestBody FlightRequest request) {
        validateAdmin(role);
        return ResponseEntity.ok(flightService.createFlight(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlightResponse> updateFlight(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id, @RequestBody FlightRequest request) {
        validateAdmin(role);
        return ResponseEntity.ok(flightService.updateFlight(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id) {
        validateAdmin(role);
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings/all")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestHeader("X-Role") String role) {
        validateAdmin(role);
        return ResponseEntity.ok(flightService.getAllBookings());
    }

    private void validateAdmin(String role) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access Denied: Admin role required");
        }
    }
}
