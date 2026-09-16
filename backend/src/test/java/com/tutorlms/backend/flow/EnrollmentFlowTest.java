package com.tutorlms.backend.flow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.auth.dto.LoginRequest;
import com.tutorlms.backend.auth.dto.RegisterRequest;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.auth.repository.UserRepository;
import com.tutorlms.backend.auth.service.JwtService;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Flow Test: Enrollment - Luong dang ky khoa hoc day du
 *
 * Kich ban:
 *   1. Tao tutor + khoa hoc
 *   2. Dang ky tai khoan student
 *   3. Dang nhap → nhan JWT
 *   4. Dang ky (enroll) khoa hoc
 *   5. Xem "my courses" → thay enrolledAt
 *   6. Xem chi tiet khoa hoc da enroll → thay day du (co fileUrl)
 *   7. Dang ky lai → idempotent (200 OK)
 *   8. Xem chi tiet khoa hoc chua enroll → 403
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Flow: Dang ky khoa hoc (Enrollment)")
class EnrollmentFlowTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private CourseRepository courseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private static String studentToken;
    private static String courseId;

    @BeforeEach
    void setUp() {
        // Tao tutor va khoa hoc test neu chua co
        if (courseId == null) {
            User tutor = userRepository.findByPhoneOrEmail("0909002001", "0909002001").orElseGet(() ->
                    userRepository.save(User.builder()
                            .phone("0909002001")
                            .fullName("Tutor Enrollment Test")
                            .role("TUTOR")
                            .password(passwordEncoder.encode("pass"))
                            .build())
            );
            Course course = courseRepository.save(Course.builder()
                    .title("Khoa hoc Enrollment Test")
                    .description("Khoa hoc de test luong dang ky")
                    .tutor(tutor)
                    .build());
            courseId = course.getId().toString();
        }
    }

    @Test
    @Order(1)
    @DisplayName("B1: Student dang ky tai khoan va dang nhap")
    void step1_studentRegistersAndLogsIn() throws Exception {
        // Dang ky
        RegisterRequest reg = new RegisterRequest();
        reg.setPhone("0901009001");
        reg.setEmail("student.enroll@example.com");
        reg.setFullName("Student Enroll Test");
        reg.setPassword("Password@123");
        reg.setRole("STUDENT");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        // Dang nhap
        LoginRequest login = new LoginRequest();
        login.setAccount("0901009001");
        login.setPassword("Password@123");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        studentToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
    }

    @Test
    @Order(2)
    @DisplayName("B2: Student xem marketplace truoc khi dang ky")
    void step2_viewMarketplaceBeforeEnroll() throws Exception {
        // Marketplace: khong can token
        mockMvc.perform(get("/api/v1/marketplace/courses/{id}", courseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Khoa hoc Enrollment Test"));
    }

    @Test
    @Order(3)
    @DisplayName("B3: Student chua enroll → xem detail → 403 Forbidden")
    void step3_notEnrolledDetail_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/student/courses/{id}/detail", courseId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(4)
    @DisplayName("B4: Student dang ky (enroll) khoa hoc → 200 OK")
    void step4_enrollCourse_success() throws Exception {
        mockMvc.perform(post("/api/v1/student/courses/{id}/enroll", courseId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(courseId));
    }

    @Test
    @Order(5)
    @DisplayName("B5: Dang ky lai (idempotent) → van 200 OK, khong bi loi")
    void step5_enrollAgain_idempotent() throws Exception {
        mockMvc.perform(post("/api/v1/student/courses/{id}/enroll", courseId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(6)
    @DisplayName("B6: Xem 'My Courses' → thay khoa hoc + enrolledAt")
    void step6_myEnrollments_showsEnrolledCourse() throws Exception {
        mockMvc.perform(get("/api/v1/student/courses/me")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].courseTitle").value("Khoa hoc Enrollment Test"))
                .andExpect(jsonPath("$[0].enrolledAt").isNotEmpty())
                .andExpect(jsonPath("$[0].enrollmentId").isNotEmpty());
    }

    @Test
    @Order(7)
    @DisplayName("B7: Student xem chi tiet khoa hoc da enroll → 200 OK")
    void step7_enrolledDetail_success() throws Exception {
        mockMvc.perform(get("/api/v1/student/courses/{id}/detail", courseId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(courseId))
                .andExpect(jsonPath("$.title").value("Khoa hoc Enrollment Test"))
                .andExpect(jsonPath("$.materials").isArray())
                .andExpect(jsonPath("$.assignments").isArray());
    }

    @Test
    @Order(8)
    @DisplayName("B8: Goi /student/** khong co token → 403")
    void step8_studentEndpoint_noToken_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/student/courses/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(9)
    @DisplayName("B9: TUTOR khong the enroll khoa hoc (student-only endpoint → 403)")
    void step9_tutor_cannotEnroll() throws Exception {
        // Lay token cua tutor
        User tutor = userRepository.findByPhoneOrEmail("0909002001", "0909002001").orElseThrow();
        String tutorToken = jwtService.generateToken(tutor);

        mockMvc.perform(post("/api/v1/student/courses/{id}/enroll", courseId)
                        .header("Authorization", "Bearer " + tutorToken))
                .andExpect(status().isForbidden());
    }
}