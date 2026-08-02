package com.bookmyplay.repository.spec;

import com.bookmyplay.dto.VenueSearchDTO;
import com.bookmyplay.entity.Review;
import com.bookmyplay.entity.Slot;
import com.bookmyplay.entity.Venue;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class VenueSpecification {

    public static Specification<Venue> filterByCriteria(VenueSearchDTO searchDTO) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (searchDTO.getVenueName() != null && !searchDTO.getVenueName().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("venueName")),
                        "%" + searchDTO.getVenueName().toLowerCase() + "%"
                ));
            }

            if (searchDTO.getCity() != null && !searchDTO.getCity().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("city")),
                        searchDTO.getCity().toLowerCase()
                ));
            }

            if (searchDTO.getCategoryId() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("category").get("id"),
                        searchDTO.getCategoryId()
                ));
            }

            if (searchDTO.getMinPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("pricePerHour"),
                        searchDTO.getMinPrice()
                ));
            }

            if (searchDTO.getMaxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("pricePerHour"),
                        searchDTO.getMaxPrice()
                ));
            }

            // Filter by rating (average review rating >= selected)
            if (searchDTO.getRating() != null) {
                Subquery<Double> avgSubquery = query.subquery(Double.class);
                Root<Review> reviewRoot = avgSubquery.from(Review.class);
                avgSubquery.select(criteriaBuilder.avg(reviewRoot.get("rating")));
                avgSubquery.where(criteriaBuilder.equal(reviewRoot.get("venue"), root));
                
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        avgSubquery,
                        searchDTO.getRating().doubleValue()
                ));
            }

            // Filter by available slots (has at least one slot isBooked = false)
            if (searchDTO.getAvailable() != null && searchDTO.getAvailable()) {
                Subquery<Long> slotSubquery = query.subquery(Long.class);
                Root<Slot> slotRoot = slotSubquery.from(Slot.class);
                slotSubquery.select(criteriaBuilder.count(slotRoot));
                slotSubquery.where(
                        criteriaBuilder.equal(slotRoot.get("venueId"), root.get("id")),
                        criteriaBuilder.equal(slotRoot.get("isBooked"), false)
                );
                predicates.add(criteriaBuilder.greaterThan(slotSubquery, 0L));
            }
            predicates.add(criteriaBuilder.or(
                    criteriaBuilder.equal(root.get("status"), "APPROVED"),
                    criteriaBuilder.isNull(root.get("status"))
            ));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
