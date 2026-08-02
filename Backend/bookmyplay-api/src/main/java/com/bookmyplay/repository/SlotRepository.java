package com.bookmyplay.repository;

import com.bookmyplay.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByVenueId(Long venueId);

    List<Slot> findByVenueIdAndSlotDate(Long venueId, LocalDate slotDate);

    void deleteByVenueId(Long venueId);

    @Modifying
    @Query("DELETE FROM Slot s WHERE s.venueId = :venueId AND s.slotDate >= :date AND s.isBooked = false")
    void deleteFutureUnbookedSlots(@Param("venueId") Long venueId, @Param("date") LocalDate date);
}