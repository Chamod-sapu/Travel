package com.travelnest.hotelservice.dto;

import com.travelnest.hotelservice.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private Long id;
    private Long hotelId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int rooms;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private LocalDateTime bookedAt;
}
