package com.travelnest.flightservice.repository;

import com.travelnest.flightservice.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    
    @Query("SELECT f FROM Flight f WHERE " +
           "(:origin IS NULL OR f.origin = :origin) AND " +
           "(:destination IS NULL OR f.destination = :destination) AND " +
           "(:travelDateStart IS NULL OR f.departureTime >= :travelDateStart) AND " +
           "(:travelDateEnd IS NULL OR f.departureTime <= :travelDateEnd)")
    List<Flight> searchFlights(@Param("origin") String origin, 
                               @Param("destination") String destination, 
                               @Param("travelDateStart") LocalDateTime travelDateStart, 
                               @Param("travelDateEnd") LocalDateTime travelDateEnd);
}
