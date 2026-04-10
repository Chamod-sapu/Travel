package com.travelnest.packageservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PackageResponse {
    private Long id;
    private String title;
    private String description;
    private String destination;
    private int durationDays;
    private BigDecimal price;
    private int maxPeople;
    private String imageUrl;
    private String highlights;
}
