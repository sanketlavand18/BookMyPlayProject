package com.bookmyplay.service.impl;

import com.bookmyplay.dto.BookingResponse;
import com.bookmyplay.dto.CreateBookingRequest;
import com.bookmyplay.entity.Booking;
import com.bookmyplay.entity.BookingStatus;
import com.bookmyplay.entity.Slot;
import com.bookmyplay.entity.User;
import com.bookmyplay.entity.Venue;
import com.bookmyplay.repository.BookingRepository;
import com.bookmyplay.repository.SlotRepository;
import com.bookmyplay.repository.UserRepository;
import com.bookmyplay.repository.VenueRepository;
import com.bookmyplay.service.BookingService;
import com.bookmyplay.entity.Payment;
import com.bookmyplay.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

        private final BookingRepository bookingRepository;
        private final UserRepository userRepository;
        private final VenueRepository venueRepository;
        private final SlotRepository slotRepository;
        private final PaymentRepository paymentRepository;

        @Override
        public BookingResponse createBooking(CreateBookingRequest request) {

                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new RuntimeException("User Not Found"));

                Venue venue = venueRepository.findById(request.getVenueId())
                                .orElseThrow(() -> new RuntimeException("Venue Not Found"));

                // Dynamically look up or create the Slot entity
                List<Slot> existingSlots = slotRepository.findByVenueId(request.getVenueId());
                Slot slot = existingSlots.stream()
                                .filter(s -> s.getSlotDate().equals(request.getBookingDate()) &&
                                                s.getStartTime().equals(request.getStartTime()) &&
                                                s.getEndTime().equals(request.getEndTime()))
                                .findFirst().orElse(null);

                if (slot != null && slot.getIsBooked()) {
                        throw new RuntimeException("Slot Already Booked");
                }

                if (slot == null) {
                        slot = new Slot();
                        slot.setVenueId(request.getVenueId());
                        slot.setSlotDate(request.getBookingDate());
                        slot.setStartTime(request.getStartTime());
                        slot.setEndTime(request.getEndTime());
                        slot.setIsBooked(true);
                        slot = slotRepository.save(slot);
                } else {
                        slot.setIsBooked(true);
                        slot = slotRepository.save(slot);
                }

                Booking booking = Booking.builder()
                                .user(user)
                                .venue(venue)
                                .slot(slot)
                                .bookingDate(slot.getSlotDate())
                                .startTime(slot.getStartTime())
                                .endTime(slot.getEndTime())
                                .totalPrice(venue.getPricePerHour())
                                .bookingStatus(BookingStatus.CONFIRMED)
                                .createdAt(LocalDateTime.now())
                                .build();

                Booking savedBooking = bookingRepository.save(booking);

                // Automatically create payment record
                Payment payment = Payment.builder()
                                .bookingId(savedBooking.getId())
                                .amount(savedBooking.getTotalPrice())
                                .paymentMethod("ONLINE")
                                .paymentStatus("SUCCESS")
                                .paymentId("PAY-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .transactionId("TXN-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .paymentDate(LocalDateTime.now())
                                .build();
                paymentRepository.save(payment);

                return mapToBookingResponse(savedBooking);
        }

        @Override
        public List<BookingResponse> getBookingsByUser(Long userId) {

                List<Booking> bookings = bookingRepository.findByUser_Id(userId);
                LocalDate today = LocalDate.now();

                return bookings.stream().map(booking -> {
                        if (booking.getBookingStatus() == BookingStatus.CONFIRMED && booking.getBookingDate().isBefore(today)) {
                                booking.setBookingStatus(BookingStatus.COMPLETED);
                                bookingRepository.save(booking);
                        }
                        return mapToBookingResponse(booking);
                }).toList();
        }

        @Override
        public List<BookingResponse> getBookingsByVendor(Long vendorId) {
                List<Booking> bookings = bookingRepository.findByVenue_VendorId(vendorId);
                LocalDate today = LocalDate.now();

                return bookings.stream().map(booking -> {
                        if (booking.getBookingStatus() == BookingStatus.CONFIRMED && booking.getBookingDate().isBefore(today)) {
                                booking.setBookingStatus(BookingStatus.COMPLETED);
                                bookingRepository.save(booking);
                        }
                        return mapToBookingResponse(booking);
                }).toList();
        }

        @Override
        public String cancelBooking(Long bookingId) {

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking Not Found"));

                if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
                        return "Booking Already Cancelled";
                }

                Slot slot = booking.getSlot();
                if (slot != null) {
                        slot.setIsBooked(false);
                        slotRepository.save(slot);
                }

                booking.setBookingStatus(BookingStatus.CANCELLED);
                bookingRepository.save(booking);

                // Try to find the associated payment and mark it as REFUNDED
                List<Payment> payments = paymentRepository.findByBookingId(bookingId);
                for (Payment p : payments) {
                        p.setPaymentStatus("REFUNDED");
                        paymentRepository.save(p);
                }

                return "Booking Cancelled Successfully";
        }

        @Override
        public BookingResponse getBookingById(Long bookingId) {
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking Not Found"));

                return mapToBookingResponse(booking);
        }

        @Override
        @org.springframework.transaction.annotation.Transactional
        public String rescheduleBooking(Long bookingId, Long newSlotId) {
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking Not Found"));

                if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
                        return "Cannot reschedule a cancelled booking";
                }

                Slot newSlot = slotRepository.findById(newSlotId)
                                .orElseThrow(() -> new RuntimeException("New Slot Not Found"));

                if (newSlot.getIsBooked()) {
                        return "New slot is already booked";
                }

                // Free old slot
                if (booking.getSlot() != null) {
                        Slot oldSlot = booking.getSlot();
                        oldSlot.setIsBooked(false);
                        slotRepository.save(oldSlot);
                }

                // Book new slot
                newSlot.setIsBooked(true);
                slotRepository.save(newSlot);

                // Update booking
                booking.setSlot(newSlot);
                booking.setBookingDate(newSlot.getSlotDate());
                booking.setStartTime(newSlot.getStartTime());
                booking.setEndTime(newSlot.getEndTime());
                bookingRepository.save(booking);

                return "Booking Rescheduled Successfully";
        }

        private BookingResponse mapToBookingResponse(Booking booking) {
                String customerName = "N/A";
                String customerEmail = "N/A";
                String customerPhone = "N/A";
                if (booking.getUser() != null) {
                        customerName = booking.getUser().getFullName();
                        customerEmail = booking.getUser().getEmail();
                        customerPhone = booking.getUser().getPhone();
                }

                Long vendorId = null;
                String vendorName = "N/A";
                if (booking.getVenue() != null) {
                        vendorId = booking.getVenue().getVendorId();
                        if (vendorId != null) {
                                User vendor = userRepository.findById(vendorId).orElse(null);
                                if (vendor != null) {
                                        vendorName = vendor.getFullName();
                                }
                        }
                }

                String paymentStatus = "PENDING";
                String transactionId = "N/A";
                List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
                if (!payments.isEmpty()) {
                        Payment p = payments.get(0);
                        paymentStatus = p.getPaymentStatus();
                        transactionId = p.getTransactionId();
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
                                .categoryName(booking.getVenue() != null && booking.getVenue().getCategory() != null ? booking.getVenue().getCategory().getCategoryName() : null)
                                .slotId(booking.getSlot() != null ? booking.getSlot().getId() : null)
                                .bookingDate(booking.getBookingDate())
                                .startTime(booking.getStartTime())
                                .endTime(booking.getEndTime())
                                .totalPrice(booking.getTotalPrice())
                                .bookingStatus(booking.getBookingStatus().name())
                                .createdAt(booking.getCreatedAt())
                                .vendorId(vendorId)
                                .vendorName(vendorName)
                                .paymentStatus(paymentStatus)
                                .transactionId(transactionId)
                                .build();
        }
}