package com.travelnest.paymentservice.dto;

import com.travelnest.paymentservice.entity.BookingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InitiatePaymentRequest {
    private String bookingRef;
    private BookingType bookingType;
    private BigDecimal amount;
}
