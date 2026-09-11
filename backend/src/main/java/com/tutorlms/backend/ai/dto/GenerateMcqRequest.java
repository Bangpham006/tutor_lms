package com.tutorlms.backend.ai.dto;

import lombok.Data;

@Data
public class GenerateMcqRequest {
    /**
     * Nội dung bài giảng do giáo viên cung cấp. Nếu trống, hệ thống lấy text từ PDF fileUrl.
     */
    private String lectureContent;

    private Integer questionCount = 5;
}
