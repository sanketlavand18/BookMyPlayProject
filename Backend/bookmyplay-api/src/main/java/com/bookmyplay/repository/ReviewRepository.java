package com.bookmyplay.repository;

import com.bookmyplay.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByVenueId(Long venueId);

    List<Review> findByUserId(Long userId);

    void deleteByVenueId(Long venueId);

}
