package com.bookmyplay.repository;

import com.bookmyplay.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByVenueId(Long venueId);

    List<Booking> findByVenueIdAndBookingDate(
            Long venueId,
            LocalDate bookingDate);

}