package com.tutorlms.backend.ai.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class McqSetResponse {
    private UUID materialId;
    private String title;
    private List<McqQuestionResponse> questions;
}
