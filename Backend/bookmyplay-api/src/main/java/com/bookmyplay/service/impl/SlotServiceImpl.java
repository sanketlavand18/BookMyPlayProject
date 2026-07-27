package com.bookmyplay.service.impl;

import com.bookmyplay.dto.AddSlotRequest;
import com.bookmyplay.entity.Slot;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.repository.SlotRepository;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final VenueRepository venueRepository;

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
    public List<Slot> getSlotsByVenue(Long venueId, LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue Not Found"));

        LocalTime openLocal = parseTime(venue.getOpenTime());
        LocalTime closeLocal = parseTime(venue.getCloseTime());

        // Fallbacks if not set
        if (openLocal == null) openLocal = LocalTime.of(7, 0);
        if (closeLocal == null) closeLocal = LocalTime.of(19, 0);

        List<Slot> generatedSlots = new ArrayList<>();

        // Fetch already booked slots from DB for this venue
        List<Slot> dbSlots = slotRepository.findByVenueId(venueId);

        LocalTime current = openLocal;
        long dummyId = 1L;
        while (current.isBefore(closeLocal)) {
            LocalTime next = current.plusHours(1);
            if (next.isAfter(closeLocal)) {
                break;
            }

            final LocalDate finalDate = date;
            final LocalTime finalCurrent = current;
            final LocalTime finalNext = next;

            // Check if this slot matches any booked slot in DB
            Slot matchingDbSlot = dbSlots.stream()
                    .filter(s -> s.getSlotDate().equals(finalDate) &&
                                 s.getStartTime().equals(finalCurrent) &&
                                 s.getEndTime().equals(finalNext))
                    .findFirst().orElse(null);

            Slot slot = new Slot();
            slot.setVenueId(venueId);
            slot.setSlotDate(date);
            slot.setStartTime(current);
            slot.setEndTime(next);

            if (matchingDbSlot != null) {
                slot.setId(matchingDbSlot.getId());
                slot.setIsBooked(matchingDbSlot.getIsBooked());
            } else {
                slot.setId(-dummyId); // Temporary negative ID
                slot.setIsBooked(false);
                dummyId++;
            }

            generatedSlots.add(slot);
            current = next;
        }

        return generatedSlots;
    }

    @Override
    public String deleteSlot(Long id) {
        slotRepository.deleteById(id);
        return "Slot Deleted Successfully";
    }

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            return null;
        }
        timeStr = timeStr.trim().toUpperCase();
        try {
            if (timeStr.contains("AM") || timeStr.contains("PM")) {
                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);
                if (!timeStr.contains(" AM") && !timeStr.contains(" PM")) {
                    timeStr = timeStr.replace("AM", " AM").replace("PM", " PM");
                }
                return LocalTime.parse(timeStr, dtf);
            } else {
                // Try 24-hour format: "HH:mm"
                return LocalTime.parse(timeStr);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}