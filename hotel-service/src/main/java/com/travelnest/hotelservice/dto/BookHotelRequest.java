package com.travelnest.hotelservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookHotelRequest {
    private Long hotelId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int rooms;
}
