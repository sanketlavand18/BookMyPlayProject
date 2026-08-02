package com.bookmyplay.controller;

import com.bookmyplay.entity.SubscriptionPlan;
import com.bookmyplay.entity.VendorSubscription;
import com.bookmyplay.entity.User;
import com.bookmyplay.repository.SubscriptionPlanRepository;
import com.bookmyplay.repository.VendorSubscriptionRepository;
import com.bookmyplay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private final SubscriptionPlanRepository planRepository;
    private final VendorSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    // --- PLANS CRUD ---
    @GetMapping("/plans")
    public List<SubscriptionPlan> getPlans() {
        seedPlansIfEmpty();
        return planRepository.findAll();
    }

    @PostMapping("/plans")
    public SubscriptionPlan createPlan(@RequestBody SubscriptionPlan plan) {
        if (plan.getStatus() == null) {
            plan.setStatus("ACTIVE");
        }
        return planRepository.save(plan);
    }

    @PutMapping("/plans/{id}")
    public SubscriptionPlan updatePlan(@PathVariable Long id, @RequestBody SubscriptionPlan planDetails) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan Not Found"));
        plan.setPlanName(planDetails.getPlanName());
        plan.setDuration(planDetails.getDuration());
        plan.setPrice(planDetails.getPrice());
        plan.setDescription(planDetails.getDescription());
        plan.setStatus(planDetails.getStatus());
        return planRepository.save(plan);
    }

    @DeleteMapping("/plans/{id}")
    public String deletePlan(@PathVariable Long id) {
        planRepository.deleteById(id);
        return "Plan deleted successfully";
    }

    // --- VENDOR PURCHASE & STATUS ---
    @PostMapping("/purchase")
    public VendorSubscription purchaseSubscription(@RequestBody Map<String, Object> payload) {
        Long vendorId = Long.valueOf(payload.get("vendorId").toString());
        Long planId = Long.valueOf(payload.get("planId").toString());
        String transactionId = payload.get("transactionId").toString();

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan Not Found"));

        String planType = "BASIC";
        String nameLower = plan.getPlanName().toLowerCase();
        if (nameLower.contains("premium") || nameLower.contains("yearly")) {
            planType = "PREMIUM";
        } else if (nameLower.contains("standard") || nameLower.contains("quarterly") || nameLower.contains("half-year")) {
            planType = "STANDARD";
        }

        VendorSubscription sub = VendorSubscription.builder()
                .vendorId(vendorId)
                .planId(planId)
                .amount(plan.getPrice())
                .paymentDate(LocalDateTime.now())
                .paymentStatus("PENDING")
                .status("PENDING")
                .planType(planType)
                .transactionId(transactionId)
                .planName(plan.getPlanName())
                .build();

        return subscriptionRepository.save(sub);
    }

    @PostMapping("/subscribe")
    public VendorSubscription subscribeVendor(@RequestBody Map<String, Object> payload) {
        Long vendorId = Long.valueOf(payload.get("vendorId").toString());
        Long planId = Long.valueOf(payload.get("planId").toString());

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan Not Found"));

        // Deactivate all previous active or pending subscriptions for this vendor
        List<VendorSubscription> otherSubs = subscriptionRepository.findByVendorId(vendorId);
        for (VendorSubscription other : otherSubs) {
            if ("ACTIVE".equalsIgnoreCase(other.getStatus()) || "PENDING".equalsIgnoreCase(other.getStatus())) {
                other.setStatus("EXPIRED");
                other.setPaymentStatus("EXPIRED");
                subscriptionRepository.save(other);
            }
        }

        String planType = "BASIC";
        String nameLower = plan.getPlanName().toLowerCase();
        if (nameLower.contains("premium") || nameLower.contains("yearly")) {
            planType = "PREMIUM";
        } else if (nameLower.contains("standard") || nameLower.contains("quarterly") || nameLower.contains("half-year")) {
            planType = "STANDARD";
        }

        VendorSubscription sub = VendorSubscription.builder()
                .vendorId(vendorId)
                .planId(planId)
                .amount(plan.getPrice())
                .paymentDate(LocalDateTime.now())
                .expiryDate(LocalDate.now().plusMonths(plan.getDuration()))
                .paymentStatus("APPROVED")
                .status("ACTIVE")
                .planType(planType)
                .transactionId("SUB_" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .planName(plan.getPlanName())
                .build();

        return subscriptionRepository.save(sub);
    }

    @GetMapping("/vendor/{vendorId}")
    public Map<String, Object> getVendorSubscriptionStatus(@PathVariable Long vendorId) {
        List<VendorSubscription> subs = subscriptionRepository.findByVendorId(vendorId);
        
        // 1. Check if there is an active subscription (including trials)
        Optional<VendorSubscription> activeSub = subs.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) || "APPROVED".equalsIgnoreCase(s.getPaymentStatus()))
                .filter(s -> s.getExpiryDate() != null)
                .sorted((s1, s2) -> {
                    if (s1.getPaymentDate() == null && s2.getPaymentDate() == null) return 0;
                    if (s1.getPaymentDate() == null) return 1;
                    if (s2.getPaymentDate() == null) return -1;
                    return s2.getPaymentDate().compareTo(s1.getPaymentDate());
                })
                .findFirst();

        if (activeSub.isPresent()) {
            VendorSubscription s = activeSub.get();
            
            // Perform dynamic expiration update if past expiryDate
            if (s.getExpiryDate().isBefore(LocalDate.now())) {
                s.setStatus("EXPIRED");
                s.setPaymentStatus("EXPIRED");
                subscriptionRepository.save(s);
                
                return Map.of(
                        "active", false,
                        "status", "EXPIRED",
                        "planName", s.getPlanName(),
                        "planType", s.getPlanType() != null ? s.getPlanType() : "BASIC",
                        "expiryDate", s.getExpiryDate().toString(),
                        "daysRemaining", 0,
                        "subscription", s
                );
            }
            
            // Active subscription
            long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), s.getExpiryDate());
            if (s.getStatus() == null || !"ACTIVE".equalsIgnoreCase(s.getStatus())) {
                s.setStatus("ACTIVE");
                subscriptionRepository.save(s);
            }
            
            return Map.of(
                    "active", true,
                    "status", "ACTIVE",
                    "planName", s.getPlanName(),
                    "planType", s.getPlanType() != null ? s.getPlanType() : "BASIC",
                    "expiryDate", s.getExpiryDate().toString(),
                    "daysRemaining", daysRemaining,
                    "subscription", s
            );
        }

        // 2. Check if there is a pending subscription
        Optional<VendorSubscription> pendingSub = subs.stream()
                .filter(s -> "PENDING".equalsIgnoreCase(s.getPaymentStatus()))
                .sorted((s1, s2) -> {
                    if (s1.getPaymentDate() == null && s2.getPaymentDate() == null) return 0;
                    if (s1.getPaymentDate() == null) return 1;
                    if (s2.getPaymentDate() == null) return -1;
                    return s2.getPaymentDate().compareTo(s1.getPaymentDate());
                })
                .findFirst();

        if (pendingSub.isPresent()) {
            VendorSubscription s = pendingSub.get();
            return Map.of(
                    "active", false,
                    "status", "PENDING",
                    "planName", s.getPlanName(),
                    "planType", s.getPlanType() != null ? s.getPlanType() : "BASIC",
                    "subscription", s
            );
        }

        // 3. Check if there is an expired subscription to return its info
        Optional<VendorSubscription> expiredSub = subs.stream()
                .filter(s -> "EXPIRED".equalsIgnoreCase(s.getStatus()) || "EXPIRED".equalsIgnoreCase(s.getPaymentStatus()))
                .sorted((s1, s2) -> {
                    if (s1.getPaymentDate() == null && s2.getPaymentDate() == null) return 0;
                    if (s1.getPaymentDate() == null) return 1;
                    if (s2.getPaymentDate() == null) return -1;
                    return s2.getPaymentDate().compareTo(s1.getPaymentDate());
                })
                .findFirst();
        if (expiredSub.isPresent()) {
            VendorSubscription s = expiredSub.get();
            return Map.of(
                    "active", false,
                    "status", "EXPIRED",
                    "planName", s.getPlanName(),
                    "planType", s.getPlanType() != null ? s.getPlanType() : "BASIC",
                    "expiryDate", s.getExpiryDate() != null ? s.getExpiryDate().toString() : "N/A",
                    "daysRemaining", 0,
                    "subscription", s
            );
        }

        return Map.of("active", false, "status", "NONE", "daysRemaining", 0);
    }

    // --- ADMIN PAYMENTS MANAGEMENT ---
    @GetMapping("/admin/payments")
    public List<Map<String, Object>> getSubscriptionPayments() {
        List<VendorSubscription> subs = subscriptionRepository.findAll();
        return subs.stream().map(s -> {
            String vendorName = "N/A";
            String businessName = "N/A";
            Optional<User> vendorOpt = userRepository.findById(s.getVendorId());
            if (vendorOpt.isPresent()) {
                vendorName = vendorOpt.get().getFullName();
                businessName = vendorOpt.get().getBusinessName() != null ? vendorOpt.get().getBusinessName() : "N/A";
            }
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", s.getId());
            map.put("vendorId", s.getVendorId());
            map.put("vendorName", vendorName);
            map.put("businessName", businessName);
            map.put("planName", s.getPlanName());
            map.put("amount", s.getAmount());
            map.put("paymentDate", s.getPaymentDate().toString());
            map.put("expiryDate", s.getExpiryDate() != null ? s.getExpiryDate().toString() : "N/A");
            map.put("paymentStatus", s.getPaymentStatus());
            map.put("transactionId", s.getTransactionId());
            map.put("status", s.getStatus() != null ? s.getStatus() : "ACTIVE");
            map.put("planType", s.getPlanType() != null ? s.getPlanType() : "BASIC");
            return map;
        }).toList();
    }

    @PutMapping("/admin/payments/{id}")
    public VendorSubscription updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status"); // APPROVED or REJECTED
        VendorSubscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription Log Not Found"));

        sub.setPaymentStatus(status.toUpperCase());
        
        if ("APPROVED".equalsIgnoreCase(status)) {
            SubscriptionPlan plan = planRepository.findById(sub.getPlanId())
                    .orElseThrow(() -> new RuntimeException("Plan Not Found"));
            
            // Set all other active subscriptions for this vendor to EXPIRED
            List<VendorSubscription> otherSubs = subscriptionRepository.findByVendorId(sub.getVendorId());
            for (VendorSubscription other : otherSubs) {
                if (!other.getId().equals(sub.getId()) && "ACTIVE".equalsIgnoreCase(other.getStatus())) {
                    other.setStatus("EXPIRED");
                    other.setPaymentStatus("EXPIRED");
                    subscriptionRepository.save(other);
                }
            }
            
            sub.setStatus("ACTIVE");
            sub.setExpiryDate(LocalDate.now().plusMonths(plan.getDuration()));
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            sub.setStatus("CANCELLED");
        }

        return subscriptionRepository.save(sub);
    }

    private void seedPlansIfEmpty() {
        if (planRepository.count() == 0) {
            planRepository.save(new SubscriptionPlan(null, "Monthly Plan", 1, 499.0, "Perfect for checking out our booking reach", "ACTIVE"));
            planRepository.save(new SubscriptionPlan(null, "Quarterly Plan (3 Months)", 3, 1299.0, "Great choice to start seasonal bookings", "ACTIVE"));
            planRepository.save(new SubscriptionPlan(null, "Half-Year Plan (6 Months)", 6, 2399.0, "Best value for regular stadium managers", "ACTIVE"));
            planRepository.save(new SubscriptionPlan(null, "Yearly Plan (12 Months)", 12, 4499.0, "Top-tier profile exposure & all-inclusive support", "ACTIVE"));
        }
    }
}