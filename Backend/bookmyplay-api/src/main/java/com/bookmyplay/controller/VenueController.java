package com.bookmyplay.controller;

import com.bookmyplay.dto.AddVenueRequest;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.service.VenueService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class VenueController {

    private final VenueService venueService;

    @PostMapping
    public String addVenue(@RequestBody AddVenueRequest request) {

        return venueService.addVenue(request);

    }

    @GetMapping
    public List<Venue> getAllVenues() {

        return venueService.getAllVenues();

    }

    @GetMapping("/vendor/{vendorId}")
    public List<Venue> getVendorVenues(@PathVariable Long vendorId) {

        return venueService.getVendorVenues(vendorId);

    }

    @GetMapping("/{id}")
    public Venue getVenueById(@PathVariable Long id) {

        return venueService.getVenueById(id);

    }

}