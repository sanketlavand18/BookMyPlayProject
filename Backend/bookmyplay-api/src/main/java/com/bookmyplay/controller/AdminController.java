package com.bookmyplay.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bookmyplay.dto.AdminDashboardResponse;
import com.bookmyplay.dto.LoginRequest;
import com.bookmyplay.dto.LoginResponse;
import com.bookmyplay.entity.*;
import com.bookmyplay.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard() {
        return adminService.getDashboard();
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = adminService.loginAdmin(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // User Management
    @GetMapping("/users")
    public List<User> getUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(adminService.updateUser(id, user));
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return "User Deleted Successfully";
    }

    // Vendor Management
    @GetMapping("/vendors")
    public List<User> getVendors() {
        return adminService.getAllVendors();
    }

    @GetMapping("/vendors/{id}")
    public ResponseEntity<User> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getVendorById(id));
    }

    @PutMapping("/vendors/{id}")
    public ResponseEntity<User> updateVendor(@PathVariable Long id, @RequestBody User vendor) {
        return ResponseEntity.ok(adminService.updateVendor(id, vendor));
    }

    @DeleteMapping("/vendors/{id}")
    public String deleteVendor(@PathVariable Long id) {
        adminService.deleteVendor(id);
        return "Vendor Deleted Successfully";
    }

    // Venue Management
    @GetMapping("/venues")
    public List<Venue> getVenues() {
        return adminService.getAllVenues();
    }

    @GetMapping("/venues/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getVenueById(id));
    }

    @PutMapping("/venues/{id}")
    public ResponseEntity<Venue> updateVenue(@PathVariable Long id, @RequestBody Venue venue) {
        return ResponseEntity.ok(adminService.updateVenue(id, venue));
    }

    @DeleteMapping("/venues/{id}")
    public String deleteVenue(@PathVariable Long id) {
        adminService.deleteVenue(id);
        return "Venue Deleted Successfully";
    }

    // Category Management
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(adminService.createCategory(category));
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return adminService.getAllCategories();
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(adminService.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    public String deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return "Category Deleted Successfully";
    }

    // Booking Management
    @GetMapping("/bookings")
    public List<com.bookmyplay.dto.BookingResponse> getBookings() {
        return adminService.getAllBookings();
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<com.bookmyplay.dto.BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getBookingById(id));
    }

    @DeleteMapping("/bookings/{id}")
    public String deleteBooking(@PathVariable Long id) {
        adminService.deleteBooking(id);
        return "Booking Deleted Successfully";
    }

    // Payment Management
    @GetMapping("/payments")
    public List<Payment> getPayments() {
        return adminService.getAllPayments();
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getPaymentById(id));
    }

    // Review Management
    @GetMapping("/reviews")
    public List<Review> getReviews() {
        return adminService.getAllReviews();
    }

    @DeleteMapping("/reviews/{id}")
    public String deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return "Review Deleted Successfully";
    }
}
