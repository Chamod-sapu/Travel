package com.travelnest.hotelservice.repository;

import com.travelnest.hotelservice.entity.HotelBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelBookingRepository extends JpaRepository<HotelBooking, Long> {
    List<HotelBooking> findByUserId(Long userId);
    Optional<HotelBooking> findByIdAndUserId(Long id, Long userId);
}
