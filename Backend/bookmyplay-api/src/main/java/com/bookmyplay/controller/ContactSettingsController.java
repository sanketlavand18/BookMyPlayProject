package com.bookmyplay.controller;

import com.bookmyplay.entity.ContactSettings;
import com.bookmyplay.repository.ContactSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact-settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContactSettingsController {

    private final ContactSettingsRepository repository;

    @GetMapping
    public ContactSettings getSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            ContactSettings defaults = ContactSettings.builder()
                    .companyName("BookMyPlay Ltd.")
                    .phone("+1 (555) 019-9000")
                    .email("info@bookmyplay.com")
                    .officeAddress("123 Sports Way, Arena District, CA 90210")
                    .googleMapsLocation("19.1234, 72.8765")
                    .facebookUrl("https://facebook.com/bookmyplay")
                    .instagramUrl("https://instagram.com/bookmyplay")
                    .twitterUrl("https://twitter.com/bookmyplay")
                    .linkedinUrl("https://linkedin.com/company/bookmyplay")
                    .whatsAppNumber("+15550199000")
                    .supportEmail("support@bookmyplay.com")
                    .businessHours("Mon - Sun: 7:00 AM - 10:00 PM")
                    .build();
            return repository.save(defaults);
        });
    }

    @PutMapping
    public ContactSettings updateSettings(@RequestBody ContactSettings settings) {
        ContactSettings existing = getSettings();
        existing.setCompanyName(settings.getCompanyName());
        existing.setPhone(settings.getPhone());
        existing.setEmail(settings.getEmail());
        existing.setOfficeAddress(settings.getOfficeAddress());
        existing.setGoogleMapsLocation(settings.getGoogleMapsLocation());
        existing.setFacebookUrl(settings.getFacebookUrl());
        existing.setInstagramUrl(settings.getInstagramUrl());
        existing.setTwitterUrl(settings.getTwitterUrl());
        existing.setLinkedinUrl(settings.getLinkedinUrl());
        existing.setWhatsAppNumber(settings.getWhatsAppNumber());
        existing.setSupportEmail(settings.getSupportEmail());
        existing.setBusinessHours(settings.getBusinessHours());
        return repository.save(existing);
    }
}