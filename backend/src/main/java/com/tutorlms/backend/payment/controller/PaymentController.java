package com.tutorlms.backend.payment.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.payment.dto.CreatePaymentRequest;
import com.tutorlms.backend.payment.dto.CreatePaymentResponse;
import com.tutorlms.backend.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * API tao URL thanh toan VNPay.
 * POST /api/v1/student/payment/create
 *   Body: { "courseId": "uuid" }
 *   Response: { "paymentUrl": "...", "free": false } hoac { "free": true, "status": "SUCCESS" }
 */
@RestController
@RequestMapping("/api/v1/student/payment")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<CreatePaymentResponse> createPayment(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        String clientIp = getClientIp(httpRequest);
        return ResponseEntity.ok(paymentService.createPayment(currentUser, request, clientIp));
    }

    private String getClientIp(HttpServletRequest req) {
        String ip = req.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) ip = req.getRemoteAddr();
        if (ip != null && ip.contains(",")) ip = ip.split(",")[0].trim();
        return ip != null ? ip : "127.0.0.1";
    }
}