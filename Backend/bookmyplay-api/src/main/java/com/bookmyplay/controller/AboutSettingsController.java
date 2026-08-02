package com.bookmyplay.controller;

import com.bookmyplay.entity.AboutSettings;
import com.bookmyplay.repository.AboutSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/about-settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AboutSettingsController {

    private final AboutSettingsRepository repository;

    @GetMapping
    public AboutSettings getSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            AboutSettings defaults = AboutSettings.builder()
                    .title("About BookMyPlay")
                    .description("BookMyPlay connects sports enthusiasts with trusted venue owners through a seamless online booking platform. Our goal is to simplify sports venue discovery, enable real-time slot booking, and help venue owners efficiently manage their facilities and reservations.")
                    .mission("Make sports accessible through fast and reliable venue booking.")
                    .vision("Become India's most trusted sports venue booking platform.")
                    .companyValues("Encourage healthy lifestyles by making sports more accessible.")
                    .imageUrl("")
                    .build();
            return repository.save(defaults);
        });
    }

    @PutMapping
    public AboutSettings updateSettings(@RequestBody AboutSettings settings) {
        AboutSettings existing = getSettings();
        existing.setTitle(settings.getTitle());
        existing.setDescription(settings.getDescription());
        existing.setMission(settings.getMission());
        existing.setVision(settings.getVision());
        existing.setCompanyValues(settings.getCompanyValues());
        existing.setImageUrl(settings.getImageUrl());
        return repository.save(existing);
    }
}
