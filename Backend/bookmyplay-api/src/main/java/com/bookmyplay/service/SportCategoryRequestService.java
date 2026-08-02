package com.bookmyplay.service;

import com.bookmyplay.entity.SportCategoryRequest;
import com.bookmyplay.dto.SportCategoryRequestDto;
import java.util.List;

public interface SportCategoryRequestService {
    SportCategoryRequest createRequest(Long vendorId, SportCategoryRequestDto requestDto);
    List<SportCategoryRequest> getRequestsByVendor(Long vendorId);
    List<SportCategoryRequest> getPendingRequests();
    SportCategoryRequest approveRequest(Long id);
    SportCategoryRequest rejectRequest(Long id);
}
