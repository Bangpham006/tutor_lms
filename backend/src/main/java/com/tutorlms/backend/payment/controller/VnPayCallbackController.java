package com.tutorlms.backend.payment.controller;

import com.tutorlms.backend.payment.dto.PaymentResultResponse;
import com.tutorlms.backend.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Xu ly callback tu VNPay. Ca 2 endpoint PHAI la public (permitAll trong SecurityConfig).
 * Bao mat bang HMAC-SHA512 signature verification trong PaymentService.
 */
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class VnPayCallbackController {

    private final PaymentService paymentService;

    /**
     * IPN (Instant Payment Notification) -- server-to-server webhook.
     * VNPay goi endpoint nay de thong bao ket qua thanh toan (co the truoc khi redirect).
     * Tra ve { "RspCode": "00", "Message": "Confirm Success" } theo chuan VNPay.
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> handleIpn(
            @RequestParam Map<String, String> params) {
        log.info("VNPay IPN received: txnRef={}", params.get("vnp_TxnRef"));
        String code = paymentService.handleIpn(params);
        Map<String, String> resp = new HashMap<>();
        resp.put("RspCode", code);
        resp.put("Message", switch (code) {
            case "00" -> "Confirm Success";
            case "97" -> "Invalid Signature";
            case "01" -> "Order Not Found";
            case "02" -> "Order Already Updated";
            default -> "Unknown Error";
        });
        return ResponseEntity.ok(resp);
    }

    /**
     * Return URL -- VNPay redirect nguoi dung ve sau khi hoan tat.
     * Chi tra ket qua, KHONG cap nhat DB (IPN moi la nguon chinh thuc).
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<PaymentResultResponse> handleReturn(
            @RequestParam Map<String, String> params) {
        log.info("VNPay Return: txnRef={} code={}", params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"));
        return ResponseEntity.ok(paymentService.handleReturn(params));
    }
}