package com.tutorlms.backend.assignment.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AssignmentSubmissionResponse {
    private UUID id;
    private UUID assignmentId;
    private UUID studentId;
    private String studentName;
    private String submissionContent;
    private String fileUrl;
    private Double score;
    private LocalDateTime submittedAt;
}
