package com.travelnest.packageservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tour_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private int durationDays;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int maxPeople;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String highlights; // comma separated
}
