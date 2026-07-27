package com.bookmyplay.service;

import com.bookmyplay.dto.BookingResponse;
import com.bookmyplay.dto.CreateBookingRequest;
import java.util.List;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    List<BookingResponse> getBookingsByUser(Long userId);

    String cancelBooking(Long bookingId);

    BookingResponse getBookingById(Long bookingId);

    String rescheduleBooking(Long bookingId, Long newSlotId);

    List<BookingResponse> getBookingsByVendor(Long vendorId);
}