package com.tutorlms.backend.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResultResponse {
    private boolean success;
    private String message;
    private String orderCode;
    private String transactionNo;
}