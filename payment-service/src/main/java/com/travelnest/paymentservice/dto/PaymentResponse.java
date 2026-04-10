package com.travelnest.paymentservice.dto;

import com.travelnest.paymentservice.entity.BookingType;
import com.travelnest.paymentservice.entity.PaymentStatus;
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
public class PaymentResponse {
    private Long id;
    private Long userId;
    private String bookingRef;
    private BookingType bookingType;
    private BigDecimal amount;
    private PaymentStatus status;
    private LocalDateTime paidAt;
}
