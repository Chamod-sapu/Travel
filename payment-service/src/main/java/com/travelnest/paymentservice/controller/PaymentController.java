package com.travelnest.paymentservice.controller;

import com.travelnest.paymentservice.dto.InitiatePaymentRequest;
import com.travelnest.paymentservice.dto.PaymentResponse;
import com.travelnest.paymentservice.service.JwtService;
import com.travelnest.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtService jwtService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiatePayment(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody InitiatePaymentRequest request) {
        Long userId = jwtService.extractUserId(authHeader);
        String userEmail = jwtService.extractUserEmail(authHeader);
        return ResponseEntity.ok(paymentService.initiatePayment(userId, userEmail, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long id) {
        Long userId = jwtService.extractUserId(authHeader);
        return ResponseEntity.ok(paymentService.getPaymentById(userId, id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        Long userId = jwtService.extractUserId(authHeader);
        return ResponseEntity.ok(paymentService.getMyPayments(userId));
    }

    @PostMapping("/refund/{id}")
    public ResponseEntity<Void> refundPayment(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long id) {
        Long userId = jwtService.extractUserId(authHeader);
        String userEmail = jwtService.extractUserEmail(authHeader);
        paymentService.refundPayment(userId, userEmail, id);
        return ResponseEntity.ok().build();
    }
}
