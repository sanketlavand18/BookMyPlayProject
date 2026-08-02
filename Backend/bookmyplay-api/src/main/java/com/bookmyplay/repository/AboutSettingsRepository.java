package com.bookmyplay.repository;

import com.bookmyplay.entity.AboutSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AboutSettingsRepository extends JpaRepository<AboutSettings, Long> {
}
