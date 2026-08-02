package com.bookmyplay.service;

import com.bookmyplay.entity.Slot;

import java.util.List;

public interface SlotService {

    List<Slot> getSlotsByVenue(Long venueId, java.time.LocalDate date);

    void generateSlotsForVenue(com.bookmyplay.entity.Venue venue);

    void deleteFutureUnbookedSlots(Long venueId);
}