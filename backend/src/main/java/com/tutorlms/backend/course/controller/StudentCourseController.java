package com.tutorlms.backend.course.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.course.dto.CourseResponse;
import com.tutorlms.backend.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/courses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PARENT', 'ROLE_ADMIN')")
public class StudentCourseController {

    private final CourseService courseService;

    @GetMapping("/catalog")
    public ResponseEntity<List<CourseResponse>> catalog() {
        return ResponseEntity.ok(courseService.catalog());
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> enrolled(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(courseService.listEnrolled(currentUser));
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<CourseResponse> enroll(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(courseService.enroll(currentUser, courseId));
    }
}
