package com.bookmyplay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bookmyplay.entity.SportCategoryRequest;
import java.util.List;
import java.util.Optional;

public interface SportCategoryRequestRepository extends JpaRepository<SportCategoryRequest, Long> {

    List<SportCategoryRequest> findByRequestedByVendorIdOrderByCreatedAtDesc(Long requestedByVendorId);

    List<SportCategoryRequest> findByStatusOrderByCreatedAtDesc(String status);

    Optional<SportCategoryRequest> findBySportNameIgnoreCase(String sportName);
}
