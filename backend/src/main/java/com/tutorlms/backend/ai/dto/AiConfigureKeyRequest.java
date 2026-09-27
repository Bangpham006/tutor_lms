package com.tutorlms.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiConfigureKeyRequest {
    @NotBlank(message = "API Key không được để trống")
    private String apiKey;

    private String baseUrl;
    private String model;
}
