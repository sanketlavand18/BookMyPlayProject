package com.bookmyplay.repository;

import com.bookmyplay.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    java.util.List<Payment> findByBookingId(Long bookingId);
    java.util.List<Payment> findByBookingIdIn(java.util.List<Long> bookingIds);
}
