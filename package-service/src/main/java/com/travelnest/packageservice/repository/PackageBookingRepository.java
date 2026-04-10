package com.travelnest.packageservice.repository;

import com.travelnest.packageservice.entity.PackageBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageBookingRepository extends JpaRepository<PackageBooking, Long> {
    List<PackageBooking> findByUserId(Long userId);
    Optional<PackageBooking> findByIdAndUserId(Long id, Long userId);
}
