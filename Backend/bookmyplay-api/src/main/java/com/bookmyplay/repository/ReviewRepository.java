package com.bookmyplay.repository;

import com.bookmyplay.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByVenueId(Long venueId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT r
        FROM Review r
        LEFT JOIN FETCH r.venue
        WHERE r.userId = :userId
    """)
    List<Review> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT r
        FROM Review r
        LEFT JOIN FETCH r.venue
    """)
    List<Review> findAllWithVenue();

    void deleteByVenueId(Long venueId);

    Optional<Review> findByBookingId(Long bookingId);

    List<Review> findByBookingIdIn(List<Long> bookingIds);

    List<Review> findByVenue_VendorId(Long vendorId);
}