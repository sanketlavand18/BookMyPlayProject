package com.bookmyplay.controller;

import com.bookmyplay.dto.CreateBookingRequest;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public String createBooking(
            @RequestBody CreateBookingRequest request) {

        return bookingService.createBooking(request);

    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookings(
            @PathVariable Long userId) {

        return bookingService.getBookingsByUser(userId);

    }

}