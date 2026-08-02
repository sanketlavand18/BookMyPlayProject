package com.bookmyplay.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "venues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long vendorId;

    @Column(nullable = false)
    private String venueName;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String address;

    @Column(length = 1000)
    private String description;

    private Double pricePerHour;

    private String imageUrl;

    private Double latitude;

    private Double longitude;

    private String state;

    private String country;

    private String postalCode;

    private String openTime;

    private String closeTime;

    private Integer slotDuration;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<VenueImage> images;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Review> reviews;
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Builder.Default
    private String tag = "NEW"; // FEATURED, TRENDING, RECOMMENDED, POPULAR, NEW

    @Builder.Default
    private Double averageRating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;
}