package com.bookmyplay.service.impl;

import com.bookmyplay.entity.Review;
import com.bookmyplay.repository.ReviewRepository;
import com.bookmyplay.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public String addReview(Review review) {

        review.setCreatedAt(LocalDateTime.now());

        reviewRepository.save(review);

        return "Review Added Successfully";
    }

    @Override
    public List<Review> getReviews(Long venueId) {

        return reviewRepository.findByVenueId(venueId);

    }

}