package com.tutorlms.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class McqQuestionResponse {
    private String question;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
}
