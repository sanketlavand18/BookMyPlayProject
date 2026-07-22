package com.bookmyplay.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyplay.dto.AdminDashboardResponse;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.Review;
import com.bookmyplay.entity.User;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard() {

        return adminService.getDashboard();

    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/venues")
    public List<Venue> getVenues() {
        return adminService.getAllVenues();
    }

    @GetMapping("/bookings")
    public List<Booking> getBookings() {
        return adminService.getAllBookings();
    }

    @GetMapping("/reviews")
    public List<Review> getReviews() {
        return adminService.getAllReviews();
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return "User Deleted Successfully";
    }

    @DeleteMapping("/venues/{id}")
    public void deleteVenue(@PathVariable Long id) {
        adminService.deleteVenue(id);
    }
}