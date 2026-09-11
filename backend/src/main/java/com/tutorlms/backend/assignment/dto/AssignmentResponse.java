package com.tutorlms.backend.assignment.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AssignmentResponse {
    private UUID id;
    private UUID courseId;
    private String title;
    private String content;
    private LocalDateTime dueAt;
    private LocalDateTime createdAt;
}
