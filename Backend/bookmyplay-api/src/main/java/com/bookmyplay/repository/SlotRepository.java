package com.bookmyplay.repository;

import com.bookmyplay.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdForUpdate(@Param("id") Long id);

    List<Slot> findByVenueId(Long venueId);

    List<Slot> findByVenueIdAndSlotDate(Long venueId, LocalDate slotDate);

    void deleteByVenueId(Long venueId);

    @Modifying
    @Query("DELETE FROM Slot s WHERE s.venueId = :venueId AND s.slotDate >= :date AND s.isBooked = false")
    void deleteFutureUnbookedSlots(@Param("venueId") Long venueId, @Param("date") LocalDate date);
}