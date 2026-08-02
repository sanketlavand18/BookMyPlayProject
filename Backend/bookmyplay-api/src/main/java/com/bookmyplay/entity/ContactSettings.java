package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String phone;
    private String email;
    private String officeAddress;
    private String googleMapsLocation;
    private String facebookUrl;
    private String instagramUrl;
    private String twitterUrl;
    private String linkedinUrl;
    private String whatsAppNumber;
    private String supportEmail;
    private String businessHours;
}