package com.tutorlms.backend.material.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.material.dto.LessonMaterialResponse;
import com.tutorlms.backend.material.service.LessonMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/courses/{courseId}/materials")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PARENT', 'ROLE_ADMIN')")
public class StudentMaterialController {

    private final LessonMaterialService materialService;

    @GetMapping
    public ResponseEntity<List<LessonMaterialResponse>> list(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(materialService.listForStudent(currentUser, courseId));
    }
}
