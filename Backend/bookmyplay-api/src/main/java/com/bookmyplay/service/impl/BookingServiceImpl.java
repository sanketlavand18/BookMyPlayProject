package com.bookmyplay.service.impl;

import com.bookmyplay.dto.CreateBookingRequest;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.BookingStatus;
import com.bookmyplay.entity.User;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.repository.BookingRepository;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;

    @Override
    public String createBooking(CreateBookingRequest request) {

        // Step 1 : Check User

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        // Step 2 : Check Venue

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new RuntimeException("Venue Not Found"));

        // Step 3 : Calculate Price

        double totalPrice = venue.getPricePerHour();

        // Step 4 : Create Booking

        Booking booking = Booking.builder()
                .userId(user.getId())
                .venueId(venue.getId())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .totalPrice(totalPrice)
                .bookingStatus(BookingStatus.CONFIRMED)
                .createdAt(LocalDateTime.now())
                .build();

        bookingRepository.save(booking);

        return "Booking Successful";
    }

    @Override
    public List<Booking> getBookingsByUser(Long userId) {

        return bookingRepository.findByUserId(userId);

    }

}