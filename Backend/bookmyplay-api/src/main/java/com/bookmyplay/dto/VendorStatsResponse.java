package com.bookmyplay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorStatsResponse {
    private long totalVenues;
    private long totalBookings;
    private double totalEarnings;
    private long upcomingBookings;
}
