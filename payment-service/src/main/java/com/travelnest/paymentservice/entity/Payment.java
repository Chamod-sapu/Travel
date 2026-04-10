package com.travelnest.paymentservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String bookingRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingType bookingType;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    private LocalDateTime paidAt;

    @PrePersist
    public void prePersist() {
        if(status == PaymentStatus.SUCCESS && paidAt == null) {
            this.paidAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        if(status == PaymentStatus.SUCCESS && paidAt == null) {
            this.paidAt = LocalDateTime.now();
        }
    }
}
