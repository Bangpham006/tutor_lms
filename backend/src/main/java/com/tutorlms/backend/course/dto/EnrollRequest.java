package com.tutorlms.backend.course.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollRequest {
    /**
     * Mật khẩu khóa học (nếu khóa học yêu cầu).
     */
    private String enrollmentKey;
}
