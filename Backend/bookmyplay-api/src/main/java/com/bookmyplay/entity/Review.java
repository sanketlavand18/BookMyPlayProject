package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Integer rating;

    private String title;

    private Long bookingId;

    @Column(length = 1000)
    private String comment;

    private String vendorReply;

    private LocalDateTime replyAt;

    private Boolean isHidden = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Transient
    private String userName;

    @Transient
    private String venueName;

    @Transient
    private String userAvatar;

    @Transient
    private java.time.LocalDate bookingDate;
}