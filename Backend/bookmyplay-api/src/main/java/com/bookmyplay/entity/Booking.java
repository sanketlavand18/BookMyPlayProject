package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    private LocalDate bookingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    private BookingStatus bookingStatus;

    private LocalDateTime createdAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private Slot slot;

    @Transient
    private String customerName;

    @Transient
    private String vendorName;

    @Transient
    private String userName;
}