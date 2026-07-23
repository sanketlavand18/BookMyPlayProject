package com.bookmyplay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bookmyplay.dto.AdminDashboardResponse;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.Review;
import com.bookmyplay.entity.User;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.repository.BookingRepository;
import com.bookmyplay.repository.ReviewRepository;
import com.bookmyplay.repository.SlotRepository;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.service.AdminService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final SlotRepository slotRepository;

    @Override
    public AdminDashboardResponse getDashboard() {

        return new AdminDashboardResponse(
                userRepository.count(),
                venueRepository.count(),
                bookingRepository.count(),
                reviewRepository.count());
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public void deleteVenue(Long id) {

        reviewRepository.deleteByVenueId(id);

        slotRepository.deleteByVenueId(id);

        bookingRepository.deleteByVenue_Id(id);

        venueRepository.deleteById(id);
    }
}