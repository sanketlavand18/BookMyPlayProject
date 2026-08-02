package com.bookmyplay.repository;

import com.bookmyplay.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("""
                SELECT b
                FROM Booking b
                JOIN FETCH b.user
                JOIN FETCH b.venue v
                LEFT JOIN FETCH v.category
                LEFT JOIN FETCH b.slot
                WHERE b.user.id = :userId
            """)
    List<Booking> findByUserId(@Param("userId") Long userId);

    List<Booking> findByVenue_IdAndBookingDate(
            Long venueId,
            LocalDate bookingDate);

    List<Booking> findByVenue_VendorId(Long vendorId);

    void deleteByVenue_Id(Long venueId);

}