package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "about_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AboutSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 3000)
    private String description;

    @Column(length = 1000)
    private String mission;

    @Column(length = 1000)
    private String vision;

    @Column(length = 1000)
    private String companyValues;

    private String imageUrl;
}
