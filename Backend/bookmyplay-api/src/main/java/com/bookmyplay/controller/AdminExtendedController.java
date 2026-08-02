package com.bookmyplay.controller;

import com.bookmyplay.entity.*;
import com.bookmyplay.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/extended")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminExtendedController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final VenueRepository venueRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    // --- USER / VENDOR OPERATIONS ---
    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id, @RequestParam(defaultValue = "admin") String actor) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        u.setIsBlocked(true);
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "User blocked successfully"));
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id, @RequestParam(defaultValue = "admin") String actor) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        u.setIsBlocked(false);
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "User unblocked successfully"));
    }

    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> payload,
            @RequestParam(defaultValue = "admin") String actor) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String newPass = payload.getOrDefault("password", "BookMyPlay@123");
        u.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Default: " + newPass));
    }

    @GetMapping("/users/{id}/bookings")
    public List<Booking> getUserBookings(@PathVariable Long id) {
        userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserId(id);
    }

    @GetMapping("/users/{id}/reviews")
    public List<Review> getUserReviews(@PathVariable Long id) {
        userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return reviewRepository.findByUserId(id);
    }

    // --- VENUE APPROVAL & TAG SYSTEM ---
    @GetMapping("/venues/pending")
    public List<Venue> getPendingVenues() {
        return venueRepository.findAll().stream()
                .filter(v -> "PENDING".equalsIgnoreCase(v.getStatus()) || v.getStatus() == null)
                .toList();
    }

    @PutMapping("/venues/{id}/approve")
    public ResponseEntity<?> approveVenue(@PathVariable Long id, @RequestParam(defaultValue = "admin") String actor) {
        Venue v = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        v.setStatus("APPROVED");
        venueRepository.save(v);
        return ResponseEntity.ok(Map.of("message", "Venue approved successfully"));
    }

    @PutMapping("/venues/{id}/reject")
    public ResponseEntity<?> rejectVenue(@PathVariable Long id, @RequestParam(defaultValue = "admin") String actor) {
        Venue v = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        v.setStatus("REJECTED");
        venueRepository.save(v);
        return ResponseEntity.ok(Map.of("message", "Venue rejected successfully"));
    }

    @PutMapping("/venues/{id}/tag")
    public ResponseEntity<?> tagVenue(@PathVariable Long id, @RequestParam String tag,
            @RequestParam(defaultValue = "admin") String actor) {
        Venue v = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        v.setTag(tag.toUpperCase());
        venueRepository.save(v);
        return ResponseEntity.ok(Map.of("message", "Venue tag updated successfully"));
    }

    // --- COUPON CRUD ---
    @GetMapping("/coupons")
    public List<Coupon> getCoupons() {
        return couponRepository.findAll();
    }

    @PostMapping("/coupons")
    public Coupon createCoupon(@RequestBody Coupon c) {
        if (c.getStatus() == null)
            c.setStatus("ACTIVE");
        if (c.getUsageCount() == null)
            c.setUsageCount(0);
        return couponRepository.save(c);
    }

    @PutMapping("/coupons/{id}")
    public Coupon updateCoupon(@PathVariable Long id, @RequestBody Coupon details) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        c.setCouponCode(details.getCouponCode());
        c.setDiscount(details.getDiscount());
        c.setExpiryDate(details.getExpiryDate());
        c.setUsageLimit(details.getUsageLimit());
        c.setStatus(details.getStatus());
        c.setTitle(details.getTitle());
        c.setDescription(details.getDescription());
        c.setMinOrderAmount(details.getMinOrderAmount());
        c.setValidFrom(details.getValidFrom());
        c.setTermsAndConditions(details.getTermsAndConditions());
        return couponRepository.save(c);
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
    }
}