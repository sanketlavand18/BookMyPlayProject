package com.bookmyplay.repository;

import com.bookmyplay.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByVenueId(Long venueId);

    void deleteByVenueId(Long venueId);

}