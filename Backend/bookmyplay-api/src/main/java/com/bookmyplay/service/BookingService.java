package com.bookmyplay.service;

import com.bookmyplay.dto.CreateBookingRequest;
import com.bookmyplay.entity.Booking;

import java.util.List;

public interface BookingService {

    String createBooking(CreateBookingRequest request);

    List<Booking> getBookingsByUser(Long userId);

}