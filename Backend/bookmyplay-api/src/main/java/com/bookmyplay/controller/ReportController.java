package com.bookmyplay.controller;

import com.bookmyplay.entity.*;
import com.bookmyplay.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/export/{type}/{format}")
    public ResponseEntity<byte[]> exportReport(@PathVariable String type, @PathVariable String format) {
        StringBuilder csv = new StringBuilder();

        if ("users".equalsIgnoreCase(type)) {
            csv.append("ID,Full Name,Email,Phone,Role\n");
            List<User> list = userRepository.findAll();
            for (User u : list) {
                csv.append(u.getId()).append(",")
                   .append(escape(u.getFullName())).append(",")
                   .append(escape(u.getEmail())).append(",")
                   .append(escape(u.getPhone())).append(",")
                   .append(escape(u.getRole())).append("\n");
            }
        } else if ("vendors".equalsIgnoreCase(type)) {
            csv.append("ID,Full Name,Email,Phone,Business Name,Address,City\n");
            List<User> list = userRepository.findAll().stream().filter(u -> "VENDOR".equalsIgnoreCase(u.getRole())).toList();
            for (User u : list) {
                csv.append(u.getId()).append(",")
                   .append(escape(u.getFullName())).append(",")
                   .append(escape(u.getEmail())).append(",")
                   .append(escape(u.getPhone())).append(",")
                   .append(escape(u.getBusinessName())).append(",")
                   .append(escape(u.getAddress())).append(",")
                   .append(escape(u.getCity())).append("\n");
            }
        } else if ("bookings".equalsIgnoreCase(type)) {
            csv.append("ID,Venue,Customer,Date,Start,End,Amount,Status\n");
            List<Booking> list = bookingRepository.findAll();
            for (Booking b : list) {
                csv.append(b.getId()).append(",")
                   .append(escape(b.getVenue() != null ? b.getVenue().getVenueName() : "N/A")).append(",")
                   .append(escape(b.getUser() != null ? b.getUser().getFullName() : "N/A")).append(",")
                   .append(b.getBookingDate()).append(",")
                   .append(b.getStartTime()).append(",")
                   .append(b.getEndTime()).append(",")
                   .append(b.getTotalPrice()).append(",")
                   .append(b.getBookingStatus()).append("\n");
            }
        } else if ("payments".equalsIgnoreCase(type)) {
            csv.append("ID,Amount,Status,Transaction ID,Payment Date\n");
            List<Payment> list = paymentRepository.findAll();
            for (Payment p : list) {
                csv.append(p.getId()).append(",")
                   .append(p.getAmount()).append(",")
                   .append(escape(p.getPaymentStatus())).append(",")
                   .append(escape(p.getTransactionId())).append(",")
                   .append(p.getPaymentDate()).append("\n");
            }
        } else if ("reviews".equalsIgnoreCase(type)) {
            csv.append("ID,Venue,User,Rating,Comment,Date\n");
            List<Review> list = reviewRepository.findAll();
            for (Review r : list) {
                String userName = "N/A";
                if (r.getUserId() != null) {
                    java.util.Optional<User> uOpt = userRepository.findById(r.getUserId());
                    if (uOpt.isPresent()) {
                        userName = uOpt.get().getFullName();
                    }
                }
                csv.append(r.getId()).append(",")
                   .append(escape(r.getVenue() != null ? r.getVenue().getVenueName() : "N/A")).append(",")
                   .append(escape(userName)).append(",")
                   .append(r.getRating()).append(",")
                   .append(escape(r.getComment())).append(",")
                   .append(r.getCreatedAt()).append("\n");
            }
        } else if ("revenue".equalsIgnoreCase(type)) {
            csv.append("Metric,Amount\n");
            double totalBookingsRev = bookingRepository.findAll().stream()
                    .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getBookingStatus().name()))
                    .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                    .sum();
            csv.append("Bookings Revenue,").append(totalBookingsRev).append("\n");
            csv.append("Total,").append(totalBookingsRev).append("\n");
        }

        byte[] data = csv.toString().getBytes();
        String filename = type + "_report." + ("excel".equalsIgnoreCase(format) ? "xls" : "csv");
        MediaType mediaType = "excel".equalsIgnoreCase(format) ? MediaType.parseMediaType("application/vnd.ms-excel") : MediaType.TEXT_PLAIN;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(mediaType)
                .body(data);
    }

    private String escape(String s) {
        if (s == null) return "N/A";
        return "\"" + s.replace("\"", "\"\"").replace("\n", " ").trim() + "\"";
    }
}