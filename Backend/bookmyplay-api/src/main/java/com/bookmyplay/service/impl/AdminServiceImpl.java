package com.bookmyplay.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bookmyplay.dto.AdminDashboardResponse;
import com.bookmyplay.dto.LoginRequest;
import com.bookmyplay.dto.LoginResponse;
import com.bookmyplay.entity.*;
import com.bookmyplay.repository.*;
import com.bookmyplay.service.AdminService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final SlotRepository slotRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AdminDashboardResponse getDashboard() {
        return new AdminDashboardResponse(
                userRepository.count(),
                venueRepository.count(),
                bookingRepository.count(),
                reviewRepository.count());
    }

    // Authentication
    @Override
    public LoginResponse loginAdmin(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid Admin Credentials");
        }

        User user = userOpt.get();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Access Denied: Not an Admin");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Admin Password");
        }

        return LoginResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }

    // User Management
    @Override
    public List<User> getAllUsers() {
        return userRepository.findByRole("USER");
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(Long id, User request) {
        User user = getUserById(id);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Vendor Management
    @Override
    public List<User> getAllVendors() {
        return userRepository.findByRole("VENDOR");
    }

    @Override
    public User getVendorById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    @Override
    public User updateVendor(Long id, User request) {
        User vendor = getVendorById(id);
        vendor.setFullName(request.getFullName());
        vendor.setPhone(request.getPhone());
        vendor.setEmail(request.getEmail());
        return userRepository.save(vendor);
    }

    @Override
    public void deleteVendor(Long id) {
        userRepository.deleteById(id);
    }

    // Venue Management
    @Override
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    @Override
    public Venue getVenueById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    @Override
    public Venue updateVenue(Long id, Venue request) {
        Venue venue = getVenueById(id);
        venue.setVenueName(request.getVenueName());
        venue.setCity(request.getCity());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        venue.setPricePerHour(request.getPricePerHour());
        return venueRepository.save(venue);
    }

    @Override
    @Transactional
    public void deleteVenue(Long id) {
        reviewRepository.deleteByVenueId(id);
        slotRepository.deleteByVenueId(id);
        bookingRepository.deleteByVenue_Id(id);
        venueRepository.deleteById(id);
    }

    // Category Management
    @Override
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category updateCategory(Long id, Category request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // Booking Management
    @Override
    public List<com.bookmyplay.dto.BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream().map(this::mapToBookingResponse).toList();
    }

    @Override
    public com.bookmyplay.dto.BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToBookingResponse(booking);
    }

    private com.bookmyplay.dto.BookingResponse mapToBookingResponse(Booking booking) {
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

        return com.bookmyplay.dto.BookingResponse.builder()
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
                .categoryName(booking.getVenue() != null && booking.getVenue().getCategory() != null
                        ? booking.getVenue().getCategory().getCategoryName()
                        : null)
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

    @Override
    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getSlot() != null) {
            Slot slot = booking.getSlot();
            slot.setIsBooked(false);
            slotRepository.save(slot);
        }
        bookingRepository.deleteById(id);
    }

    // Payment Management
    @Override
    public List<Payment> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        for (Payment p : payments) {
            bookingRepository.findById(p.getBookingId()).ifPresent(b -> {
                if (b.getUser() != null) {
                    p.setCustomerName(b.getUser().getFullName());
                }
                if (b.getVenue() != null) {
                    p.setVenueName(b.getVenue().getVenueName());
                    userRepository.findById(b.getVenue().getVendorId())
                            .ifPresent(v -> p.setVendorName(v.getFullName()));
                }
            });
        }
        return payments;
    }

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    // Review Management
    @Override
    public List<Review> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        for (Review r : reviews) {
            if (r.getUserId() != null) {
                userRepository.findById(r.getUserId()).ifPresent(u -> r.setUserName(u.getFullName()));
            }
            if (r.getVenue() != null) {
                r.setVenueName(r.getVenue().getVenueName());
            }
        }
        return reviews;
    }

    @Override
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}