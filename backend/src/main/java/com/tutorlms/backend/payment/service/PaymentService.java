package com.tutorlms.backend.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.BadRequestException;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.entity.CourseEnrollment;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.course.repository.CourseRepository;
import com.tutorlms.backend.payment.dto.CreatePaymentRequest;
import com.tutorlms.backend.payment.dto.CreatePaymentResponse;
import com.tutorlms.backend.payment.dto.PaymentResultResponse;
import com.tutorlms.backend.payment.entity.Order;
import com.tutorlms.backend.payment.entity.Transaction;
import com.tutorlms.backend.payment.repository.OrderRepository;
import com.tutorlms.backend.payment.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final OrderRepository orderRepository;
    private final TransactionRepository transactionRepository;
    private final VnPayService vnPayService;
    private final ObjectMapper objectMapper;

    /**
     * NHIEM VU 2: Tao URL thanh toan VNPay.
     * - price = 0: tu dong enroll (mien phi), khong redirect.
     * - price > 0: tra ve paymentUrl de redirect sang VNPay.
     */
    @Transactional
    public CreatePaymentResponse createPayment(User student, CreatePaymentRequest req, String clientIp) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay khoa hoc"));

        if (enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId())) {
            throw new BadRequestException("Ban da dang ky khoa hoc nay roi");
        }

        BigDecimal price = course.getPrice() != null ? course.getPrice() : BigDecimal.ZERO;

        // Khoa hoc mien phi -> tu dong enroll
        if (price.compareTo(BigDecimal.ZERO) == 0) {
            enrollmentRepository.save(CourseEnrollment.builder()
                    .course(course).student(student).build());
            log.info("Free enrollment: student={} course={}", student.getId(), course.getId());
            return CreatePaymentResponse.builder()
                    .amount(BigDecimal.ZERO).free(true).status("SUCCESS").build();
        }

        // Tao Order
        Order order = orderRepository.save(Order.builder()
                .orderCode(vnPayService.generateOrderCode())
                .student(student).course(course).amount(price)
                .status(Order.Status.PENDING).build());

        String paymentUrl = vnPayService.buildPaymentUrl(
                order, clientIp, "Thanh toan khoa hoc: " + course.getTitle());

        log.info("Payment URL created: orderCode={} amount={}", order.getOrderCode(), price);
        return CreatePaymentResponse.builder()
                .orderId(order.getId()).orderCode(order.getOrderCode())
                .amount(price).free(false).paymentUrl(paymentUrl).status("PENDING").build();
    }

    /**
     * NHIEM VU 3: Xu ly IPN (server-to-server webhook) tu VNPay.
     * Day la noi chinh thuc cap nhat trang thai + kich hoat enrollment.
     * Response code theo chuan VNPay:
     *   "00" = da xu ly thanh cong
     *   "97" = chu ky sai (tampering)
     *   "01" = khong tim thay don hang
     *   "02" = don hang da xu ly roi
     */
    @Transactional
    public String handleIpn(Map<String, String> params) {
        // BUOC 1: Xac thuc chu ky so HMAC-SHA512
        if (!vnPayService.verifySignature(params)) {
            log.warn("VNPay IPN: INVALID SIGNATURE! Possible tampering attempt.");
            return "97";
        }

        String orderCode = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        // BUOC 2: Tim don hang
        Order order = orderRepository.findByOrderCode(orderCode).orElse(null);
        if (order == null) { log.warn("VNPay IPN: Order not found: {}", orderCode); return "01"; }
        if (order.getStatus() != Order.Status.PENDING) {
            log.info("VNPay IPN: Already processed: {}", orderCode); return "02";
        }

        // BUOC 3: Luu Transaction de audit (luu du lieu cho du thanh cong hay that bai)
        saveTransaction(order, params);

        // BUOC 4: Cap nhat trang thai va kich hoat enrollment
        if ("00".equals(responseCode)) {
            order.setStatus(Order.Status.SUCCESS);
            orderRepository.save(order);
            activateEnrollment(order);   // NHIEM VU 4
            log.info("Payment SUCCESS: orderCode={}", orderCode);
        } else {
            order.setStatus(Order.Status.FAILED);
            orderRepository.save(order);
            log.warn("Payment FAILED: orderCode={} code={}", orderCode, responseCode);
        }
        return "00";
    }

    /**
     * NHIEM VU 3: Xu ly Return URL (redirect sau khi nguoi dung hoan tat tren VNPay).
     * Chi hien thi ket qua cho user, KHONG cap nhat DB o day.
     */
    @Transactional(readOnly = true)
    public PaymentResultResponse handleReturn(Map<String, String> params) {
        if (!vnPayService.verifySignature(params)) {
            return PaymentResultResponse.builder().success(false)
                    .message("Chu ky khong hop le").build();
        }
        boolean success = "00".equals(params.get("vnp_ResponseCode"));
        return PaymentResultResponse.builder()
                .success(success)
                .message(success ? "Thanh toan thanh cong!" :
                        "Thanh toan that bai (Ma loi: " + params.get("vnp_ResponseCode") + ")")
                .orderCode(params.get("vnp_TxnRef"))
                .transactionNo(params.get("vnp_TransactionNo"))
                .build();
    }

    /**
     * NHIEM VU 4: Tu dong tao CourseEnrollment sau khi VNPay xac nhan thanh cong.
     * Idempotent: bo qua neu da enroll roi.
     */
    private void activateEnrollment(Order order) {
        if (!enrollmentRepository.existsByCourse_IdAndStudent_Id(
                order.getCourse().getId(), order.getStudent().getId())) {
            enrollmentRepository.save(CourseEnrollment.builder()
                    .course(order.getCourse()).student(order.getStudent()).build());
            log.info("Enrollment activated: student={} course={}",
                    order.getStudent().getId(), order.getCourse().getId());
        }
    }

    private void saveTransaction(Order order, Map<String, String> p) {
        try {
            transactionRepository.save(Transaction.builder()
                    .order(order)
                    .vnpTxnRef(p.get("vnp_TxnRef"))
                    .vnpTransactionNo(p.get("vnp_TransactionNo"))
                    .vnpBankCode(p.get("vnp_BankCode"))
                    .vnpResponseCode(p.get("vnp_ResponseCode"))
                    .vnpAmount(Long.parseLong(p.getOrDefault("vnp_Amount", "0")))
                    .vnpSecureHash(p.get("vnp_SecureHash"))
                    .rawResponse(objectMapper.writeValueAsString(p))
                    .build());
        } catch (Exception e) {
            log.error("Failed to save transaction audit record", e);
        }
    }
}