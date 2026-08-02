package com.bookmyplay.controller;

import com.bookmyplay.entity.Coupon;
import com.bookmyplay.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponRepository couponRepository;

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestParam String code) {
        Coupon coupon = couponRepository.findByCouponCode(code.trim())
                .orElse(null);
        if (coupon == null) {
            return ResponseEntity.badRequest().body("Invalid Coupon Code");
        }

        if (!"ACTIVE".equalsIgnoreCase(coupon.getStatus())) {
            return ResponseEntity.badRequest().body("Coupon is inactive.");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Coupon is expired.");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsageCount() != null 
                && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            return ResponseEntity.badRequest().body("Coupon usage limit exceeded.");
        }

        return ResponseEntity.ok(coupon);
    }
}
