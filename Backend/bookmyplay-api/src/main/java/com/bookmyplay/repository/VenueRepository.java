package com.bookmyplay.repository;

import com.bookmyplay.entity.Venue;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueRepository extends JpaRepository<Venue, Long>, JpaSpecificationExecutor<Venue> {
    List<Venue> findByVendorId(Long vendorId);

    @Query("SELECT v FROM Venue v WHERE " +
           "(:name IS NULL OR LOWER(v.venueName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:city IS NULL OR LOWER(v.city) = LOWER(:city)) AND " +
           "(:categoryId IS NULL OR v.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR v.pricePerHour >= :minPrice) AND " +
           "(:maxPrice IS NULL OR v.pricePerHour <= :maxPrice)")
    List<Venue> searchVenues(
            @Param("name") String name,
            @Param("city") String city,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice);
}