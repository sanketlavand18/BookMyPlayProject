package com.bookmyplay.service.impl;

import com.bookmyplay.dto.RegisterRequest;
import com.bookmyplay.dto.UpdateUserRequest;
import com.bookmyplay.dto.ChangePasswordRequest;
import com.bookmyplay.entity.User;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
        if (role == null || (!role.equalsIgnoreCase("USER") && !role.equalsIgnoreCase("VENDOR") && !role.equalsIgnoreCase("ADMIN"))) {
            return "Invalid role selected";
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role.toUpperCase())
                .build();

        userRepository.save(user);

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
}