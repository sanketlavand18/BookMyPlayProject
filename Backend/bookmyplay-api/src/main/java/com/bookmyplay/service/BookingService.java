package com.bookmyplay.service;

import com.bookmyplay.dto.BookingResponse;
import com.bookmyplay.dto.CreateBookingRequest;
import java.util.List;

public interface BookingService {

    String createBooking(CreateBookingRequest request);

    List<BookingResponse> getBookingsByUser(Long userId);

}