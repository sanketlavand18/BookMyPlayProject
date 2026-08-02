package com.bookmyplay.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyForgotPasswordRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Captcha is required")
    private String enteredCaptcha;

    @NotBlank(message = "Generated captcha is required")
    private String generatedCaptcha;
}
