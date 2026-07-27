package com.bookmyplay.controller;

import com.bookmyplay.dto.AddVenueRequest;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.service.VenueService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VenueController {

    private final VenueService venueService;

    @PostMapping(consumes = { "multipart/form-data" })
    public String addVenue(
            @RequestPart("venue") AddVenueRequest request,
            @RequestPart("images") MultipartFile[] images,
            @RequestParam("coverIndex") int coverIndex) {

        return venueService.addVenue(request, images, coverIndex);

    }

    @GetMapping
    public List<Venue> getAllVenues() {

        return venueService.getAllVenues();

    }

    @GetMapping("/search")
    public ResponseEntity<org.springframework.data.domain.Page<Venue>> searchVenues(
            @RequestParam(required = false) String venueName,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "idDesc") String sort) {

        com.bookmyplay.dto.VenueSearchDTO searchDTO = com.bookmyplay.dto.VenueSearchDTO.builder()
                .venueName(venueName)
                .city(city)
                .categoryId(categoryId)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .rating(rating)
                .available(available)
                .build();

        org.springframework.data.domain.Sort sorting = org.springframework.data.domain.Sort.by("id").descending();
        if ("priceAsc".equalsIgnoreCase(sort)) {
            sorting = org.springframework.data.domain.Sort.by("pricePerHour").ascending();
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            sorting = org.springframework.data.domain.Sort.by("pricePerHour").descending();
        } else if ("newest".equalsIgnoreCase(sort)) {
            sorting = org.springframework.data.domain.Sort.by("id").descending();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sorting);
        org.springframework.data.domain.Page<Venue> result = venueService.searchVenues(searchDTO, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Venue> getVendorVenues(@PathVariable Long vendorId) {

        return venueService.getVendorVenues(vendorId);

    }

    @GetMapping("/{id}")
    public Venue getVenueById(@PathVariable Long id) {

        return venueService.getVenueById(id);

    }

    @PutMapping("/{id}")
    public String updateVenue(@PathVariable Long id,
            @RequestBody AddVenueRequest request) {

        return venueService.updateVenue(id, request);

    }

    @DeleteMapping("/{id}")
    public String deleteVenue(@PathVariable Long id) {
        return venueService.deleteVenue(id);
    }
}