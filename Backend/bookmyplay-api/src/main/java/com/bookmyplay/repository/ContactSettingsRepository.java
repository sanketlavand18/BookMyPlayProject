package com.bookmyplay.repository;

import com.bookmyplay.entity.ContactSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactSettingsRepository extends JpaRepository<ContactSettings, Long> {
}