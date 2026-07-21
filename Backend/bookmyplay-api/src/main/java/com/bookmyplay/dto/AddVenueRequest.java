package com.bookmyplay.dto;

import lombok.Data;

@Data
public class AddVenueRequest {

    private Long vendorId;
    private String venueName;
    private String sport;
    private String city;
    private String address;
    private String description;
    private Double pricePerHour;
    private String imageUrl;

}