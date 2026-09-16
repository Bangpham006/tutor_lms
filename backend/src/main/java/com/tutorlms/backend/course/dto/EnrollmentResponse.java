package com.tutorlms.backend.course.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Thong tin mot khoa hoc ma hoc vien da dang ky.
 * Tra ve kem thoi diem dang ky (enrolledAt).
 */
@Data
@Builder
public class EnrollmentResponse {
    private UUID enrollmentId;
    private UUID courseId;
    private String courseTitle;
    private String courseDescription;
    private UUID tutorId;
    private String tutorName;
    private LocalDateTime enrolledAt;
    private LocalDateTime courseCreatedAt;
}