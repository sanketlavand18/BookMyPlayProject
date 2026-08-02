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

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentRepository paymentRepository;
    private final VendorSubscriptionRepository subscriptionRepository;
    private final SlotRepository slotRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AdminDashboardResponse getDashboard() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.stream().filter(u -> "USER".equalsIgnoreCase(u.getRole())).count();
        long totalVendors = allUsers.stream().filter(u -> "VENDOR".equalsIgnoreCase(u.getRole())).count();

        List<VendorSubscription> subs = subscriptionRepository.findAll();

        long activeVendors = allUsers.stream()
                .filter(u -> "VENDOR".equalsIgnoreCase(u.getRole()))
                .filter(u -> subs.stream()
                        .filter(s -> s.getVendorId().equals(u.getId())
                                && "APPROVED".equalsIgnoreCase(s.getPaymentStatus()))
                        .anyMatch(s -> s.getExpiryDate() != null
                                && !s.getExpiryDate().isBefore(java.time.LocalDate.now()))).count();

        long expiredVendors = totalVendors - activeVendors;

        long totalVenues = venueRepository.count();

        // Fetch all bookings with associations once to prevent LazyInitializationException and N+1 query issue
        List<Booking> bookings = bookingRepository.findAllWithAssociations();
        long totalBookings = bookings.size();

        java.time.LocalDate today = java.time.LocalDate.now();
        long todaysBookings = bookings.stream()
                .filter(b -> b.getBookingDate() != null && b.getBookingDate().equals(today))
                .count();

        double generalRevenue = bookings.stream()
                .filter(b -> b.getBookingStatus() != null && !"CANCELLED".equalsIgnoreCase(b.getBookingStatus().name()))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();

        double subRevenue = subs.stream()
                .filter(s -> "APPROVED".equalsIgnoreCase(s.getPaymentStatus()))
                .mapToDouble(s -> s.getAmount() != null ? s.getAmount() : 0.0)
                .sum();

        long pendingPayments = subs.stream()
                .filter(s -> "PENDING".equalsIgnoreCase(s.getPaymentStatus()))
                .count();

        long pendingVenueApprovals = venueRepository.findAll().stream()
                .filter(v -> "PENDING".equalsIgnoreCase(v.getStatus()) || v.getStatus() == null)
                .count();

        long monthlyBookings = bookings.stream()
                .filter(b -> b.getBookingDate() != null && b.getBookingDate().getMonth() == today.getMonth()
                        && b.getBookingDate().getYear() == today.getYear())
                .count();

        double platformCommission = 0.10 * generalRevenue;
        double platformRevenue = subRevenue + platformCommission;

        long totalReviews = reviewRepository.count();

        // 1. Calculate Monthly Platform Revenue and Booking Volume (Last 6 Months)
        List<java.time.LocalDate> last6Months = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            last6Months.add(today.minusMonths(i));
        }

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        List<AdminDashboardResponse.MonthlyRevenueDTO> monthlyRevenueList = new ArrayList<>();
        List<AdminDashboardResponse.MonthlyBookingDTO> monthlyBookingList = new ArrayList<>();

        for (java.time.LocalDate m : last6Months) {
            String monthName = m.format(monthFormatter);

            double commission = bookings.stream()
                    .filter(b -> b.getBookingDate() != null && b.getBookingDate().getMonth() == m.getMonth()
                            && b.getBookingDate().getYear() == m.getYear())
                    .filter(b -> b.getBookingStatus() != null
                            && !"CANCELLED".equalsIgnoreCase(b.getBookingStatus().name()))
                    .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() * 0.10 : 0.0)
                    .sum();

            double subAmt = subs.stream()
                    .filter(s -> "APPROVED".equalsIgnoreCase(s.getPaymentStatus()))
                    .filter(s -> s.getPaymentDate() != null && s.getPaymentDate().getMonth() == m.getMonth()
                            && s.getPaymentDate().getYear() == m.getYear())
                    .mapToDouble(s -> s.getAmount() != null ? s.getAmount() : 0.0)
                    .sum();

            double totalPlatformRev = commission + subAmt;
            monthlyRevenueList.add(new AdminDashboardResponse.MonthlyRevenueDTO(monthName, totalPlatformRev));

            long bookingCount = bookings.stream()
                    .filter(b -> b.getBookingDate() != null && b.getBookingDate().getMonth() == m.getMonth()
                            && b.getBookingDate().getYear() == m.getYear())
                    .filter(b -> b.getBookingStatus() != null
                            && !"CANCELLED".equalsIgnoreCase(b.getBookingStatus().name()))
                    .count();
            monthlyBookingList.add(new AdminDashboardResponse.MonthlyBookingDTO(monthName, bookingCount));
        }

        // 2. Most Booked Sports
        Map<String, Long> sportBookingsMap = bookings.stream()
                .filter(b -> b.getVenue() != null && b.getVenue().getCategory() != null && b.getBookingStatus() != null
                        && !"CANCELLED".equalsIgnoreCase(b.getBookingStatus().name()))
                .collect(Collectors.groupingBy(b -> b.getVenue().getCategory().getCategoryName(),
                        Collectors.counting()));

        long totalBookingsFiltered = sportBookingsMap.values().stream().mapToLong(Long::longValue).sum();
        List<AdminDashboardResponse.TopSportDTO> topSports = sportBookingsMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> {
                    double percentage = totalBookingsFiltered > 0 ? (entry.getValue() * 100.0) / totalBookingsFiltered
                            : 0.0;
                    return AdminDashboardResponse.TopSportDTO.builder()
                            .name(entry.getKey())
                            .bookings(entry.getValue())
                            .percentage(Math.round(percentage * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());

        String[] sportColors = { "#4f46e5", "#10b981", "#f59e0b", "#06b6d4" };
        for (int i = 0; i < topSports.size(); i++) {
            topSports.get(i).setColor(sportColors[i % sportColors.length]);
        }

        // 3. Top Performing Cities
        Map<String, Long> cityBookingsMap = bookings.stream()
                .filter(b -> b.getVenue() != null && b.getVenue().getCity() != null && b.getBookingStatus() != null
                        && "CONFIRMED".equalsIgnoreCase(b.getBookingStatus().name()))
                .collect(Collectors.groupingBy(b -> b.getVenue().getCity(), Collectors.counting()));

        long totalConfirmedBookings = cityBookingsMap.values().stream().mapToLong(Long::longValue).sum();
        List<AdminDashboardResponse.TopCityDTO> topCitiesList = cityBookingsMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> {
                    double percentage = totalConfirmedBookings > 0 ? (entry.getValue() * 100.0) / totalConfirmedBookings
                            : 0.0;
                    return AdminDashboardResponse.TopCityDTO.builder()
                            .name(entry.getKey())
                            .bookings(entry.getValue())
                            .percentage(Math.round(percentage * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());

        // 4. Top Vendors by Revenue
        Map<Long, List<Booking>> bookingsByVendor = bookings.stream()
                .filter(b -> b.getVenue() != null && b.getVenue().getVendorId() != null && b.getBookingStatus() != null
                        && !"CANCELLED".equalsIgnoreCase(b.getBookingStatus().name()))
                .collect(Collectors.groupingBy(b -> b.getVenue().getVendorId()));

        // Pre-populate vendor names from allUsers
        Map<Long, String> vendorNameMap = allUsers.stream()
                .filter(u -> "VENDOR".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toMap(User::getId, User::getFullName, (existing, replacement) -> existing));

        List<AdminDashboardResponse.TopVendorDTO> topVendorsList = bookingsByVendor.entrySet().stream()
                .map(entry -> {
                    Long vendorId = entry.getKey();
                    List<Booking> vendorBookingsList = entry.getValue();
                    double revenue = vendorBookingsList.stream()
                            .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                            .sum();
                    String vendorName = vendorNameMap.getOrDefault(vendorId, "Unknown Vendor");
                    return AdminDashboardResponse.TopVendorDTO.builder()
                            .name(vendorName)
                            .bookings(vendorBookingsList.size())
                            .revenue(revenue)
                            .build();
                })
                .sorted(Comparator.comparingDouble(AdminDashboardResponse.TopVendorDTO::getRevenue).reversed())
                .collect(Collectors.toList());

        double maxRevenue = topVendorsList.stream().mapToDouble(AdminDashboardResponse.TopVendorDTO::getRevenue).max()
                .orElse(0.0);
        for (AdminDashboardResponse.TopVendorDTO vendor : topVendorsList) {
            double percentage = maxRevenue > 0 ? (vendor.getRevenue() * 100.0) / maxRevenue : 0.0;
            vendor.setPercentage(Math.round(percentage * 10.0) / 10.0);
        }

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalVendors(totalVendors)
                .activeVendors(activeVendors)
                .expiredVendors(expiredVendors)
                .totalVenues(totalVenues)
                .totalBookings(totalBookings)
                .todaysBookings(todaysBookings)
                .monthlyBookings(monthlyBookings)
                .pendingVenueApprovals(pendingVenueApprovals)
                .totalRevenue(generalRevenue + subRevenue)
                .subscriptionRevenue(subRevenue)
                .platformRevenue(platformRevenue)
                .pendingPayments(pendingPayments)
                .totalReviews(totalReviews)
                .monthlyRevenue(monthlyRevenueList)
                .monthlyBookingsOverTime(monthlyBookingList)
                .topSports(topSports)
                .topCities(topCitiesList)
                .topVendorsList(topVendorsList)
                .build();
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
                .profilePicture(user.getProfilePicture())
                .address(user.getAddress())
                .city(user.getCity())
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
    @Transactional
    public List<com.bookmyplay.dto.BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllWithAssociations();

        List<User> vendors = userRepository.findByRole("VENDOR");
        Map<Long, String> vendorMap = vendors.stream()
                .collect(Collectors.toMap(User::getId, User::getFullName, (existing, replacement) -> existing));

        List<Payment> payments = paymentRepository.findAll();
        Map<Long, List<Payment>> paymentsByBookingId = payments.stream()
                .collect(Collectors.groupingBy(Payment::getBookingId));

        return bookings.stream()
                .map(b -> mapToBookingResponse(b, vendorMap, paymentsByBookingId))
                .toList();
    }

    @Override
    @Transactional
    public com.bookmyplay.dto.BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToBookingResponse(booking);
    }

    private com.bookmyplay.dto.BookingResponse mapToBookingResponse(Booking booking) {
        Map<Long, String> vendorMap = new java.util.HashMap<>();
        if (booking.getVenue() != null && booking.getVenue().getVendorId() != null) {
            userRepository.findById(booking.getVenue().getVendorId())
                    .ifPresent(v -> vendorMap.put(v.getId(), v.getFullName()));
        }
        List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
        Map<Long, List<Payment>> paymentsMap = Map.of(booking.getId(), payments);
        return mapToBookingResponse(booking, vendorMap, paymentsMap);
    }

    private com.bookmyplay.dto.BookingResponse mapToBookingResponse(
            Booking booking, 
            Map<Long, String> vendorMap, 
            Map<Long, List<Payment>> paymentsByBookingId) {
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
                vendorName = vendorMap.getOrDefault(vendorId, "N/A");
            }
        }

        String paymentStatus = "PENDING";
        String transactionId = "N/A";
        List<Payment> payments = paymentsByBookingId.get(booking.getId());
        if (payments != null && !payments.isEmpty()) {
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
    @Transactional
    public List<Payment> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        List<Long> bookingIds = payments.stream().map(Payment::getBookingId).distinct().toList();

        Map<Long, Booking> bookingsMap = new java.util.HashMap<>();
        Map<Long, String> vendorNameMap = new java.util.HashMap<>();

        if (!bookingIds.isEmpty()) {
            bookingRepository.findAllByIdsWithAssociations(bookingIds)
                .forEach(b -> bookingsMap.put(b.getId(), b));

            List<Long> vendorIds = bookingsMap.values().stream()
                .map(b -> b.getVenue() != null ? b.getVenue().getVendorId() : null)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

            if (!vendorIds.isEmpty()) {
                userRepository.findAllById(vendorIds)
                    .forEach(v -> vendorNameMap.put(v.getId(), v.getFullName()));
            }
        }

        for (Payment p : payments) {
            Booking b = bookingsMap.get(p.getBookingId());
            if (b != null) {
                if (b.getUser() != null) {
                    p.setCustomerName(b.getUser().getFullName());
                }
                if (b.getVenue() != null) {
                    p.setVenueName(b.getVenue().getVenueName());
                    String vendorName = vendorNameMap.get(b.getVenue().getVendorId());
                    if (vendorName != null) {
                        p.setVendorName(vendorName);
                    }
                }
            }
        }
        return payments;
    }

    @Override
    @Transactional
    public Payment getPaymentById(Long id) {
        Payment p = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        bookingRepository.findByIdWithAssociations(p.getBookingId()).ifPresent(b -> {
            if (b.getUser() != null) {
                p.setCustomerName(b.getUser().getFullName());
            }
            if (b.getVenue() != null) {
                p.setVenueName(b.getVenue().getVenueName());
                if (b.getVenue().getVendorId() != null) {
                    userRepository.findById(b.getVenue().getVendorId())
                            .ifPresent(v -> p.setVendorName(v.getFullName()));
                }
            }
        });
        return p;
    }

    // Review Management
    @Override
    @Transactional
    public List<Review> getAllReviews() {
        List<Review> reviews = reviewRepository.findAllWithVenue();
        List<Long> userIds = reviews.stream()
                .map(Review::getUserId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> userNameMap = new java.util.HashMap<>();
        if (!userIds.isEmpty()) {
            userRepository.findAllById(userIds)
                    .forEach(u -> userNameMap.put(u.getId(), u.getFullName()));
        }

        for (Review r : reviews) {
            if (r.getUserId() != null) {
                String userName = userNameMap.get(r.getUserId());
                if (userName != null) {
                    r.setUserName(userName);
                }
            }
            if (r.getVenue() != null) {
                r.setVenueName(r.getVenue().getVenueName());
            }
        }
        return reviews;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review != null) {
            Long venueId = review.getVenue() != null ? review.getVenue().getId() : null;
            reviewRepository.deleteById(id);
            if (venueId != null) {
                updateVenueRating(venueId);
            }
        }
    }

    private void updateVenueRating(Long venueId) {
        Venue venue = venueRepository.findById(venueId).orElse(null);
        if (venue == null)
            return;
        List<Review> reviews = reviewRepository.findByVenueId(venueId);
        double sum = 0.0;
        int count = 0;
        for (Review r : reviews) {
            if (r.getIsHidden() == null || !r.getIsHidden()) {
                sum += r.getRating();
                count++;
            }
        }
        if (count > 0) {
            venue.setAverageRating(Math.round((sum / count) * 10.0) / 10.0);
            venue.setTotalReviews(count);
        } else {
            venue.setAverageRating(0.0);
            venue.setTotalReviews(0);
        }
        venueRepository.save(venue);
    }
}
