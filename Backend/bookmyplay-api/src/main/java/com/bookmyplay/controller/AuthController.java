package com.bookmyplay.controller;

import com.bookmyplay.dto.LoginRequest;
import com.bookmyplay.dto.RegisterRequest;
import com.bookmyplay.entity.User;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {

        return userService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("User Not Found");
        }

        if (!user.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid Password");
        }

        return ResponseEntity.ok(user.get());

    }
}