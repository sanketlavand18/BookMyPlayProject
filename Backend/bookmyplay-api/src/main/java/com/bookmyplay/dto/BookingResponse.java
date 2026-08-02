package com.bookmyplay.dto;

import lombok.*;
import com.bookmyplay.entity.Booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;

    private Long userId;
    private String userName;

    private Long venueId;
    private String venueName;
    private String city;
    private String imageUrl;
    private String categoryName;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private Double totalPrice;
    private Double originalAmount;
    private Double discountAmount;
    private String couponCode;
    private Double finalAmountPaid;

    private String bookingStatus;
    private LocalDateTime createdAt;

    private Long slotId;

    @Builder.Default
    private Boolean isReviewed = false;

    private Long reviewId;

    // Customer Info
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Vendor Info
    private Long vendorId;
    private String vendorName;

    // Payment Info
    private String paymentStatus;
    private String transactionId;

    public static BookingResponse from(Booking booking) {

        String customerName = "N/A";
        String customerEmail = "N/A";
        String customerPhone = "N/A";

        if (booking.getUser() != null) {
            customerName = booking.getUser().getFullName();
            customerEmail = booking.getUser().getEmail();
            customerPhone = booking.getUser().getPhone();
        }

        Long vendorId = null;
        if (booking.getVenue() != null) {
            vendorId = booking.getVenue().getVendorId();
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userName(customerName)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)

                .venueId(booking.getVenue() != null ? booking.getVenue().getId() : null)
                .venueName(booking.getVenue() != null ? booking.getVenue().getVenueName() : null)
                .city(booking.getVenue() != null ? booking.getVenue().getCity() : null)
                .imageUrl(booking.getVenue() != null ? booking.getVenue().getImageUrl() : null)

                .categoryName(
                        booking.getVenue() != null
                                && booking.getVenue().getCategory() != null
                                        ? booking.getVenue().getCategory().getCategoryName()
                                        : null)

                .slotId(booking.getSlot() != null ? booking.getSlot().getId() : null)

                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())

                .totalPrice(booking.getTotalPrice())
                .originalAmount(booking.getOriginalAmount())
                .discountAmount(booking.getDiscountAmount())
                .couponCode(booking.getCouponCode())
                .finalAmountPaid(booking.getFinalAmountPaid())

                .bookingStatus(booking.getBookingStatus() != null
                        ? booking.getBookingStatus().name()
                        : null)

                .createdAt(booking.getCreatedAt())

                .vendorId(vendorId)
                .vendorName("N/A")

                .paymentStatus("PENDING")
                .transactionId("N/A")

                .build();
    }
}