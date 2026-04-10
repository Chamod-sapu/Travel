package com.travelnest.notificationservice.listener;

import com.travelnest.notificationservice.config.RabbitMQConfig;
import com.travelnest.notificationservice.dto.PaymentEvent;
import com.travelnest.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationListener {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_CONFIRMED)
    public void handlePaymentConfirmed(PaymentEvent event) {
        log.info("Received Payment Confirmed Event: {}", event);
        if ("SUCCESS".equalsIgnoreCase(event.getStatus())) {
            emailService.sendPaymentConfirmedEmail(event);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_REFUNDED)
    public void handlePaymentRefunded(PaymentEvent event) {
        log.info("Received Payment Refunded Event: {}", event);
        if ("REFUNDED".equalsIgnoreCase(event.getStatus())) {
            emailService.sendRefundEmail(event);
        }
    }
}
