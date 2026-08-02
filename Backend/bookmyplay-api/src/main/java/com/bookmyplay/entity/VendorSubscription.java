package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long vendorId;
    private Long planId;
    private Double amount;
    private LocalDateTime paymentDate;
    private LocalDate expiryDate;
    private String paymentStatus; // PENDING, APPROVED, REJECTED
    private String transactionId;
    private String planName;
    private String status; // ACTIVE, EXPIRED, PENDING, CANCELLED
    private String planType; // FREE_TRIAL, BASIC, STANDARD, PREMIUM
}