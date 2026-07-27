package com.bookmyplay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueSearchDTO {
    private String venueName;
    private String city;
    private Long categoryId;
    private Double minPrice;
    private Double maxPrice;
    private Integer rating;
    private Boolean available;
}
