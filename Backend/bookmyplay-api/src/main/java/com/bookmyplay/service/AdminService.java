package com.bookmyplay.service;

import java.util.List;

import com.bookmyplay.dto.AdminDashboardResponse;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.Review;
import com.bookmyplay.entity.User;
import com.bookmyplay.entity.Venue;

public interface AdminService {

    AdminDashboardResponse getDashboard();

    List<User> getAllUsers();

    List<Venue> getAllVenues();

    List<Booking> getAllBookings();

    List<Review> getAllReviews();

    void deleteUser(Long id);

    void deleteVenue(Long id);
}