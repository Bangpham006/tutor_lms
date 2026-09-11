package com.tutorlms.backend.course.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CourseResponse {
    private UUID id;
    private String title;
    private String description;
    private UUID tutorId;
    private String tutorName;
    private LocalDateTime createdAt;
}
