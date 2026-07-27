package com.bookmyplay.service;

import java.util.List;

import com.bookmyplay.dto.AdminDashboardResponse;
import com.bookmyplay.dto.LoginRequest;
import com.bookmyplay.dto.LoginResponse;
import com.bookmyplay.entity.*;

public interface AdminService {

    AdminDashboardResponse getDashboard();

    // User Management
    List<User> getAllUsers();
    User getUserById(Long id);
    User updateUser(Long id, User user);
    void deleteUser(Long id);

    // Vendor Management
    List<User> getAllVendors();
    User getVendorById(Long id);
    User updateVendor(Long id, User vendor);
    void deleteVendor(Long id);

    // Venue Management
    List<Venue> getAllVenues();
    Venue getVenueById(Long id);
    Venue updateVenue(Long id, Venue venue);
    void deleteVenue(Long id);

    // Category Management
    Category createCategory(Category category);
    List<Category> getAllCategories();
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);

    // Booking Management
    List<com.bookmyplay.dto.BookingResponse> getAllBookings();
    com.bookmyplay.dto.BookingResponse getBookingById(Long id);
    void deleteBooking(Long id);

    // Payment Management
    List<Payment> getAllPayments();
    Payment getPaymentById(Long id);

    // Review Management
    List<Review> getAllReviews();
    void deleteReview(Long id);

    // Authentication
    LoginResponse loginAdmin(LoginRequest request);
}