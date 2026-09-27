package com.tutorlms.backend.market.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketApplicationRequest {
    @NotBlank(message = "Lời giới thiệu ứng tuyển không được để trống")
    private String introduction;

    private String expectedRate;
    private String phoneContact;
}
