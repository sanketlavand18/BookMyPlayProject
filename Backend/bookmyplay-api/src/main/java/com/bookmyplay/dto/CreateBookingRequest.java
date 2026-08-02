package com.bookmyplay.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateBookingRequest {

    private Long userId;

    private Long venueId;

    private LocalDate bookingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Long slotId;

    private String couponCode;

}