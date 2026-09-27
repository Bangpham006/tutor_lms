package com.tutorlms.backend.ai.dto;

import lombok.Data;

@Data
public class SummarizeRequest {
    /**
     * Nội dung slide hoặc bài giảng do người dùng nhập/paste.
     * Nếu để trống, hệ thống sẽ tự động trích xuất từ fileUrl của tài liệu.
     */
    private String lectureContent;

    /**
     * Ngôn ngữ mong muốn (mặc định tiếng Việt)
     */
    private String language = "vi";
}
