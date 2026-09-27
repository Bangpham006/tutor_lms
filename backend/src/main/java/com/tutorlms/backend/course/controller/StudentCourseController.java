package com.tutorlms.backend.course.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.course.dto.CourseDetailResponse;
import com.tutorlms.backend.course.dto.CourseResponse;
import com.tutorlms.backend.course.dto.EnrollmentResponse;
import com.tutorlms.backend.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * API dành cho Học viên (STUDENT / PARENT / ADMIN).
 * Các endpoint yêu cầu xác thực — khác với MarketplaceController (công khai).
 */
@RestController
@RequestMapping("/api/v1/student/courses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PARENT', 'ROLE_TUTOR', 'ROLE_ADMIN')")
public class StudentCourseController {

    private final CourseService courseService;

    /**
     * Danh sách toàn bộ khóa học (catalog) — giữ tương thích với endpoint cũ.
     * Nên dùng /api/v1/marketplace/courses thay thế cho người dùng chưa đăng nhập.
     */
    @GetMapping("/catalog")
    public ResponseEntity<List<CourseResponse>> catalog() {
        return ResponseEntity.ok(courseService.catalog());
    }

    /**
     * Đăng ký tham gia một khóa học. Idempotent — đăng ký lại trả về kết quả cũ.
     * Hỗ trợ mật khẩu ghi danh (Enrollment Key) nếu khóa học yêu cầu.
     *
     * @param currentUser Học viên đang đăng nhập
     * @param courseId    ID khóa học muốn đăng ký
     * @param request     Chứa mật khẩu enrollmentKey nếu có
     */
    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<CourseResponse> enroll(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId,
            @RequestBody(required = false) com.tutorlms.backend.course.dto.EnrollRequest request
    ) {
        String key = request != null ? request.getEnrollmentKey() : null;
        return ResponseEntity.ok(courseService.enroll(currentUser, courseId, key));
    }

    /**
     * Danh sách khóa học đã đăng ký — kèm thông tin enrollment (enrolledAt).
     *
     * @param currentUser Học viên đang đăng nhập
     * @return List<EnrollmentResponse> sắp xếp theo ngày đăng ký mới nhất
     */
    @GetMapping("/me")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(courseService.getMyEnrollments(currentUser));
    }

    /**
     * Xem chi tiết đầy đủ một khóa học (bao gồm fileUrl tài liệu).
     * Yêu cầu học viên đã đăng ký khóa học — nếu chưa sẽ trả về 403.
     *
     * @param currentUser Học viên đang đăng nhập
     * @param courseId    ID khóa học
     */
    @GetMapping("/{courseId}/detail")
    public ResponseEntity<CourseDetailResponse> getCourseDetail(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(courseService.getCourseDetailForEnrolledStudent(currentUser, courseId));
    }
}

