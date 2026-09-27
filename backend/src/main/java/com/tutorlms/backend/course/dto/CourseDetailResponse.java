package com.tutorlms.backend.course.dto;

import com.tutorlms.backend.assignment.dto.AssignmentResponse;
import com.tutorlms.backend.material.dto.LessonMaterialResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Thong tin chi tiet mot khoa hoc, bao gom danh sach tai lieu va bai tap.
 *
 * - Marketplace (cong khai): fileUrl trong materials se bi an (null).
 * - Student da dang ky: fileUrl duoc tra ve day du.
 */
@Data
@Builder
public class CourseDetailResponse {
    private UUID id;
    private String title;
    private String description;
    private java.math.BigDecimal price;
    private String courseCode;
    private UUID tutorId;
    private String tutorName;
    private LocalDateTime createdAt;
    private long enrollmentCount;
    private boolean hasEnrollmentKey;
    private List<LessonMaterialResponse> materials;
    private List<AssignmentResponse> assignments;
}