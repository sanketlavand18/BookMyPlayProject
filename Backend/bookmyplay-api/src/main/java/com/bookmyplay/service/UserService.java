package com.bookmyplay.service;

import com.bookmyplay.dto.RegisterRequest;
import com.bookmyplay.dto.UpdateUserRequest;
import com.bookmyplay.dto.ChangePasswordRequest;
import com.bookmyplay.entity.User;

public interface UserService {

    String register(RegisterRequest request);

    User updateProfile(Long id, UpdateUserRequest request);

    String changePassword(Long id, ChangePasswordRequest request);

    User getUserById(Long id);

}