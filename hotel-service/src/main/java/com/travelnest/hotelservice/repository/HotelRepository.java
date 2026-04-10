package com.travelnest.hotelservice.repository;

import com.travelnest.hotelservice.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    @Query("SELECT h FROM Hotel h WHERE " +
           "(:location IS NULL OR h.location LIKE %:location%)")
    List<Hotel> searchHotels(@Param("location") String location);
}
