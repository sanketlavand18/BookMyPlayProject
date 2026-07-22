package com.bookmyplay.service.impl;

import com.bookmyplay.dto.AddSlotRequest;
import com.bookmyplay.entity.Slot;
import com.bookmyplay.repository.SlotRepository;
import com.bookmyplay.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;

    @Override
    public String addSlot(AddSlotRequest request) {

        Slot slot = new Slot();

        slot.setVenueId(request.getVenueId());
        slot.setSlotDate(request.getSlotDate());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setIsBooked(false);

        slotRepository.save(slot);

        return "Slot Added Successfully";
    }

    @Override
    public List<Slot> getSlotsByVenue(Long venueId) {

        return slotRepository.findByVenueId(venueId);

    }

    @Override
    public String deleteSlot(Long id) {

        slotRepository.deleteById(id);

        return "Slot Deleted Successfully";
    }

}