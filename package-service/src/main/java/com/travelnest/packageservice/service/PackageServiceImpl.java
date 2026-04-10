package com.travelnest.packageservice.service;

import com.travelnest.packageservice.dto.BookPackageRequest;
import com.travelnest.packageservice.dto.PackageRequest;
import com.travelnest.packageservice.dto.BookingResponse;
import com.travelnest.packageservice.dto.PackageResponse;
import com.travelnest.packageservice.entity.BookingStatus;
import com.travelnest.packageservice.entity.PackageBooking;
import com.travelnest.packageservice.entity.TourPackage;
import com.travelnest.packageservice.repository.PackageBookingRepository;
import com.travelnest.packageservice.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageServiceImpl implements PackageService {

    private final PackageRepository packageRepository;
    private final PackageBookingRepository packageBookingRepository;

    @Override
    public List<PackageResponse> searchPackages(String destination) {
        return packageRepository.searchPackages(destination).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PackageResponse getPackageById(Long id) {
        TourPackage tourPackage = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        return mapToResponse(tourPackage);
    }

    @Override
    @Transactional
    public BookingResponse bookPackage(Long userId, BookPackageRequest request) {
        TourPackage tourPackage = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        if (tourPackage.getMaxPeople() < request.getPeople()) {
            throw new RuntimeException("Exceeds maximum people allowed for this package");
        }

        BigDecimal totalPrice = tourPackage.getPrice().multiply(new BigDecimal(request.getPeople()));

        PackageBooking booking = PackageBooking.builder()
                .packageId(tourPackage.getId())
                .userId(userId)
                .people(request.getPeople())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .build();

        booking = packageBookingRepository.save(booking);

        return mapToBookingResponse(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings(Long userId) {
        return packageBookingRepository.findByUserId(userId).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelBooking(Long userId, Long bookingId) {
        PackageBooking booking = packageBookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new RuntimeException("Booking not found or not owned by user"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        packageBookingRepository.save(booking);
    }

    @Override
    public PackageResponse createPackage(PackageRequest request) {
        TourPackage pkg = TourPackage.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .destination(request.getDestination())
                .durationDays(request.getDurationDays())
                .price(request.getPrice())
                .maxPeople(request.getMaxPeople())
                .imageUrl(request.getImageUrl())
                .highlights(request.getHighlights())
                .build();
        return mapToResponse(packageRepository.save(pkg));
    }

    @Override
    public PackageResponse updatePackage(Long id, PackageRequest request) {
        TourPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        pkg.setTitle(request.getTitle());
        pkg.setDescription(request.getDescription());
        pkg.setDestination(request.getDestination());
        pkg.setDurationDays(request.getDurationDays());
        pkg.setPrice(request.getPrice());
        pkg.setMaxPeople(request.getMaxPeople());
        pkg.setImageUrl(request.getImageUrl());
        pkg.setHighlights(request.getHighlights());
        return mapToResponse(packageRepository.save(pkg));
    }

    @Override
    public void deletePackage(Long id) {
        packageRepository.deleteById(id);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return packageBookingRepository.findAll().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    private PackageResponse mapToResponse(TourPackage tourPackage) {
        return PackageResponse.builder()
                .id(tourPackage.getId())
                .title(tourPackage.getTitle())
                .description(tourPackage.getDescription())
                .destination(tourPackage.getDestination())
                .durationDays(tourPackage.getDurationDays())
                .price(tourPackage.getPrice())
                .maxPeople(tourPackage.getMaxPeople())
                .imageUrl(tourPackage.getImageUrl())
                .highlights(tourPackage.getHighlights())
                .build();
    }

    private BookingResponse mapToBookingResponse(PackageBooking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .packageId(booking.getPackageId())
                .people(booking.getPeople())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .bookedAt(booking.getBookedAt())
                .build();
    }
}
