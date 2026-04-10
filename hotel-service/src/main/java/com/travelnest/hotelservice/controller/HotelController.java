package com.travelnest.hotelservice.controller;

import com.travelnest.hotelservice.dto.BookHotelRequest;
import com.travelnest.hotelservice.dto.HotelRequest;
import com.travelnest.hotelservice.dto.BookingResponse;
import com.travelnest.hotelservice.dto.HotelResponse;
import com.travelnest.hotelservice.service.HotelService;
import com.travelnest.hotelservice.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    private final JwtService jwtService;

    @GetMapping("/search")
    public ResponseEntity<List<HotelResponse>> searchHotels(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        // Simple search that just filters by location for demo
        return ResponseEntity.ok(hotelService.searchHotels(location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @PostMapping("/book")
    public ResponseEntity<BookingResponse> bookHotel(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody BookHotelRequest request) {
        Long userId = jwtService.extractUserId(authHeader);
        return ResponseEntity.ok(hotelService.bookHotel(userId, request));
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        Long userId = jwtService.extractUserId(authHeader);
        return ResponseEntity.ok(hotelService.getMyBookings(userId));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> cancelBooking(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long id) {
        Long userId = jwtService.extractUserId(authHeader);
        hotelService.cancelBooking(userId, id);
        return ResponseEntity.noContent().build();
    }

    // Admin Endpoints
    @PostMapping
    public ResponseEntity<HotelResponse> createHotel(@RequestBody HotelRequest request) {
        return ResponseEntity.ok(hotelService.createHotel(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HotelResponse> updateHotel(@PathVariable Long id, @RequestBody HotelRequest request) {
        return ResponseEntity.ok(hotelService.updateHotel(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings/all")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(hotelService.getAllBookings());
    }
}
