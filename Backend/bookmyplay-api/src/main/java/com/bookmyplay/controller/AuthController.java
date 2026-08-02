package com.bookmyplay.controller;

import com.bookmyplay.dto.VerifyForgotPasswordRequest;
import com.bookmyplay.dto.ResetPasswordRequest;
import com.bookmyplay.dto.LoginRequest;
import com.bookmyplay.dto.RegisterRequest;
import com.bookmyplay.entity.User;
import com.bookmyplay.dto.LoginResponse;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String result = userService.register(request);
        if ("Registration Successful".equalsIgnoreCase(result)) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("User Not Found");
        }

        if (Boolean.TRUE.equals(user.get().getIsBlocked())) {
            return ResponseEntity.badRequest().body("Your account has been blocked by the Administrator.");
        }

        if (Boolean.TRUE.equals(user.get().getIsBlocked())) {
            return ResponseEntity.badRequest().body("Your account has been blocked by the Administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
            return ResponseEntity.badRequest().body("Invalid Password");
        }

        User loggedInUser = user.get();

        LoginResponse response = LoginResponse.builder()
                .id(loggedInUser.getId())
                .fullName(loggedInUser.getFullName())
                .email(loggedInUser.getEmail())
                .phone(loggedInUser.getPhone())
                .role(loggedInUser.getRole())
                .profilePicture(loggedInUser.getProfilePicture())
                .address(loggedInUser.getAddress())
                .city(loggedInUser.getCity())
                .build();

        return ResponseEntity.ok(response);

    }

    @PostMapping("/verify-forgot-password")
    public ResponseEntity<?> verifyForgotPassword(@Valid @RequestBody VerifyForgotPasswordRequest request) {
        try {
            userService.verifyForgotPassword(request.getEmail(), request.getEnteredCaptcha(), request.getGeneratedCaptcha());
            return ResponseEntity.ok("Verification successful");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getEmail(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}