package com.bookmyplay.service.impl;

import com.bookmyplay.dto.BookingResponse;
import com.bookmyplay.dto.CreateBookingRequest;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.BookingStatus;
import com.bookmyplay.entity.User;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.repository.BookingRepository;
import com.bookmyplay.repository.SlotRepository;
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
    private final SlotRepository slotRepository;

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
                .user(user)
                .venue(venue)
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
    public List<BookingResponse> getBookingsByUser(Long userId) {

        List<Booking> bookings = bookingRepository.findByUser_Id(userId);

        return bookings.stream().map(booking ->

        BookingResponse.builder()
                .id(booking.getId())

                .userId(booking.getUser().getId())
                .userName(booking.getUser().getFullName())

                .venueId(booking.getVenue().getId())
                .venueName(booking.getVenue().getVenueName())
                .city(booking.getVenue().getCity())
                .imageUrl(booking.getVenue().getImageUrl())
                .categoryName(booking.getVenue().getCategory().getCategoryName())

                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalPrice(booking.getTotalPrice())
                .bookingStatus(booking.getBookingStatus().name())
                .createdAt(booking.getCreatedAt())

                .build()

        ).toList();

    }

}