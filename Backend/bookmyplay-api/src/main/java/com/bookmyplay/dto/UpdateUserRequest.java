package com.bookmyplay.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String fullName;
    private String phone;
    private String password;
    private String profilePicture;
    private String address;
    private String city;
    private String businessName;
}