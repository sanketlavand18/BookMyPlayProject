package com.bookmyplay.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;

    private Long userId;

    private String userName;

    private Long venueId;

    private String venueName;

    private String city;

    private String imageUrl;

    private String categoryName;

    private LocalDate bookingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Double totalPrice;

    private String bookingStatus;

    private LocalDateTime createdAt;
}