package com.bookmyplay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bookmyplay.dto.AddVenueRequest;
import com.bookmyplay.entity.Category;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.repository.CategoryRepository;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.service.VenueService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public String addVenue(AddVenueRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category Not Found"));

        Venue venue = Venue.builder()
                .vendorId(request.getVendorId())
                .venueName(request.getVenueName())
                .category(category)
                .city(request.getCity())
                .address(request.getAddress())
                .description(request.getDescription())
                .pricePerHour(request.getPricePerHour())
                .imageUrl(request.getImageUrl())
                .slotDuration(request.getSlotDuration())
                .build();

        venueRepository.save(venue);

        return "Venue Added Successfully";
    }

    @Override
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    @Override
    public List<Venue> getVendorVenues(Long vendorId) {
        return venueRepository.findByVendorId(vendorId);
    }

    @Override
    public Venue getVenueById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue Not Found"));
    }

    @Override
    public String updateVenue(Long id, AddVenueRequest request) {

        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue Not Found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category Not Found"));

        venue.setVenueName(request.getVenueName());
        venue.setCategory(category);
        venue.setCity(request.getCity());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        venue.setPricePerHour(request.getPricePerHour());
        venue.setImageUrl(request.getImageUrl());
        venue.setSlotDuration(request.getSlotDuration());

        venueRepository.save(venue);

        return "Venue Updated Successfully";
    }

    @Override
    public String deleteVenue(Long id) {

        if (!venueRepository.existsById(id)) {
            throw new RuntimeException("Venue Not Found");
        }

        venueRepository.deleteById(id);

        return "Venue Deleted Successfully";
    }
}
