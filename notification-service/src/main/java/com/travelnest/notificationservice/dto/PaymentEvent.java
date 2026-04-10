package com.travelnest.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {
    private Long userId;
    private String userEmail;
    private String bookingRef;
    private String bookingType;
    private BigDecimal amount;
    private String status;
}
