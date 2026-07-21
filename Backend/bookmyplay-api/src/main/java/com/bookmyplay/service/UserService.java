package com.bookmyplay.service;

import com.bookmyplay.dto.RegisterRequest;

public interface UserService {

    String register(RegisterRequest request);

}