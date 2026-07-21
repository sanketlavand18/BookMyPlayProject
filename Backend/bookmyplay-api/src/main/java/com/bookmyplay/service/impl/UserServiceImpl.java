package com.bookmyplay.service.impl;

import com.bookmyplay.dto.RegisterRequest;
import com.bookmyplay.entity.User;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public String register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists";
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        userRepository.save(user);

        return "Registration Successful";
    }
}