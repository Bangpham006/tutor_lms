package com.tutorlms.backend.payment.service;

import com.tutorlms.backend.payment.config.VnPayConfig;
import com.tutorlms.backend.payment.entity.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class VnPayServiceTest {

    private VnPayConfig config;
    private VnPayService vnPayService;

    @BeforeEach
    void setUp() {
        config = new VnPayConfig();
        config.setTmnCode("TEST_TMN");
        config.setHashSecret("SECRET_KEY_12345678901234567890");
        config.setPaymentUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        config.setReturnUrl("http://localhost:8080/api/v1/payment/vnpay-return");
        config.setVersion("2.1.0");
        config.setCommand("pay");
        config.setCurrencyCode("VND");
        config.setLocale("vn");
        config.setOrderType("other");

        vnPayService = new VnPayService(config);
    }

    @Test
    @DisplayName("buildPaymentUrl tao URL hop le voi checksum")
    void buildPaymentUrl_createsValidUrlWithHash() {
        Order order = Order.builder()
                .orderCode("20260922120000ABCDEF")
                .amount(BigDecimal.valueOf(100000))
                .build();

        String url = vnPayService.buildPaymentUrl(order, "127.0.0.1", "Thanh toan khoa hoc");

        assertThat(url).startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?");
        assertThat(url).contains("vnp_TmnCode=TEST_TMN");
        assertThat(url).contains("vnp_Amount=10000000"); // 100000 * 100
        assertThat(url).contains("vnp_TxnRef=20260922120000ABCDEF");
        assertThat(url).contains("vnp_SecureHash=");
    }

    @Test
    @DisplayName("verifySignature xac nhan chu ky dung va phat hien chu ky sai")
    void verifySignature_validAndInvalid() {
        Order order = Order.builder()
                .orderCode("ORDER123")
                .amount(BigDecimal.valueOf(50000))
                .build();

        String url = vnPayService.buildPaymentUrl(order, "127.0.0.1", "Test Order");
        String queryString = url.substring(url.indexOf('?') + 1);

        Map<String, String> params = new HashMap<>();
        for (String pair : queryString.split("&")) {
            String[] kv = pair.split("=", 2);
            params.put(kv[0], kv.length > 1 ? java.net.URLDecoder.decode(kv[1], java.nio.charset.StandardCharsets.UTF_8) : "");
        }

        // Chu ky dung
        assertThat(vnPayService.verifySignature(params)).isTrue();

        // Bi sua doi tham so (tampering)
        params.put("vnp_Amount", "999999999");
        assertThat(vnPayService.verifySignature(params)).isFalse();

        // Thieu chu ky
        params.remove("vnp_SecureHash");
        assertThat(vnPayService.verifySignature(params)).isFalse();
    }

    @Test
    @DisplayName("generateOrderCode tao ma khong rong va duy nhat")
    void generateOrderCode_createsUniqueCode() {
        String code1 = vnPayService.generateOrderCode();
        String code2 = vnPayService.generateOrderCode();

        assertThat(code1).isNotEmpty();
        assertThat(code2).isNotEmpty();
        assertThat(code1).isNotEqualTo(code2);
    }
}