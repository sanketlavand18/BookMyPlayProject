package com.bookmyplay.repository;

import com.bookmyplay.entity.WebsiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebsiteSettingsRepository extends JpaRepository<WebsiteSettings, Long> {
}