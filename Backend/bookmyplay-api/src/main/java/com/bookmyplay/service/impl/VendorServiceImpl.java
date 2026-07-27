package com.bookmyplay.service.impl;

import com.bookmyplay.dto.VendorStatsResponse;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.BookingStatus;
import com.bookmyplay.repository.BookingRepository;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;

    @Override
    public VendorStatsResponse getVendorStats(Long vendorId) {
        // Count venues belonging to vendor
        long totalVenues = venueRepository.findByVendorId(vendorId).size();

        // Get bookings for vendor's venues
        List<Booking> bookings = bookingRepository.findByVenue_VendorId(vendorId);

        long totalBookings = bookings.size();

        // Sum earnings where status is CONFIRMED or COMPLETED
        double totalEarnings = bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED || b.getBookingStatus() == BookingStatus.COMPLETED)
                .mapToDouble(Booking::getTotalPrice)
                .sum();

        // Count upcoming bookings (status CONFIRMED or COMPLETED, and date >= today)
        LocalDate today = LocalDate.now();
        long upcomingBookings = bookings.stream()
                .filter(b -> (b.getBookingStatus() == BookingStatus.CONFIRMED || b.getBookingStatus() == BookingStatus.COMPLETED)
                        && !b.getBookingDate().isBefore(today))
                .count();

        return VendorStatsResponse.builder()
                .totalVenues(totalVenues)
                .totalBookings(totalBookings)
                .totalEarnings(totalEarnings)
                .upcomingBookings(upcomingBookings)
                .build();
    }
}
