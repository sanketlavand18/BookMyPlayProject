package com.bookmyplay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bookmyplay.dto.AddVenueRequest;
import com.bookmyplay.entity.Category;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.entity.VenueImage;
import com.bookmyplay.entity.VendorSubscription;
import com.bookmyplay.repository.CategoryRepository;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.repository.VendorSubscriptionRepository;
import com.bookmyplay.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

import com.bookmyplay.service.SlotService;

@Service
@RequiredArgsConstructor
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final CategoryRepository categoryRepository;
    private final VendorSubscriptionRepository subscriptionRepository;
    private final SlotService slotService;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public String addVenue(AddVenueRequest request, MultipartFile[] images, int coverIndex) {

        if (!isSubscriptionActive(request.getVendorId())) {
            throw new RuntimeException("Your free trial has expired. Purchase a subscription plan to continue publishing your venues.");
        }

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
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .state(request.getState())
                .country(request.getCountry())
                .postalCode(request.getPostalCode())
                .openTime(request.getOpenTime())
                .closeTime(request.getCloseTime())
                .slotDuration(request.getSlotDuration())
                .status(request.getStatus() != null ? request.getStatus() : "PENDING")
                .tag("NEW")
                .build();

        // Save venue first
        venue = venueRepository.save(venue);

        // Generate slots
        slotService.generateSlotsForVenue(venue);

        List<VenueImage> venueImages = new java.util.ArrayList<>();
        String coverPath = null;

        if (images != null && images.length > 0) {

            // Permanent upload directory
            String uploadDirPath = "C:/BookMyPlay/uploads/venues/";

            java.io.File uploadDir = new java.io.File(uploadDirPath);

            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            for (int i = 0; i < images.length; i++) {

                MultipartFile file = images[i];

                if (file == null || file.isEmpty()) {
                    continue;
                }

                try {

                    String originalFilename = file.getOriginalFilename();

                    String extension = "";

                    if (originalFilename != null && originalFilename.contains(".")) {
                        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    }

                    String filename = java.util.UUID.randomUUID() + extension;

                    java.io.File destination = new java.io.File(uploadDir, filename);

                    file.transferTo(destination);

                    String imagePath = "/uploads/venues/" + filename;

                    boolean isCover = (i == coverIndex);

                    if (isCover) {
                        coverPath = imagePath;
                    }

                    VenueImage venueImage = VenueImage.builder()
                            .venue(venue)
                            .imagePath(imagePath)
                            .isCover(isCover)
                            .build();

                    venueImages.add(venueImage);

                } catch (Exception e) {
                    e.printStackTrace();
                    throw new RuntimeException("Failed to save image: " + e.getMessage());
                }
            }
        }

        if (coverPath == null && !venueImages.isEmpty()) {
            venueImages.get(0).setIsCover(true);
            coverPath = venueImages.get(0).getImagePath();
        }

        venue.setImages(venueImages);
        venue.setImageUrl(coverPath);

        venueRepository.save(venue);

        return "Venue Added Successfully";
    }

    @Override
    public List<Venue> getAllVenues() {
        return venueRepository.findAll().stream()
                .filter(v -> isSubscriptionActive(v.getVendorId()))
                .toList();
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
    public org.springframework.data.domain.Page<Venue> searchVenues(com.bookmyplay.dto.VenueSearchDTO searchDTO,
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Venue> spec = com.bookmyplay.repository.spec.VenueSpecification
                .filterByCriteria(searchDTO);
        List<Venue> allMatching = venueRepository.findAll(spec);
        List<Venue> filtered = allMatching.stream()
                .filter(v -> isSubscriptionActive(v.getVendorId()))
                .toList();
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        
        if (start > filtered.size()) {
            return new org.springframework.data.domain.PageImpl<>(java.util.Collections.emptyList(), pageable, filtered.size());
        }
        
        return new org.springframework.data.domain.PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public String updateVenue(Long id, AddVenueRequest request) {

        if (!isSubscriptionActive(request.getVendorId())) {
            throw new RuntimeException("Your free trial has expired. Purchase a subscription plan to continue publishing your venues.");
        }

        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue Not Found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category Not Found"));

        // Check if timing or slot duration has changed
        boolean timingOrDurationChanged = !venue.getOpenTime().equalsIgnoreCase(request.getOpenTime())
                || !venue.getCloseTime().equalsIgnoreCase(request.getCloseTime())
                || (venue.getSlotDuration() == null && request.getSlotDuration() != null)
                || (venue.getSlotDuration() != null && !venue.getSlotDuration().equals(request.getSlotDuration()));

        venue.setVenueName(request.getVenueName());
        venue.setCategory(category);
        venue.setCity(request.getCity());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        venue.setPricePerHour(request.getPricePerHour());
        if (request.getImageUrl() != null) {
            venue.setImageUrl(request.getImageUrl());
        }
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());
        venue.setState(request.getState());
        venue.setCountry(request.getCountry());
        venue.setPostalCode(request.getPostalCode());
        venue.setOpenTime(request.getOpenTime());
        venue.setCloseTime(request.getCloseTime());
        venue.setSlotDuration(request.getSlotDuration());
        if (request.getStatus() != null) {
            venue.setStatus(request.getStatus());
        }

        venueRepository.save(venue);

        if (timingOrDurationChanged) {
            // Delete only future unbooked slots
            slotService.deleteFutureUnbookedSlots(id);
            // Generate new slots
            slotService.generateSlotsForVenue(venue);
        }

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

    private boolean isSubscriptionActive(Long vendorId) {
        List<VendorSubscription> subs = subscriptionRepository.findByVendorId(vendorId);
        return subs.stream()
                .anyMatch(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) 
                        && s.getExpiryDate() != null 
                        && !s.getExpiryDate().isBefore(LocalDate.now()));
    }
}
