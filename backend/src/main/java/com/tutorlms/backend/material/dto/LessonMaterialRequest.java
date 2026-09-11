package com.tutorlms.backend.material.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LessonMaterialRequest {

    @NotBlank(message = "Tiêu đề tài liệu không được để trống")
    private String title;

    private String fileUrl;

    private String lectureLink;
}
