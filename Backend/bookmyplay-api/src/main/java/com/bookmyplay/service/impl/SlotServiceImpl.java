package com.bookmyplay.service.impl;

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
    public List<Slot> getSlotsByVenue(Long venueId, LocalDate date) {
        LocalDate today = LocalDate.now();
        if (date == null) {
            date = today;
        }

        LocalDate maxDate = today.plusDays(6);
        if (date.isBefore(today) || date.isAfter(maxDate)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Booking date must be within the rolling 7-day window."
            );
        }

        List<Slot> dbSlots = slotRepository.findByVenueIdAndSlotDate(venueId, date);

        if (dbSlots.isEmpty()) {
            Venue venue = venueRepository.findById(venueId)
                    .orElseThrow(() -> new RuntimeException("Venue Not Found"));

            LocalTime openLocal = parseTime(venue.getOpenTime());
            LocalTime closeLocal = parseTime(venue.getCloseTime());
            Integer duration = venue.getSlotDuration();

            // Fallbacks
            if (openLocal == null) openLocal = LocalTime.of(7, 0);
            if (closeLocal == null) closeLocal = LocalTime.of(19, 0);
            if (duration == null) duration = 60;

            generateSlotsForDate(venue, date, openLocal, closeLocal, duration);
            dbSlots = slotRepository.findByVenueIdAndSlotDate(venueId, date);
        }

        if (date.equals(today)) {
            LocalTime now = LocalTime.now();
            List<Slot> filtered = new java.util.ArrayList<>();
            for (Slot s : dbSlots) {
                if (s.getStartTime().isAfter(now)) {
                    filtered.add(s);
                }
            }
            return filtered;
        }

        return dbSlots;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void generateSlotsForVenue(Venue venue) {
        LocalTime openLocal = parseTime(venue.getOpenTime());
        LocalTime closeLocal = parseTime(venue.getCloseTime());

        if (openLocal == null || closeLocal == null) {
            throw new IllegalArgumentException("Invalid opening or closing time format.");
        }

        if (!openLocal.isBefore(closeLocal)) {
            throw new IllegalArgumentException("Opening time must be before closing time.");
        }

        Integer duration = venue.getSlotDuration();
        if (duration == null || duration <= 0) {
            throw new IllegalArgumentException("Slot duration is required and must be greater than zero.");
        }

        long totalMinutes = java.time.Duration.between(openLocal, closeLocal).toMinutes();
        if (totalMinutes < duration) {
            throw new IllegalArgumentException("Selected slot duration does not fit within the operating hours.");
        }

        LocalDate today = LocalDate.now();
        // Generate for the next 30 days
        for (int i = 0; i < 30; i++) {
            LocalDate date = today.plusDays(i);
            generateSlotsForDate(venue, date, openLocal, closeLocal, duration);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteFutureUnbookedSlots(Long venueId) {
        slotRepository.deleteFutureUnbookedSlots(venueId, LocalDate.now());
    }

    private void generateSlotsForDate(Venue venue, LocalDate date, LocalTime openLocal, LocalTime closeLocal, int duration) {
        List<Slot> existing = slotRepository.findByVenueIdAndSlotDate(venue.getId(), date);

        LocalTime current = openLocal;
        while (current.isBefore(closeLocal)) {
            LocalTime next = current.plusMinutes(duration);
            if (next.isAfter(closeLocal)) {
                break;
            }

            final LocalTime finalCurrent = current;
            final LocalTime finalNext = next;

            // Check if there is an overlapping slot in database (overlap: sStart < finalNext && finalCurrent < sEnd)
            boolean hasOverlap = existing.stream().anyMatch(s -> {
                LocalTime sStart = s.getStartTime();
                LocalTime sEnd = s.getEndTime();
                return sStart.isBefore(finalNext) && finalCurrent.isBefore(sEnd);
            });

            if (!hasOverlap) {
                Slot slot = new Slot();
                slot.setVenueId(venue.getId());
                slot.setSlotDate(date);
                slot.setStartTime(current);
                slot.setEndTime(next);
                slot.setIsBooked(false);
                slotRepository.save(slot);
            }

            current = next;
        }
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
