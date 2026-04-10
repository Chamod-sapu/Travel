package com.travelnest.packageservice.dto;

import com.travelnest.packageservice.entity.BookingStatus;
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
    private Long packageId;
    private int people;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private LocalDateTime bookedAt;
}
