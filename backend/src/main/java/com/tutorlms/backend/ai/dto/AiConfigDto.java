package com.tutorlms.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiConfigDto {
    private boolean configured;
    private String baseUrl;
    private String model;
    private String maskedApiKey;
    private String provider;
}
