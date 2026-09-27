package com.tutorlms.backend.ai.controller;

import com.tutorlms.backend.ai.dto.*;
import com.tutorlms.backend.ai.service.AiService;
import com.tutorlms.backend.assignment.dto.AssignmentResponse;
import com.tutorlms.backend.auth.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller trung tâm quản lý tính năng AI:
 * - Trạng thái cấu hình & API Key của LLM
 * - Tóm tắt Slide / Bài giảng bằng AI thật
 * - Tạo câu hỏi trắc nghiệm tự động bằng AI thật
 * - Chuyển bộ câu hỏi trắc nghiệm AI thành Bài Tập chính thức trong Khóa Học
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    /**
     * Lấy trạng thái cấu hình AI (Key đã có chưa, provider nào, model nào)
     */
    @GetMapping("/status")
    public ResponseEntity<AiConfigDto> getStatus() {
        return ResponseEntity.ok(aiService.getAiConfig());
    }

    /**
     * Cập nhật API Key hoặc model runtime
     */
    @PostMapping("/configure-key")
    @PreAuthorize("hasAnyAuthority('ROLE_TUTOR', 'ROLE_ADMIN')")
    public ResponseEntity<AiConfigDto> configureKey(
            @Valid @RequestBody AiConfigureKeyRequest request
    ) {
        return ResponseEntity.ok(aiService.configureKey(request));
    }

    /**
     * Tóm tắt bài giảng / slide bằng AI thật (Học viên hoặc Gia sư đều gọi được)
     */
    @PostMapping("/materials/{materialId}/summarize")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PdfSummaryResponse> summarize(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID materialId,
            @RequestBody(required = false) SummarizeRequest request
    ) {
        return ResponseEntity.ok(aiService.summarizeMaterial(currentUser, materialId, request));
    }

    /**
     * Tạo bài trắc nghiệm tự động từ Slide / Bài giảng bằng AI thật
     */
    @PostMapping("/materials/{materialId}/generate-mcq")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<McqSetResponse> generateMcq(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID materialId,
            @RequestBody(required = false) GenerateMcqRequest request
    ) {
        GenerateMcqRequest body = request == null ? new GenerateMcqRequest() : request;
        return ResponseEntity.ok(aiService.generateMcq(currentUser, materialId, body));
    }

    /**
     * Gia sư lưu bộ câu hỏi trắc nghiệm do AI sinh ra thành Bài Tập chính thức trong Khóa Học
     */
    @PostMapping("/courses/{courseId}/save-mcq-assignment")
    @PreAuthorize("hasAnyAuthority('ROLE_TUTOR', 'ROLE_ADMIN')")
    public ResponseEntity<AssignmentResponse> saveMcqAsAssignment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId,
            @RequestBody CreateMcqAssignmentRequest request
    ) {
        return ResponseEntity.ok(aiService.saveMcqAsAssignment(currentUser, courseId, request));
    }
}
