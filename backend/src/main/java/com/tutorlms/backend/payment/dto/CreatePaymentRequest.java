package com.tutorlms.backend.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "courseId khong duoc de trong")
    private UUID courseId;
}