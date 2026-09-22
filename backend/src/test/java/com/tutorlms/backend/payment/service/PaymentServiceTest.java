package com.tutorlms.backend.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.BadRequestException;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private CourseEnrollmentRepository enrollmentRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private VnPayService vnPayService;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks
    private PaymentService paymentService;

    private User student;
    private Course paidCourse;
    private Course freeCourse;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(UUID.randomUUID())
                .phone("0901234567")
                .fullName("Nguyen Van A")
                .role("ROLE_STUDENT")
                .build();

        paidCourse = Course.builder()
                .id(UUID.randomUUID())
                .title("Khoa hoc Java Spring Boot")
                .price(BigDecimal.valueOf(200000))
                .build();

        freeCourse = Course.builder()
                .id(UUID.randomUUID())
                .title("Khoa hoc Git Co Ban")
                .price(BigDecimal.ZERO)
                .build();
    }

    @Test
    @DisplayName("createPayment khoa hoc mien phi -> tu dong enroll khong can redirect")
    void createPayment_freeCourse_autoEnrolls() {
        when(courseRepository.findById(freeCourse.getId())).thenReturn(Optional.of(freeCourse));
        when(enrollmentRepository.existsByCourse_IdAndStudent_Id(freeCourse.getId(), student.getId()))
                .thenReturn(false);

        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setCourseId(freeCourse.getId());

        CreatePaymentResponse res = paymentService.createPayment(student, req, "127.0.0.1");

        assertThat(res.isFree()).isTrue();
        assertThat(res.getStatus()).isEqualTo("SUCCESS");
        assertThat(res.getPaymentUrl()).isNull();
        verify(enrollmentRepository).save(any(CourseEnrollment.class));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("createPayment khoa hoc co phi -> tao Order va tra ve paymentUrl")
    void createPayment_paidCourse_returnsPaymentUrl() {
        when(courseRepository.findById(paidCourse.getId())).thenReturn(Optional.of(paidCourse));
        when(enrollmentRepository.existsByCourse_IdAndStudent_Id(paidCourse.getId(), student.getId()))
                .thenReturn(false);
        when(vnPayService.generateOrderCode()).thenReturn("ORDER_TEST_001");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });
        when(vnPayService.buildPaymentUrl(any(Order.class), eq("127.0.0.1"), anyString()))
                .thenReturn("https://sandbox.vnpay.vn/paymentv2/vpcpay.html?order=1");

        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setCourseId(paidCourse.getId());

        CreatePaymentResponse res = paymentService.createPayment(student, req, "127.0.0.1");

        assertThat(res.isFree()).isFalse();
        assertThat(res.getStatus()).isEqualTo("PENDING");
        assertThat(res.getPaymentUrl()).contains("https://sandbox.vnpay.vn");
        assertThat(res.getOrderCode()).isEqualTo("ORDER_TEST_001");
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("createPayment hoc vien da dang ky roi -> nem loi BadRequestException")
    void createPayment_alreadyEnrolled_throwsBadRequest() {
        when(courseRepository.findById(paidCourse.getId())).thenReturn(Optional.of(paidCourse));
        when(enrollmentRepository.existsByCourse_IdAndStudent_Id(paidCourse.getId(), student.getId()))
                .thenReturn(true);

        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setCourseId(paidCourse.getId());

        assertThatThrownBy(() -> paymentService.createPayment(student, req, "127.0.0.1"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("handleIpn thanh toan thanh cong 00 -> Order SUCCESS + kich hoat CourseEnrollment")
    void handleIpn_paymentSuccess_activatesEnrollment() {
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .orderCode("ORDER_SUCCESS_01")
                .student(student)
                .course(paidCourse)
                .amount(BigDecimal.valueOf(200000))
                .status(Order.Status.PENDING)
                .build();

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "ORDER_SUCCESS_01");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "14000123");
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_Amount", "20000000");
        params.put("vnp_SecureHash", "VALID_HASH");

        when(vnPayService.verifySignature(params)).thenReturn(true);
        when(orderRepository.findByOrderCode("ORDER_SUCCESS_01")).thenReturn(Optional.of(order));
        when(enrollmentRepository.existsByCourse_IdAndStudent_Id(paidCourse.getId(), student.getId()))
                .thenReturn(false);

        String rspCode = paymentService.handleIpn(params);

        assertThat(rspCode).isEqualTo("00");
        assertThat(order.getStatus()).isEqualTo(Order.Status.SUCCESS);
        verify(orderRepository).save(order);
        verify(enrollmentRepository).save(any(CourseEnrollment.class));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("handleIpn chu ky khong hop le -> tra ve 97, khong update order")
    void handleIpn_invalidSignature_returns97() {
        Map<String, String> params = Map.of("vnp_SecureHash", "INVALID");
        when(vnPayService.verifySignature(params)).thenReturn(false);

        String rspCode = paymentService.handleIpn(params);

        assertThat(rspCode).isEqualTo("97");
        verify(orderRepository, never()).save(any());
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("handleReturn hop le va thanh cong -> tra ve success = true")
    void handleReturn_success() {
        Map<String, String> params = Map.of(
                "vnp_ResponseCode", "00",
                "vnp_TxnRef", "ORDER_01",
                "vnp_TransactionNo", "TXN_01"
        );
        when(vnPayService.verifySignature(params)).thenReturn(true);

        PaymentResultResponse res = paymentService.handleReturn(params);

        assertThat(res.isSuccess()).isTrue();
        assertThat(res.getOrderCode()).isEqualTo("ORDER_01");
    }
}