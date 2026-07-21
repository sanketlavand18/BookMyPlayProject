package com.bookmyplay.service;

import com.bookmyplay.dto.AddVenueRequest;
import com.bookmyplay.entity.Venue;
import java.util.List;

public interface VenueService {

    String addVenue(AddVenueRequest request);

    List<Venue> getAllVenues();

    List<Venue> getVendorVenues(Long vendorId);

    Venue getVenueById(Long id);

}