package com.bookmyplay.service.impl;

import com.bookmyplay.dto.RegisterRequest;
import com.bookmyplay.dto.UpdateUserRequest;
import com.bookmyplay.dto.ChangePasswordRequest;
import com.bookmyplay.entity.User;
import com.bookmyplay.entity.VendorSubscription;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.repository.VendorSubscriptionRepository;
import com.bookmyplay.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VendorSubscriptionRepository subscriptionRepository;


    @Override
    public String register(RegisterRequest request) {

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return "Password must be at least 6 characters long";
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists";
        }

        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            return "Phone number already exists";
        }

        String role = request.getRole();
        if (role == null || (!role.equalsIgnoreCase("USER") && !role.equalsIgnoreCase("VENDOR")
                && !role.equalsIgnoreCase("ADMIN"))) {
            return "Invalid role selected";
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role.toUpperCase())
                .build();

        User savedUser = userRepository.save(user);

        if ("VENDOR".equalsIgnoreCase(savedUser.getRole())) {
            createFreeTrialSubscription(savedUser.getId());
        }

        return "Registration Successful";
    }

    @Override
    public User updateProfile(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setProfilePicture(request.getProfilePicture());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setBusinessName(request.getBusinessName());
        return userRepository.save(user);
    }

    @Override
    public String changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return "Incorrect old password";
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return "Password changed successfully";
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void verifyForgotPassword(String email, String enteredCaptcha, String generatedCaptcha) {

        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        if (generatedCaptcha == null || enteredCaptcha == null
                || !generatedCaptcha.equalsIgnoreCase(enteredCaptcha)) {
            throw new RuntimeException("Invalid Captcha. Please try again.");
        }
    }

    @Override
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private void createFreeTrialSubscription(Long vendorId) {
        VendorSubscription trial = VendorSubscription.builder()
                .vendorId(vendorId)
                .planId(0L)
                .amount(0.0)
                .paymentDate(LocalDateTime.now())
                .expiryDate(LocalDate.now().plusDays(30))
                .paymentStatus("APPROVED")
                .transactionId("FREE_TRIAL_" + UUID.randomUUID().toString().substring(0, 8))
                .planName("Free Trial")
                .status("ACTIVE")
                .planType("FREE_TRIAL")
                .build();
        subscriptionRepository.save(trial);
    }

    @Override
    public User uploadProfileImage(Long id, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            String uploadDirPath = "C:/BookMyPlay/uploads/profiles/";
            java.io.File uploadDir = new java.io.File(uploadDirPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = "user-" + id + "-" + UUID.randomUUID().toString() + extension;
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDirPath + newFilename);
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String relativeUrl = "http://localhost:8080/uploads/profiles/" + newFilename;
            user.setProfilePicture(relativeUrl);
            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage());
        }
    }
}