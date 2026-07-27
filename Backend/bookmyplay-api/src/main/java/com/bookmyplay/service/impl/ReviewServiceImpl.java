package com.bookmyplay.service.impl;

import com.bookmyplay.entity.Review;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.BookingStatus;
import com.bookmyplay.repository.ReviewRepository;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.repository.BookingRepository;
import com.bookmyplay.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Override
    public String addReview(Review review) {
        // Enforce constraint: user must have a completed booking for this venue
        List<Booking> userBookings = bookingRepository.findByUser_Id(review.getUserId());
        boolean hasCompletedBooking = userBookings.stream().anyMatch(b -> 
            b.getVenue().getId().equals(review.getVenue().getId()) &&
            (b.getBookingStatus() == BookingStatus.COMPLETED || 
             (b.getBookingStatus() == BookingStatus.CONFIRMED && b.getBookingDate().isBefore(java.time.LocalDate.now())))
        );

        if (!hasCompletedBooking) {
            throw new RuntimeException("You can only review venues you have completed a booking for.");
        }

        review.setCreatedAt(LocalDateTime.now());
        reviewRepository.save(review);
        return "Review Added Successfully";
    }

    @Override
    public List<Review> getReviews(Long venueId) {
        List<Review> reviews = reviewRepository.findByVenueId(venueId);
        for (Review r : reviews) {
            if (r.getUserId() != null) {
                userRepository.findById(r.getUserId()).ifPresent(u -> r.setUserName(u.getFullName()));
            }
            if (r.getVenue() != null) {
                r.setVenueName(r.getVenue().getVenueName());
            }
        }
        return reviews;
    }

    @Override
    public List<Review> getReviewsByUser(Long userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        for (Review r : reviews) {
            if (r.getUserId() != null) {
                userRepository.findById(r.getUserId()).ifPresent(u -> r.setUserName(u.getFullName()));
            }
            if (r.getVenue() != null) {
                r.setVenueName(r.getVenue().getVenueName());
            }
        }
        return reviews;
    }

    @Override
    public Review updateReview(Long id, Review request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return reviewRepository.save(review);
    }

    @Override
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

}