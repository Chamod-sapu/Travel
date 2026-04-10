package com.travelnest.packageservice.controller;

import com.travelnest.packageservice.dto.BookPackageRequest;
import com.travelnest.packageservice.dto.PackageRequest;
import com.travelnest.packageservice.dto.BookingResponse;
import com.travelnest.packageservice.dto.PackageResponse;
import com.travelnest.packageservice.service.JwtService;
import com.travelnest.packageservice.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<PackageResponse>> searchPackages(
            @RequestParam(required = false) String destination) {
        return ResponseEntity.ok(packageService.searchPackages(destination));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @PostMapping("/book")
    public ResponseEntity<BookingResponse> bookPackage(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody BookPackageRequest request) {
        Long userId = jwtService.extractUserId(authHeader);
        return ResponseEntity.ok(packageService.bookPackage(userId, request));
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        Long userId = jwtService.extractUserId(authHeader);
        return ResponseEntity.ok(packageService.getMyBookings(userId));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> cancelBooking(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long id) {
        Long userId = jwtService.extractUserId(authHeader);
        packageService.cancelBooking(userId, id);
        return ResponseEntity.noContent().build();
    }

    // Admin Endpoints
    @PostMapping
    public ResponseEntity<PackageResponse> createPackage(@RequestBody PackageRequest request) {
        return ResponseEntity.ok(packageService.createPackage(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PackageResponse> updatePackage(@PathVariable Long id, @RequestBody PackageRequest request) {
        return ResponseEntity.ok(packageService.updatePackage(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings/all")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(packageService.getAllBookings());
    }
}
