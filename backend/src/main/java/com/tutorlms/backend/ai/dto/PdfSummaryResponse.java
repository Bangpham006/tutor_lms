package com.tutorlms.backend.ai.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PdfSummaryResponse {
    private UUID materialId;
    private String title;
    private String summary;
}
