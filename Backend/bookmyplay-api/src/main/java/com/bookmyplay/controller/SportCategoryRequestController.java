package com.bookmyplay.controller;

import com.bookmyplay.dto.SportCategoryRequestDto;
import com.bookmyplay.entity.SportCategoryRequest;
import com.bookmyplay.entity.User;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.service.SportCategoryRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SportCategoryRequestController {

    private final SportCategoryRequestService requestService;
    private final UserRepository userRepository;

    // --- VENDOR ENDPOINTS ---
    @PostMapping("/vendor/sport-requests")
    public ResponseEntity<?> createRequest(@RequestParam Long vendorId, @RequestBody SportCategoryRequestDto requestDto) {
        User user = userRepository.findById(vendorId).orElse(null);
        if (user == null || !"VENDOR".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only vendors are authorized to create category requests.");
        }
        try {
            SportCategoryRequest request = requestService.createRequest(vendorId, requestDto);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vendor/sport-requests")
    public ResponseEntity<?> getRequestsByVendor(@RequestParam Long vendorId) {
        User user = userRepository.findById(vendorId).orElse(null);
        if (user == null || !"VENDOR".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only vendors are authorized to view category requests.");
        }
        try {
            List<SportCategoryRequest> requests = requestService.getRequestsByVendor(vendorId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ADMIN ENDPOINTS ---
    @GetMapping("/admin/sport-requests")
    public ResponseEntity<?> getPendingRequests(@RequestParam Long adminId) {
        User user = userRepository.findById(adminId).orElse(null);
        if (user == null || !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators are authorized to view pending category requests.");
        }
        try {
            List<SportCategoryRequest> requests = requestService.getPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/admin/sport-requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestParam Long adminId) {
        User user = userRepository.findById(adminId).orElse(null);
        if (user == null || !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators are authorized to approve category requests.");
        }
        try {
            SportCategoryRequest request = requestService.approveRequest(id);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/admin/sport-requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestParam Long adminId) {
        User user = userRepository.findById(adminId).orElse(null);
        if (user == null || !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators are authorized to reject category requests.");
        }
        try {
            SportCategoryRequest request = requestService.rejectRequest(id);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
