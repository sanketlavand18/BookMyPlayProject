package com.bookmyplay.service;

import com.bookmyplay.dto.VendorStatsResponse;

public interface VendorService {
    VendorStatsResponse getVendorStats(Long vendorId);
}
