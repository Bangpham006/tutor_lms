package com.tutorlms.backend.ai.controller;

import com.tutorlms.backend.ai.dto.GenerateMcqRequest;
import com.tutorlms.backend.ai.dto.McqSetResponse;
import com.tutorlms.backend.ai.dto.PdfSummaryResponse;
import com.tutorlms.backend.ai.dto.SummarizeRequest;
import com.tutorlms.backend.ai.service.AiService;
import com.tutorlms.backend.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutor/materials")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_TUTOR', 'ROLE_ADMIN')")
public class TutorAiController {

    private final AiService aiService;

    @PostMapping("/{materialId}/ai/summarize")
    public ResponseEntity<PdfSummaryResponse> summarize(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID materialId,
            @RequestBody(required = false) SummarizeRequest request
    ) {
        return ResponseEntity.ok(aiService.summarizeMaterial(currentUser, materialId, request));
    }

    @PostMapping("/{materialId}/ai/generate-mcq")
    public ResponseEntity<McqSetResponse> generateMcq(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID materialId,
            @RequestBody(required = false) GenerateMcqRequest request
    ) {
        GenerateMcqRequest body = request == null ? new GenerateMcqRequest() : request;
        return ResponseEntity.ok(aiService.generateMcq(currentUser, materialId, body));
    }
}
