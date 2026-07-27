package com.bookmyplay.controller;

import com.bookmyplay.dto.ChangePasswordRequest;
import com.bookmyplay.dto.UpdateUserRequest;
import com.bookmyplay.entity.User;
import com.bookmyplay.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // Parameter based endpoints for Task 10 requirements
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam Long userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfileQuery(@RequestParam Long userId, @RequestBody UpdateUserRequest request) {
        try {
            User updatedUser = userService.updateProfile(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePasswordQuery(@RequestParam Long userId, @RequestBody ChangePasswordRequest request) {
        try {
            String result = userService.changePassword(userId, request);
            if ("Password changed successfully".equals(result)) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Existing PathVariable based endpoints kept for backward compatibility
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        try {
            User updatedUser = userService.updateProfile(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        try {
            String result = userService.changePassword(id, request);
            if ("Password changed successfully".equals(result)) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
