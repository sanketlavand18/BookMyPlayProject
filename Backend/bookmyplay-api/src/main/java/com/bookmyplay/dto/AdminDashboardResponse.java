package com.bookmyplay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalVenues;
    private long totalBookings;
    private long totalReviews;

}