package com.tutorlms.backend.assignment.controller;

import com.tutorlms.backend.assignment.dto.AssignmentRequest;
import com.tutorlms.backend.assignment.dto.AssignmentResponse;
import com.tutorlms.backend.assignment.dto.AssignmentSubmissionResponse;
import com.tutorlms.backend.assignment.dto.GradeSubmissionRequest;
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
@RequestMapping("/api/v1/tutor")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_TUTOR', 'ROLE_ADMIN')")
public class TutorAssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping("/courses/{courseId}/assignments")
    public ResponseEntity<AssignmentResponse> create(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId,
            @Valid @RequestBody AssignmentRequest request
    ) {
        return ResponseEntity.ok(assignmentService.create(currentUser, courseId, request));
    }

    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> list(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(assignmentService.listForTutor(currentUser, courseId));
    }

    @PutMapping("/assignments/{assignmentId}")
    public ResponseEntity<AssignmentResponse> update(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID assignmentId,
            @Valid @RequestBody AssignmentRequest request
    ) {
        return ResponseEntity.ok(assignmentService.update(currentUser, assignmentId, request));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID assignmentId
    ) {
        assignmentService.delete(currentUser, assignmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmissionResponse>> submissions(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID assignmentId
    ) {
        return ResponseEntity.ok(assignmentService.listSubmissions(currentUser, assignmentId));
    }

    @PatchMapping("/submissions/{submissionId}/score")
    public ResponseEntity<AssignmentSubmissionResponse> grade(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID submissionId,
            @Valid @RequestBody GradeSubmissionRequest request
    ) {
        return ResponseEntity.ok(assignmentService.grade(currentUser, submissionId, request));
    }
}
