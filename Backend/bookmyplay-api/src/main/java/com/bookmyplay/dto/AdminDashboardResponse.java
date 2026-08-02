package com.bookmyplay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalVendors;
    private long activeVendors;
    private long expiredVendors;
    private long totalVenues;
    private long totalBookings;
    private long todaysBookings;
    private double totalRevenue;
    private double subscriptionRevenue;
    private double platformRevenue;
    private long pendingVenueApprovals;
    private long monthlyBookings;
    private long pendingPayments;
    private long totalReviews;

    private List<MonthlyRevenueDTO> monthlyRevenue;
    private List<MonthlyBookingDTO> monthlyBookingsOverTime;
    private List<TopSportDTO> topSports;
    private List<TopCityDTO> topCities;
    private List<TopVendorDTO> topVendorsList;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MonthlyRevenueDTO {
        private String month;
        private double revenue;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MonthlyBookingDTO {
        private String month;
        private long bookings;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class TopSportDTO {
        private String name;
        private long bookings;
        private double percentage;
        private String color;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class TopCityDTO {
        private String name;
        private long bookings;
        private double percentage;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class TopVendorDTO {
        private String name;
        private double revenue;
        private long bookings;
        private double percentage;
    }
}