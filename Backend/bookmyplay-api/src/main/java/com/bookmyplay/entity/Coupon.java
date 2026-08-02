package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String couponCode;

    private Double discount; // Flat or percentage

    private LocalDate expiryDate;

    private Integer usageLimit;

    private Integer usageCount = 0;

    private String status = "ACTIVE"; // ACTIVE, INACTIVE
}