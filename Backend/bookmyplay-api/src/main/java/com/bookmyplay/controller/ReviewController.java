package com.bookmyplay.controller;

import com.bookmyplay.entity.Review;
import com.bookmyplay.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
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

}