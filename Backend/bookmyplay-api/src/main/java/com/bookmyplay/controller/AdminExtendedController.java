package com.bookmyplay.controller;

import com.bookmyplay.entity.*;
import com.bookmyplay.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    private final SupportTicketRepository ticketRepository;
    private final AuditLogRepository auditLogRepository;
    private final WebsiteSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    // --- AUDIT LOG UTILITY ---
    private void logAction(String action, String actor, String role, String details) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .actor(actor)
                .actorRole(role)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    // --- USER / VENDOR OPERATIONS ---
    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id, @RequestParam(defaultValue = "admin") String actor) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        u.setIsBlocked(true);
        userRepository.save(u);
        logAction("USER_BLOCKED", actor, "ADMIN", "Blocked account ID: " + id + ", name: " + u.getFullName());
        return ResponseEntity.ok(Map.of("message", "User blocked successfully"));
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id, @RequestParam(defaultValue = "admin") String actor) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        u.setIsBlocked(false);
        userRepository.save(u);
        logAction("USER_UNBLOCKED", actor, "ADMIN", "Unblocked account ID: " + id + ", name: " + u.getFullName());
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
        logAction("PASSWORD_RESET", actor, "ADMIN", "Reset password for account: " + u.getEmail());
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
        logAction("VENUE_APPROVED", actor, "ADMIN", "Approved venue ID: " + id + ", name: " + v.getVenueName());
        return ResponseEntity.ok(Map.of("message", "Venue approved successfully"));
    }

    @PutMapping("/venues/{id}/reject")
    public ResponseEntity<?> rejectVenue(@PathVariable Long id, @RequestParam(defaultValue = "admin") String actor) {
        Venue v = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        v.setStatus("REJECTED");
        venueRepository.save(v);
        logAction("VENUE_REJECTED", actor, "ADMIN", "Rejected venue ID: " + id + ", name: " + v.getVenueName());
        return ResponseEntity.ok(Map.of("message", "Venue rejected successfully"));
    }

    @PutMapping("/venues/{id}/tag")
    public ResponseEntity<?> tagVenue(@PathVariable Long id, @RequestParam String tag,
            @RequestParam(defaultValue = "admin") String actor) {
        Venue v = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        v.setTag(tag.toUpperCase());
        venueRepository.save(v);
        logAction("VENUE_TAG_UPDATED", actor, "ADMIN", "Updated venue ID: " + id + " tag to: " + tag);
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
        return couponRepository.save(c);
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
    }

    // --- SUPPORT TICKETS ---
    @GetMapping("/tickets")
    public List<SupportTicket> getTickets() {
        return ticketRepository.findAll();
    }

    @PostMapping("/tickets")
    public SupportTicket createTicket(@RequestBody SupportTicket ticket) {
        ticket.setStatus("PENDING");
        ticket.setCreatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PutMapping("/tickets/{id}/reply")
    public SupportTicket replyTicket(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        SupportTicket t = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        t.setReplyMessage(payload.get("reply"));
        t.setStatus("RESOLVED");
        return ticketRepository.save(t);
    }

    @PutMapping("/tickets/{id}/status")
    public SupportTicket updateTicketStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        SupportTicket t = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        t.setStatus(payload.get("status").toUpperCase());
        return ticketRepository.save(t);
    }

    // --- AUDIT LOGS ---
    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAll();
    }

    // --- WEBSITE SETTINGS (CMS) ---
    @GetMapping("/settings/website")
    public WebsiteSettings getWebsiteSettings() {
        if (settingsRepository.count() == 0) {
            settingsRepository.save(WebsiteSettings.builder()
                    .websiteName("BookMyPlay")
                    .footerText("© 2026 BookMyPlay. All Rights Reserved.")
                    .aboutUs("BookMyPlay is a sports venue aggregator and turf booking ecosystem.")
                    .privacyPolicy("We protect your contact parameters and payment transaction logs securely.")
                    .termsAndConditions("Terms govern turf booking slot behaviors and refunds configurations.")
                    .refundPolicy("Refund configurations exist if turf requests are cancelled within business periods.")
                    .build());
        }
        return settingsRepository.findAll().get(0);
    }

    @PutMapping("/settings/website")
    public WebsiteSettings updateWebsiteSettings(@RequestBody WebsiteSettings details) {
        WebsiteSettings current = settingsRepository.findAll().isEmpty()
                ? new WebsiteSettings()
                : settingsRepository.findAll().get(0);

        current.setWebsiteName(details.getWebsiteName());
        current.setLogoUrl(details.getLogoUrl());
        current.setFaviconUrl(details.getFaviconUrl());
        current.setPrimaryThemeColor(details.getPrimaryThemeColor());
        current.setFooterText(details.getFooterText());
        current.setAboutUs(details.getAboutUs());
        current.setPrivacyPolicy(details.getPrivacyPolicy());
        current.setTermsAndConditions(details.getTermsAndConditions());
        current.setRefundPolicy(details.getRefundPolicy());
        current.setFacebookUrl(details.getFacebookUrl());
        current.setInstagramUrl(details.getInstagramUrl());
        current.setTwitterUrl(details.getTwitterUrl());
        current.setLinkedinUrl(details.getLinkedinUrl());
        current.setSeoTitle(details.getSeoTitle());
        current.setSeoMetaDescription(details.getSeoMetaDescription());
        current.setSeoKeywords(details.getSeoKeywords());

        return settingsRepository.save(current);
    }
}