package com.bookmyplay.service.impl;

import com.bookmyplay.entity.Review;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.BookingStatus;
import com.bookmyplay.repository.ReviewRepository;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.repository.BookingRepository;
import com.bookmyplay.repository.VenueRepository;
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
    private final VenueRepository venueRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public String addReview(Review review) {
        if (review.getBookingId() == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Booking ID is mandatory."
            );
        }

        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Rating is mandatory (1-5 stars)."
            );
        }
        if (review.getComment() == null || review.getComment().trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Review comment cannot be empty."
            );
        }
        if (review.getComment().length() > 500) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Review comment must be maximum 500 characters."
            );
        }

        Booking booking = bookingRepository.findById(review.getBookingId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Booking Not Found"
                ));

        if (!booking.getUser().getId().equals(review.getUserId())) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "You do not own this booking."
            );
        }

        if (booking.getBookingStatus() != BookingStatus.COMPLETED) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "You can only review completed bookings."
            );
        }

        if (reviewRepository.findByBookingId(review.getBookingId()).isPresent()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "You have already reviewed this booking."
            );
        }

        review.setVenue(booking.getVenue());
        review.setCreatedAt(LocalDateTime.now());
        review.setIsHidden(false);
        reviewRepository.save(review);

        updateVenueRating(booking.getVenue().getId());
        return "Review Added Successfully";
    }

    @Override
    public List<Review> getReviews(Long venueId) {
        List<Review> reviews = reviewRepository.findByVenueId(venueId);
        return reviews.stream()
                .filter(r -> r.getIsHidden() == null || !r.getIsHidden())
                .map(r -> {
                    populateTransients(r);
                    return r;
                }).toList();
    }

    @Override
    public List<Review> getReviewsByUser(Long userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream().map(r -> {
            populateTransients(r);
            return r;
        }).toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public Review updateReview(Long id, Review request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Rating is mandatory (1-5 stars)."
            );
        }
        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Review comment cannot be empty."
            );
        }
        if (request.getComment().length() > 500) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Review comment must be maximum 500 characters."
            );
        }

        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        Review saved = reviewRepository.save(review);

        if (saved.getVenue() != null) {
            updateVenueRating(saved.getVenue().getId());
        }
        return saved;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review != null) {
            Long venueId = review.getVenue() != null ? review.getVenue().getId() : null;
            reviewRepository.deleteById(id);
            if (venueId != null) {
                updateVenueRating(venueId);
            }
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public Review replyToReview(Long reviewId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setVendorReply(reply);
        review.setReplyAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public Review hideReview(Long reviewId, boolean isHidden) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setIsHidden(isHidden);
        Review saved = reviewRepository.save(review);
        if (saved.getVenue() != null) {
            updateVenueRating(saved.getVenue().getId());
        }
        return saved;
    }

    @Override
    public List<Review> getReviewsByVendor(Long vendorId) {
        List<Review> reviews = reviewRepository.findByVenue_VendorId(vendorId);
        return reviews.stream().map(r -> {
            populateTransients(r);
            return r;
        }).toList();
    }

    @Override
    public List<Review> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream().map(r -> {
            populateTransients(r);
            return r;
        }).toList();
    }

    private void populateTransients(Review r) {
        if (r.getUserId() != null) {
            userRepository.findById(r.getUserId()).ifPresent(u -> {
                r.setUserName(u.getFullName());
                r.setUserAvatar(u.getProfilePicture());
            });
        }
        if (r.getVenue() != null) {
            r.setVenueName(r.getVenue().getVenueName());
        }
        if (r.getBookingId() != null) {
            bookingRepository.findById(r.getBookingId()).ifPresent(b -> {
                r.setBookingDate(b.getBookingDate());
            });
        }
    }

    private void updateVenueRating(Long venueId) {
        if (venueId == null) return;
        com.bookmyplay.entity.Venue venue = venueRepository.findById(venueId).orElse(null);
        if (venue == null) return;

        List<Review> reviews = reviewRepository.findByVenueId(venueId);
        double sum = 0.0;
        int count = 0;
        for (Review r : reviews) {
            if (r.getIsHidden() == null || !r.getIsHidden()) {
                sum += r.getRating();
                count++;
            }
        }
        if (count > 0) {
            venue.setAverageRating(Math.round((sum / count) * 10.0) / 10.0);
            venue.setTotalReviews(count);
        } else {
            venue.setAverageRating(0.0);
            venue.setTotalReviews(0);
        }
        venueRepository.save(venue);
    }
}