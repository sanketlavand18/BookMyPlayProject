package com.bookmyplay.dto;

import lombok.Data;

@Data
public class AddVenueRequest {

    private Long vendorId;

    private String venueName;

    private Long categoryId;

    private String city;

    private String address;

    private String description;

    private Double pricePerHour;

    private String imageUrl;

    private Double latitude;

    private Double longitude;

    private String state;

    private String country;

    private String postalCode;

    private String openTime;

    private String closeTime;

    private Integer slotDuration;

    private String status;
}