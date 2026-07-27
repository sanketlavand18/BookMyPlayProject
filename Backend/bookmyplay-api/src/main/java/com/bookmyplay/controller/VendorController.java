package com.bookmyplay.controller;

import com.bookmyplay.dto.VendorStatsResponse;
import com.bookmyplay.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VendorController {

    private final VendorService vendorService;

    @GetMapping("/{vendorId}/stats")
    public ResponseEntity<VendorStatsResponse> getStats(@PathVariable Long vendorId) {
        return ResponseEntity.ok(vendorService.getVendorStats(vendorId));
    }
}
