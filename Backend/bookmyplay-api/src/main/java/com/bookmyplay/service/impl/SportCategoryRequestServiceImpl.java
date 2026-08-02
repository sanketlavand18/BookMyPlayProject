package com.bookmyplay.service.impl;

import com.bookmyplay.entity.Category;
import com.bookmyplay.entity.Notification;
import com.bookmyplay.entity.SportCategoryRequest;
import com.bookmyplay.dto.SportCategoryRequestDto;
import com.bookmyplay.repository.CategoryRepository;
import com.bookmyplay.repository.NotificationRepository;
import com.bookmyplay.repository.SportCategoryRequestRepository;
import com.bookmyplay.service.SportCategoryRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SportCategoryRequestServiceImpl implements SportCategoryRequestService {

    private final SportCategoryRequestRepository requestRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public SportCategoryRequest createRequest(Long vendorId, SportCategoryRequestDto requestDto) {
        if (requestDto.getSportName() == null || requestDto.getSportName().trim().isEmpty()) {
            throw new RuntimeException("Sport name is required.");
        }

        String sportName = requestDto.getSportName().trim();

        // 1. Check if category already exists in approved categories
        categoryRepository.findByCategoryNameIgnoreCase(sportName)
            .ifPresent(c -> {
                throw new RuntimeException("This sport category already exists in the approved categories.");
            });

        // 2. Check if a duplicate request already exists (case insensitive)
        requestRepository.findBySportNameIgnoreCase(sportName)
            .ifPresent(r -> {
                throw new RuntimeException("A category request for this sport already exists with status: " + r.getStatus());
            });

        SportCategoryRequest request = SportCategoryRequest.builder()
                .sportName(sportName)
                .description(requestDto.getDescription())
                .requestedByVendorId(vendorId)
                .status("PENDING")
                .build();

        return requestRepository.save(request);
    }

    @Override
    public List<SportCategoryRequest> getRequestsByVendor(Long vendorId) {
        return requestRepository.findByRequestedByVendorIdOrderByCreatedAtDesc(vendorId);
    }

    @Override
    public List<SportCategoryRequest> getPendingRequests() {
        return requestRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    @Override
    @Transactional
    public SportCategoryRequest approveRequest(Long id) {
        SportCategoryRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sport category request not found"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new RuntimeException("Request has already been processed: " + request.getStatus());
        }

        // 1. Update status
        request.setStatus("APPROVED");
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);

        // 2. Automatically create new Category if not already present
        if (categoryRepository.findByCategoryNameIgnoreCase(request.getSportName()).isEmpty()) {
            Category category = new Category();
            category.setCategoryName(request.getSportName());
            category.setDescription(request.getDescription());
            category.setIcon("FaFutbol"); // default icon
            categoryRepository.save(category);
        }

        // 3. Send Notification to Vendor
        Notification notification = Notification.builder()
                .userId(request.getRequestedByVendorId())
                .title("Sport Request Approved")
                .message("Your sport category request '" + request.getSportName() + "' has been approved.")
                .type("SYSTEM")
                .status("UNREAD")
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return request;
    }

    @Override
    @Transactional
    public SportCategoryRequest rejectRequest(Long id) {
        SportCategoryRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sport category request not found"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new RuntimeException("Request has already been processed: " + request.getStatus());
        }

        // 1. Update status
        request.setStatus("REJECTED");
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);

        // 2. Send Notification to Vendor
        Notification notification = Notification.builder()
                .userId(request.getRequestedByVendorId())
                .title("Sport Request Rejected")
                .message("Your sport category request has been rejected.")
                .type("SYSTEM")
                .status("UNREAD")
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return request;
    }
}
