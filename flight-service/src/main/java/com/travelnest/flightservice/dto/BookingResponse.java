package com.travelnest.flightservice.dto;

import com.travelnest.flightservice.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private Long id;
    private Long flightId;
    private int seats;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private LocalDateTime bookedAt;
}
