package com.bookmyplay.controller;

import com.bookmyplay.entity.Slot;
import com.bookmyplay.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor

public class SlotController {

    private final SlotService slotService;

    @GetMapping("/venue/{venueId}")
    public List<Slot> getSlots(
            @PathVariable Long venueId,
            @RequestParam(required = false) String date) {
        java.time.LocalDate localDate = date != null ? java.time.LocalDate.parse(date) : java.time.LocalDate.now();
        return slotService.getSlotsByVenue(venueId, localDate);
    }
}