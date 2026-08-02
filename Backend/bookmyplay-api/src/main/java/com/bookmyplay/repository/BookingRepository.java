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

    @Query("""
                SELECT b
                FROM Booking b
                LEFT JOIN FETCH b.user
                LEFT JOIN FETCH b.venue v
                LEFT JOIN FETCH v.category
                LEFT JOIN FETCH b.slot
                WHERE v.vendorId = :vendorId
            """)
    List<Booking> findByVenue_VendorId(@Param("vendorId") Long vendorId);

    void deleteByVenue_Id(Long venueId);

    @Query("""
                SELECT b
                FROM Booking b
                LEFT JOIN FETCH b.user
                LEFT JOIN FETCH b.venue v
                LEFT JOIN FETCH v.category
                LEFT JOIN FETCH b.slot
            """)
    List<Booking> findAllWithAssociations();

    @Query("""
                SELECT b
                FROM Booking b
                LEFT JOIN FETCH b.user
                LEFT JOIN FETCH b.venue v
                LEFT JOIN FETCH v.category
                LEFT JOIN FETCH b.slot
                WHERE b.id = :id
            """)
    java.util.Optional<Booking> findByIdWithAssociations(@Param("id") Long id);

    @Query("""
                SELECT b
                FROM Booking b
                LEFT JOIN FETCH b.user
                LEFT JOIN FETCH b.venue v
                LEFT JOIN FETCH v.category
                LEFT JOIN FETCH b.slot
                WHERE b.id IN :ids
            """)
    List<Booking> findAllByIdsWithAssociations(@Param("ids") List<Long> ids);
}