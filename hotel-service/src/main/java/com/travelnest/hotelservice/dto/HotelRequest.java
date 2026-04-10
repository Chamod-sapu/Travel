package com.travelnest.hotelservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelRequest {
    private String name;
    private String location;
    private BigDecimal rating;
    private BigDecimal pricePerNight;
    private int availableRooms;
    private String imageUrl;
    private String description;
}
