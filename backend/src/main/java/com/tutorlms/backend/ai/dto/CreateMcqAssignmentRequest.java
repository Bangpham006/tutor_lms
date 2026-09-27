package com.tutorlms.backend.ai.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateMcqAssignmentRequest {
    private String title;
    private String description;
    private LocalDateTime dueAt;
    private List<McqQuestionResponse> questions;
}
