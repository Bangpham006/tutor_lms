package com.tutorlms.backend.payment.service;

import com.tutorlms.backend.payment.config.VnPayConfig;
import com.tutorlms.backend.payment.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xu ly VNPay: tao URL thanh toan va xac thuc chu ky so HMAC-SHA512.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayService {

    private final VnPayConfig config;

    /**
     * Tao URL chuyen huong den VNPay.
     * Tat ca params duoc sort theo thu tu alphabet truoc khi ky.
     */
    public String buildPaymentUrl(Order order, String ipAddress, String orderInfo) {
        String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        long amount = order.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

        // TreeMap tu dong sort key theo alphabet — bat buoc cua VNPay
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", config.getVersion());
        params.put("vnp_Command", config.getCommand());
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", config.getCurrencyCode());
        params.put("vnp_TxnRef", order.getOrderCode());
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", config.getOrderType());
        params.put("vnp_Locale", config.getLocale());
        params.put("vnp_ReturnUrl", config.getReturnUrl());
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", createDate);

        String signData = params.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));

        String secureHash = hmacSha512(config.getHashSecret(), signData);

        String queryString = params.entrySet().stream()
                .map(e -> encode(e.getKey()) + "=" + encode(e.getValue()))
                .collect(Collectors.joining("&"));

        return config.getPaymentUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    /**
     * Xac thuc chu ky so HMAC-SHA512 tu VNPay.
     * Dung MessageDigest.isEqual() de so sanh constant-time (chong timing attack).
     */
    public boolean verifySignature(Map<String, String> params) {
        String received = params.get("vnp_SecureHash");
        if (received == null || received.isBlank()) {
            log.warn("VNPay: Missing vnp_SecureHash");
            return false;
        }
        Map<String, String> signParams = new TreeMap<>(params);
        signParams.remove("vnp_SecureHash");
        signParams.remove("vnp_SecureHashType");

        String signData = signParams.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));

        String computed = hmacSha512(config.getHashSecret(), signData);
        return MessageDigest.isEqual(
                computed.getBytes(StandardCharsets.UTF_8),
                received.getBytes(StandardCharsets.UTF_8));
    }

    /** Tao ma don hang: yyyyMMddHHmmss + 6 ky tu random viet hoa */
    public String generateOrderCode() {
        String ts = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String rand = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return ts + rand;
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot compute HMAC-SHA512", e);
        }
    }

    private String encode(String v) {
        return URLEncoder.encode(v, StandardCharsets.UTF_8);
    }
}