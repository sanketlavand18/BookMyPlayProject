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
    public BookingResponse createBooking(
            @RequestBody CreateBookingRequest request) {

        return bookingService.createBooking(request);

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

    @GetMapping("/history/{userId}")
    public List<BookingResponse> getBookingHistory(
            @PathVariable Long userId) {
        return bookingService.getBookingsByUser(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/cancel/{id}")
    public String cancelBookingById(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
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

    @GetMapping("/invoice/{id}")
    public ResponseEntity<BookingResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }
}