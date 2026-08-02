package com.bookmyplay.controller;

import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.BookingStatus;
import com.bookmyplay.entity.Payment;
import com.bookmyplay.repository.BookingRepository;
import com.bookmyplay.repository.PaymentRepository;
import com.bookmyplay.entity.Coupon;
import com.bookmyplay.repository.CouponRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final CouponRepository couponRepository;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody PaymentOrderRequest request) {
        // Simulating Razorpay order creation
        String mockOrderId = "order_" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 16);
        
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", mockOrderId);
        response.put("amount", request.getAmount());
        response.put("currency", "INR");
        response.put("bookingId", request.getBookingId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        // Simulating signature verification. We assume it matches for local mock environment.
        Payment payment = Payment.builder()
                .paymentId(request.getRazorpayPaymentId())
                .bookingId(request.getBookingId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI")
                .paymentStatus("SUCCESS")
                .transactionId(request.getRazorpayOrderId())
                .paymentDate(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        // Update the booking status to CONFIRMED
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Increment coupon usage count if applied
        if (booking.getCouponCode() != null && !booking.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCouponCode(booking.getCouponCode().trim()).orElse(null);
            if (coupon != null) {
                coupon.setUsageCount((coupon.getUsageCount() != null ? coupon.getUsageCount() : 0) + 1);
                if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
                    coupon.setStatus("INACTIVE");
                }
                couponRepository.save(coupon);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Payment Verification Successful");
        response.put("paymentId", payment.getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public List<Payment> getPaymentHistory() {
        return paymentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment log not found"));
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/refund/{id}")
    public ResponseEntity<?> refundPayment(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment log not found"));

        payment.setPaymentStatus("REFUNDED");
        paymentRepository.save(payment);

        // Cancel associated booking
        Booking booking = bookingRepository.findById(payment.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Refund Processed Successfully");
        response.put("paymentStatus", "REFUNDED");

        return ResponseEntity.ok(response);
    }

    @Data
    public static class PaymentOrderRequest {
        private Long bookingId;
        private Double amount;
    }

    @Data
    public static class PaymentVerificationRequest {
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
        private Long bookingId;
        private Double amount;
        private String paymentMethod;
    }
}
