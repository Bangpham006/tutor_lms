package com.tutorlms.backend.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CreatePaymentResponse {
    private UUID orderId;
    private String orderCode;
    private BigDecimal amount;
    private boolean free;
    private String paymentUrl;
    private String status;
}