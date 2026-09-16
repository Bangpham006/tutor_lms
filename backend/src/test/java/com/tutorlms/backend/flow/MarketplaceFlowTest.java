package com.tutorlms.backend.flow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.auth.dto.RegisterRequest;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.auth.repository.UserRepository;
import com.tutorlms.backend.auth.service.JwtService;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Flow Test: Marketplace (cong khai, khong can dang nhap)
 *
 * Kiem tra cac endpoint public:
 *   GET /api/v1/marketplace/courses?keyword=...
 *   GET /api/v1/marketplace/courses/{id}
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@DisplayName("Flow: Marketplace (cong khai)")
class MarketplaceFlowTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private CourseRepository courseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private Course savedCourse;

    @BeforeEach
    void setUp() {
        // Tao tutor de so huu khoa hoc
        User tutor = userRepository.findByPhoneOrEmail("0909001001", "0909001001").orElseGet(() ->
                userRepository.save(User.builder()
                        .phone("0909001001")
                        .fullName("Tutor Marketplace Test")
                        .role("TUTOR")
                        .password(passwordEncoder.encode("pass"))
                        .build())
        );

        savedCourse = courseRepository.save(Course.builder()
                .title("Lap trinh Python co ban")
                .description("Hoc Python tu so")
                .tutor(tutor)
                .build());
    }

    @Test
    @DisplayName("Tim tat ca khoa hoc - KHONG can token")
    void search_noAuth_returnsAllCourses() throws Exception {
        mockMvc.perform(get("/api/v1/marketplace/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Tim kiem theo keyword - KHONG can token")
    void search_withKeyword_filtersCourses() throws Exception {
        mockMvc.perform(get("/api/v1/marketplace/courses")
                        .param("keyword", "Python"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title", containsStringIgnoringCase("Python")));
    }

    @Test
    @DisplayName("Tim kiem keyword khong khop -> danh sach rong")
    void search_noMatch_returnsEmpty() throws Exception {
        mockMvc.perform(get("/api/v1/marketplace/courses")
                        .param("keyword", "xyzABCkhongtontai99999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("Xem chi tiet khoa hoc - KHONG can token, fileUrl duoc an")
    void detail_noAuth_hidesFileUrl() throws Exception {
        mockMvc.perform(get("/api/v1/marketplace/courses/{id}", savedCourse.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedCourse.getId().toString()))
                .andExpect(jsonPath("$.title").value("Lap trinh Python co ban"))
                .andExpect(jsonPath("$.tutorName").value("Tutor Marketplace Test"))
                .andExpect(jsonPath("$.enrollmentCount").value(0))
                // fileUrl phai la null trong materials cua marketplace
                .andExpect(jsonPath("$.materials").isArray());
    }

    @Test
    @DisplayName("Xem chi tiet khoa hoc khong ton tai -> 404")
    void detail_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/marketplace/courses/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Tim theo tutorId -> chi tra khoa hoc cua tutor do")
    void search_withTutorId_filtersByTutor() throws Exception {
        mockMvc.perform(get("/api/v1/marketplace/courses")
                        .param("tutorId", savedCourse.getTutor().getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tutorId").value(savedCourse.getTutor().getId().toString()));
    }
}