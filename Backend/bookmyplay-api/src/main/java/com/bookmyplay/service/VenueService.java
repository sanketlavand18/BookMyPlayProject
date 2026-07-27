package com.bookmyplay.service;

import com.bookmyplay.dto.AddVenueRequest;
import com.bookmyplay.entity.Venue;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface VenueService {

    String addVenue(AddVenueRequest request, MultipartFile[] images, int coverIndex);

    List<Venue> getAllVenues();

    List<Venue> getVendorVenues(Long vendorId);

    Venue getVenueById(Long id);

    org.springframework.data.domain.Page<Venue> searchVenues(com.bookmyplay.dto.VenueSearchDTO searchDTO, org.springframework.data.domain.Pageable pageable);

    String updateVenue(Long id, AddVenueRequest request);

    String deleteVenue(Long id);
}