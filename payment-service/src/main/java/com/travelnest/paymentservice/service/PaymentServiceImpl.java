package com.travelnest.paymentservice.service;

import com.travelnest.paymentservice.config.RabbitMQConfig;
import com.travelnest.paymentservice.dto.InitiatePaymentRequest;
import com.travelnest.paymentservice.dto.PaymentEvent;
import com.travelnest.paymentservice.dto.PaymentResponse;
import com.travelnest.paymentservice.entity.Payment;
import com.travelnest.paymentservice.entity.PaymentStatus;
import com.travelnest.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public PaymentResponse initiatePayment(Long userId, String userEmail, InitiatePaymentRequest request) {
        // Create as PENDING
        Payment payment = Payment.builder()
                .userId(userId)
                .bookingRef(request.getBookingRef())
                .bookingType(request.getBookingType())
                .amount(request.getAmount())
                .status(PaymentStatus.PENDING)
                .build();
        
        payment = paymentRepository.save(payment);

        // For demo purposes, auto-set to SUCCESS
        payment.setStatus(PaymentStatus.SUCCESS);
        payment = paymentRepository.save(payment);

        // Publish to RabbitMQ
        PaymentEvent event = PaymentEvent.builder()
                .userId(userId)
                .userEmail(userEmail)
                .bookingRef(payment.getBookingRef())
                .bookingType(payment.getBookingType())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, 
                                      RabbitMQConfig.ROUTING_KEY_CONFIRMED, 
                                      event);

        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentById(Long userId, Long id) {
        Payment payment = paymentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }

    @Override
    public List<PaymentResponse> getMyPayments(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void refundPayment(Long userId, String userEmail, Long paymentId) {
        Payment payment = paymentRepository.findByIdAndUserId(paymentId, userId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("Only successful payments can be refunded");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        PaymentEvent event = PaymentEvent.builder()
                .userId(userId)
                .userEmail(userEmail)
                .bookingRef(payment.getBookingRef())
                .bookingType(payment.getBookingType())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, 
                                      RabbitMQConfig.ROUTING_KEY_REFUNDED, 
                                      event);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .bookingRef(payment.getBookingRef())
                .bookingType(payment.getBookingType())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
