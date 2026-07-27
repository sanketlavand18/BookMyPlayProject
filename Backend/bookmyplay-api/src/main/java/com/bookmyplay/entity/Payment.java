package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;

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

    private String paymentId; // Razorpay payment ID

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private Double amount;

    private String paymentMethod;

    @Column(nullable = false)
    private String paymentStatus; // SUCCESS, FAILED, REFUNDED

    private String transactionId; // Razorpay transaction signature / order ID

    private LocalDateTime paymentDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.paymentDate = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Transient
    private String customerName;

    @Transient
    private String vendorName;

    @Transient
    private String venueName;
}
