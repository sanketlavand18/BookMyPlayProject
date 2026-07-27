package com.bookmyplay.repository;

import com.bookmyplay.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser_Id(Long userId);

    List<Booking> findByVenue_Id(Long venueId);

    List<Booking> findByVenue_IdAndBookingDate(
            Long venueId,
            LocalDate bookingDate);

    List<Booking> findByVenue_VendorId(Long vendorId);

    void deleteByVenue_Id(Long venueId);

}