package com.bookmyplay.controller;

import com.bookmyplay.entity.Review;
import com.bookmyplay.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor

public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public String addReview(@RequestBody Review review) {

        return reviewService.addReview(review);

    }

    @GetMapping("/{venueId}")
    public List<Review> getReviews(@PathVariable Long venueId) {

        return reviewService.getReviews(venueId);

    }

    @GetMapping("/user/{userId}")
    public List<Review> getReviewsByUser(@PathVariable Long userId) {
        return reviewService.getReviewsByUser(userId);
    }

    @PutMapping("/{reviewId}")
    public Review updateReview(@PathVariable Long reviewId, @RequestBody Review review) {
        return reviewService.updateReview(reviewId, review);
    }

    @DeleteMapping("/{reviewId}")
    public String deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return "Review Deleted Successfully";
    }

}