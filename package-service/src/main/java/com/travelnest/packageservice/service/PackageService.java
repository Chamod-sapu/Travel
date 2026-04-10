package com.travelnest.packageservice.service;

import com.travelnest.packageservice.dto.BookPackageRequest;
import com.travelnest.packageservice.dto.BookingResponse;
import com.travelnest.packageservice.dto.PackageResponse;

import java.util.List;

public interface PackageService {
    List<PackageResponse> searchPackages(String destination);
    PackageResponse getPackageById(Long id);
    BookingResponse bookPackage(Long userId, BookPackageRequest request);
    List<BookingResponse> getMyBookings(Long userId);
    void cancelBooking(Long userId, Long bookingId);

    // Admin Features
    PackageResponse createPackage(PackageRequest request);
    PackageResponse updatePackage(Long id, PackageRequest request);
    void deletePackage(Long id);
    List<BookingResponse> getAllBookings();
}
