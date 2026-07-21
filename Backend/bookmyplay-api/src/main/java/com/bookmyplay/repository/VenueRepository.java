package com.bookmyplay.repository;

import com.bookmyplay.entity.Venue;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByVendorId(Long vendorId);
}