package com.travelnest.paymentservice.service;

import com.travelnest.paymentservice.dto.InitiatePaymentRequest;
import com.travelnest.paymentservice.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {
    PaymentResponse initiatePayment(Long userId, String userEmail, InitiatePaymentRequest request);
    PaymentResponse getPaymentById(Long userId, Long id);
    List<PaymentResponse> getMyPayments(Long userId);
    void refundPayment(Long userId, String userEmail, Long paymentId);
}
