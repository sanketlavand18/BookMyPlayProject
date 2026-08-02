package com.bookmyplay.repository;

import com.bookmyplay.entity.VendorSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorSubscriptionRepository extends JpaRepository<VendorSubscription, Long> {
    List<VendorSubscription> findByVendorId(Long vendorId);
    List<VendorSubscription> findByPaymentStatus(String paymentStatus);
}