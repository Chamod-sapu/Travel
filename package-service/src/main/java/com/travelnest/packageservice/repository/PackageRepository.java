package com.travelnest.packageservice.repository;

import com.travelnest.packageservice.entity.TourPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<TourPackage, Long> {
    
    @Query("SELECT p FROM TourPackage p WHERE " +
           "(:destination IS NULL OR p.destination = :destination)")
    List<TourPackage> searchPackages(@Param("destination") String destination);
}
