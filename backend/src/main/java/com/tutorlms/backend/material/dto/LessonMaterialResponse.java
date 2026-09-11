package com.tutorlms.backend.material.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LessonMaterialResponse {
    private UUID id;
    private UUID courseId;
    private UUID tutorId;
    private String title;
    private String fileUrl;
    private String lectureLink;
    private LocalDateTime createdAt;
}
