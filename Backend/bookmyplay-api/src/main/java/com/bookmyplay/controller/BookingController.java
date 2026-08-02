package com.bookmyplay.controller;

import com.bookmyplay.dto.CreateBookingRequest;
import com.bookmyplay.dto.BookingResponse;
import com.bookmyplay.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor

public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody CreateBookingRequest request) {
        try {
            BookingResponse response = bookingService.createBooking(request);
            return ResponseEntity.ok(response);
        } catch (com.bookmyplay.exception.SlotAlreadyBookedException ex) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public List<BookingResponse> getBookings(
            @PathVariable Long userId) {

        return bookingService.getBookingsByUser(userId);

    }

    @GetMapping("/vendor/{vendorId}")
    public List<BookingResponse> getBookingsByVendor(
            @PathVariable Long vendorId) {
        return bookingService.getBookingsByVendor(vendorId);
    }


    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{bookingId}/cancel")
    public String cancelBooking(@PathVariable Long bookingId) {

        return bookingService.cancelBooking(bookingId);

    }

    @PutMapping("/reschedule/{id}")
    public String rescheduleBooking(
            @PathVariable Long id,
            @RequestParam Long newSlotId) {
        return bookingService.rescheduleBooking(id, newSlotId);
    }
}