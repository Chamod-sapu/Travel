package com.travelnest.notificationservice.service;

import com.travelnest.notificationservice.dto.PaymentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPaymentConfirmedEmail(PaymentEvent event) {
        String to = event.getUserEmail();
        String subject = "TravelNest Booking Confirmed - " + event.getBookingRef();
        String text = String.format("Your TravelNest booking %s for %s of amount %s is confirmed!",
                event.getBookingRef(), event.getBookingType(), event.getAmount());

        sendEmail(to, subject, text);
    }

    public void sendRefundEmail(PaymentEvent event) {
        String to = event.getUserEmail();
        String subject = "TravelNest Refund Processed - " + event.getBookingRef();
        String text = String.format("Your refund for booking %s has been processed.", event.getBookingRef());

        sendEmail(to, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        if (to == null || to.isEmpty() || to.equals("your-email@gmail.com")) {
            log.warn("Mock EMail Output (No valid config detected):");
            log.warn("To: {}", to);
            log.warn("Subject: {}", subject);
            log.warn("Text: {}", text);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}. Logging content instead.", to, e);
            log.error("Email Subject: {}", subject);
            log.error("Email Text: {}", text);
        }
    }
}
