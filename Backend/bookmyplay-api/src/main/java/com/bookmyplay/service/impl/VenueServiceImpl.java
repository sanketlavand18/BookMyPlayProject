package com.bookmyplay.service.impl;

import com.bookmyplay.dto.AddVenueRequest;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.service.VenueService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;

    @Override
    public String addVenue(AddVenueRequest request) {

        Venue venue = Venue.builder()

                .vendorId(request.getVendorId())
                .venueName(request.getVenueName())
                .sport(request.getSport())
                .city(request.getCity())
                .address(request.getAddress())
                .description(request.getDescription())
                .pricePerHour(request.getPricePerHour())
                .imageUrl(request.getImageUrl())

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
}