package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "website_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebsiteSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String websiteName = "BookMyPlay";

    private String logoUrl;

    private String faviconUrl;

    private String primaryThemeColor = "#4f46e5"; // Default primary indigo color

    @Column(length = 1000)
    private String footerText = "© 2026 BookMyPlay. All Rights Reserved.";

    @Column(length = 5000)
    private String aboutUs;

    @Column(length = 5000)
    private String privacyPolicy;

    @Column(length = 5000)
    private String termsAndConditions;

    @Column(length = 5000)
    private String refundPolicy;

    private String facebookUrl;
    private String instagramUrl;
    private String twitterUrl;
    private String linkedinUrl;

    private String seoTitle = "BookMyPlay - Online Turf & Stadium Booking Platform";
    @Column(length = 1000)
    private String seoMetaDescription;
    private String seoKeywords;
}