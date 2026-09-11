package com.tutorlms.backend.material.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.material.dto.LessonMaterialRequest;
import com.tutorlms.backend.material.dto.LessonMaterialResponse;
import com.tutorlms.backend.material.service.LessonMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutor")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_TUTOR', 'ROLE_ADMIN')")
public class TutorMaterialController {

    private final LessonMaterialService materialService;

    @PostMapping("/courses/{courseId}/materials")
    public ResponseEntity<LessonMaterialResponse> create(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId,
            @Valid @RequestBody LessonMaterialRequest request
    ) {
        return ResponseEntity.ok(materialService.create(currentUser, courseId, request));
    }

    @GetMapping("/courses/{courseId}/materials")
    public ResponseEntity<List<LessonMaterialResponse>> list(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(materialService.listForTutor(currentUser, courseId));
    }

    @PutMapping("/materials/{materialId}")
    public ResponseEntity<LessonMaterialResponse> update(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID materialId,
            @Valid @RequestBody LessonMaterialRequest request
    ) {
        return ResponseEntity.ok(materialService.update(currentUser, materialId, request));
    }

    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID materialId
    ) {
        materialService.delete(currentUser, materialId);
        return ResponseEntity.noContent().build();
    }
}
