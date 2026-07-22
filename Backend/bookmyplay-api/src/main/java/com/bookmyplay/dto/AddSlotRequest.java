package com.bookmyplay.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AddSlotRequest {

    private Long venueId;

    private LocalDate slotDate;

    private LocalTime startTime;

    private LocalTime endTime;
}