package com.tutorlms.backend.assignment.dto;

import lombok.Data;

@Data
public class AssignmentSubmissionRequest {
    private String submissionContent;
    private String fileUrl;
}
