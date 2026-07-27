package com.bookmyplay.service;

import com.bookmyplay.dto.AddSlotRequest;
import com.bookmyplay.entity.Slot;

import java.util.List;

public interface SlotService {

    String addSlot(AddSlotRequest request);

    List<Slot> getSlotsByVenue(Long venueId, java.time.LocalDate date);

    String deleteSlot(Long id);

}