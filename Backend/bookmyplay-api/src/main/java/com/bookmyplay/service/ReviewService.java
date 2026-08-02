package com.bookmyplay.service;

import com.bookmyplay.entity.Review;

import java.util.List;

public interface ReviewService {

    String addReview(Review review);

    List<Review> getReviews(Long venueId);

    List<Review> getReviewsByUser(Long userId);

    Review updateReview(Long id, Review request);

    void deleteReview(Long id);

    Review replyToReview(Long reviewId, String reply);

    Review hideReview(Long reviewId, boolean isHidden);

    List<Review> getReviewsByVendor(Long vendorId);

    List<Review> getAllReviews();

}