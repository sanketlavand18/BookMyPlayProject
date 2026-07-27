package com.bookmyplay.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "venue_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    @JsonIgnore
    private Venue venue;

    @Column(nullable = false)
    private String imagePath;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCover = false;
}
