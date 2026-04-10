package com.travelnest.flightservice.repository;

import com.travelnest.flightservice.entity.FlightBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlightBookingRepository extends JpaRepository<FlightBooking, Long> {
    List<FlightBooking> findByUserId(Long userId);
    Optional<FlightBooking> findByIdAndUserId(Long id, Long userId);
}
