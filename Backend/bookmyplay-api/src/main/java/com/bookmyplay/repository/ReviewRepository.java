package com.bookmyplay.repository;

import com.bookmyplay.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByVenueId(Long venueId);

    List<Review> findByUserId(Long userId);

    void deleteByVenueId(Long venueId);

    Optional<Review> findByBookingId(Long bookingId);

    List<Review> findByBookingIdIn(List<Long> bookingIds);

    List<Review> findByVenue_VendorId(Long vendorId);
}