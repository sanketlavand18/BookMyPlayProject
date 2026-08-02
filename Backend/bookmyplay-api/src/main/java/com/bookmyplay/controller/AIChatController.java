package com.bookmyplay.controller;

import com.bookmyplay.dto.AIChatRequest;
import com.bookmyplay.dto.AIChatResponse;
import com.bookmyplay.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIChatController {

    private final AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(@RequestBody AIChatRequest request) {
        String reply = aiService.getAIChatResponse(request.getMessage());
        return ResponseEntity.ok(new AIChatResponse(reply));
    }
}
