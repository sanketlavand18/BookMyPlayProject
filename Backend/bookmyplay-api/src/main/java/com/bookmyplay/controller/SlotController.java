package com.bookmyplay.controller;

import com.bookmyplay.dto.AddSlotRequest;
import com.bookmyplay.entity.Slot;
import com.bookmyplay.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SlotController {

    private final SlotService slotService;

    @PostMapping
    public String addSlot(@RequestBody AddSlotRequest request) {

        return slotService.addSlot(request);

    }

    @GetMapping("/venue/{venueId}")
    public List<Slot> getSlots(@PathVariable Long venueId) {

        return slotService.getSlotsByVenue(venueId);

    }

    @DeleteMapping("/{id}")
    public String deleteSlot(@PathVariable Long id) {

        return slotService.deleteSlot(id);

    }

}