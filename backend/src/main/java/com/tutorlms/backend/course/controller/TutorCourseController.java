package com.tutorlms.backend.course.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.course.dto.CourseRequest;
import com.tutorlms.backend.course.dto.CourseResponse;
import com.tutorlms.backend.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutor/courses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_TUTOR', 'ROLE_ADMIN')")
public class TutorCourseController {

    private final CourseService courseService;

    @PostMapping
    public ResponseEntity<CourseResponse> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CourseRequest request
    ) {
        return ResponseEntity.ok(courseService.create(currentUser, request));
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> listMine(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(courseService.listOwnedByTutor(currentUser));
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> update(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId,
            @Valid @RequestBody CourseRequest request
    ) {
        return ResponseEntity.ok(courseService.update(currentUser, courseId, request));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId
    ) {
        courseService.delete(currentUser, courseId);
        return ResponseEntity.noContent().build();
    }
}
