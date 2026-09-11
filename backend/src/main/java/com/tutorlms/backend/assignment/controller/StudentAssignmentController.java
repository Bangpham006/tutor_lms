package com.tutorlms.backend.assignment.controller;

import com.tutorlms.backend.assignment.dto.AssignmentResponse;
import com.tutorlms.backend.assignment.dto.AssignmentSubmissionRequest;
import com.tutorlms.backend.assignment.dto.AssignmentSubmissionResponse;
import com.tutorlms.backend.assignment.service.AssignmentService;
import com.tutorlms.backend.auth.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PARENT', 'ROLE_ADMIN')")
public class StudentAssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> list(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(assignmentService.listForStudent(currentUser, courseId));
    }

    @PostMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<AssignmentSubmissionResponse> submit(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID assignmentId,
            @Valid @RequestBody AssignmentSubmissionRequest request
    ) {
        return ResponseEntity.ok(assignmentService.submit(currentUser, assignmentId, request));
    }

    @GetMapping("/assignments/{assignmentId}/submissions/me")
    public ResponseEntity<AssignmentSubmissionResponse> mySubmission(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID assignmentId
    ) {
        return ResponseEntity.ok(assignmentService.mySubmission(currentUser, assignmentId));
    }
}
