package com.bookmyplay.service;

import com.bookmyplay.entity.Review;

import java.util.List;

public interface ReviewService {

    String addReview(Review review);

    List<Review> getReviews(Long venueId);

}