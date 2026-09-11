package com.tutorlms.backend.assignment.service;

import com.tutorlms.backend.assignment.dto.AssignmentRequest;
import com.tutorlms.backend.assignment.dto.AssignmentResponse;
import com.tutorlms.backend.assignment.dto.AssignmentSubmissionRequest;
import com.tutorlms.backend.assignment.dto.AssignmentSubmissionResponse;
import com.tutorlms.backend.assignment.dto.GradeSubmissionRequest;
import com.tutorlms.backend.assignment.entity.Assignment;
import com.tutorlms.backend.assignment.entity.AssignmentSubmission;
import com.tutorlms.backend.assignment.repository.AssignmentRepository;
import com.tutorlms.backend.assignment.repository.AssignmentSubmissionRepository;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.BadRequestException;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final CourseService courseService;

    @Transactional
    public AssignmentResponse create(User tutor, UUID courseId, AssignmentRequest request) {
        Course course = courseService.requireOwnedCourse(tutor, courseId);
        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .dueAt(request.getDueAt())
                .course(course)
                .build();
        return toAssignmentResponse(assignmentRepository.save(assignment));
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listForTutor(User tutor, UUID courseId) {
        courseService.requireOwnedCourse(tutor, courseId);
        return assignmentRepository.findByCourse_IdOrderByDueAtAsc(courseId).stream()
                .map(this::toAssignmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listForStudent(User student, UUID courseId) {
        courseService.requireEnrolledStudent(student, courseId);
        return assignmentRepository.findByCourse_IdOrderByDueAtAsc(courseId).stream()
                .map(this::toAssignmentResponse)
                .toList();
    }

    @Transactional
    public AssignmentResponse update(User tutor, UUID assignmentId, AssignmentRequest request) {
        Assignment assignment = requireOwnedAssignment(tutor, assignmentId);
        assignment.setTitle(request.getTitle());
        assignment.setContent(request.getContent());
        assignment.setDueAt(request.getDueAt());
        return toAssignmentResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public void delete(User tutor, UUID assignmentId) {
        Assignment assignment = requireOwnedAssignment(tutor, assignmentId);
        assignmentRepository.delete(assignment);
    }

    @Transactional
    public AssignmentSubmissionResponse submit(
            User student,
            UUID assignmentId,
            AssignmentSubmissionRequest request
    ) {
        Assignment assignment = getAssignment(assignmentId);
        courseService.requireEnrolledStudent(student, assignment.getCourse().getId());

        if (request.getSubmissionContent() == null && (request.getFileUrl() == null || request.getFileUrl().isBlank())) {
            throw new BadRequestException("Cần nội dung bài làm hoặc fileUrl");
        }

        if (assignment.getDueAt() != null && LocalDateTime.now().isAfter(assignment.getDueAt())) {
            throw new BadRequestException("Đã quá hạn nộp bài");
        }

        AssignmentSubmission submission = submissionRepository
                .findByAssignment_IdAndStudent_Id(assignmentId, student.getId())
                .orElseGet(() -> AssignmentSubmission.builder()
                        .assignment(assignment)
                        .student(student)
                        .build());

        if (submission.getScore() != null) {
            throw new BadRequestException("Bài đã được chấm, không thể nộp lại");
        }

        submission.setSubmissionContent(request.getSubmissionContent());
        submission.setFileUrl(request.getFileUrl());
        submission.setSubmittedAt(LocalDateTime.now());
        return toSubmissionResponse(submissionRepository.save(submission));
    }

    @Transactional(readOnly = true)
    public AssignmentSubmissionResponse mySubmission(User student, UUID assignmentId) {
        Assignment assignment = getAssignment(assignmentId);
        courseService.requireEnrolledStudent(student, assignment.getCourse().getId());
        return submissionRepository.findByAssignment_IdAndStudent_Id(assignmentId, student.getId())
                .map(this::toSubmissionResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa nộp bài tập này"));
    }

    @Transactional(readOnly = true)
    public List<AssignmentSubmissionResponse> listSubmissions(User tutor, UUID assignmentId) {
        requireOwnedAssignment(tutor, assignmentId);
        return submissionRepository.findByAssignment_IdOrderBySubmittedAtDesc(assignmentId).stream()
                .map(this::toSubmissionResponse)
                .toList();
    }

    @Transactional
    public AssignmentSubmissionResponse grade(User tutor, UUID submissionId, GradeSubmissionRequest request) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nộp"));
        courseService.requireOwnedCourse(tutor, submission.getAssignment().getCourse().getId());
        submission.setScore(request.getScore());
        return toSubmissionResponse(submissionRepository.save(submission));
    }

    private Assignment requireOwnedAssignment(User tutor, UUID assignmentId) {
        Assignment assignment = getAssignment(assignmentId);
        courseService.requireOwnedCourse(tutor, assignment.getCourse().getId());
        return assignment;
    }

    private Assignment getAssignment(UUID assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài tập"));
    }

    private AssignmentResponse toAssignmentResponse(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .courseId(assignment.getCourse().getId())
                .title(assignment.getTitle())
                .content(assignment.getContent())
                .dueAt(assignment.getDueAt())
                .createdAt(assignment.getCreatedAt())
                .build();
    }

    private AssignmentSubmissionResponse toSubmissionResponse(AssignmentSubmission submission) {
        return AssignmentSubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFullName())
                .submissionContent(submission.getSubmissionContent())
                .fileUrl(submission.getFileUrl())
                .score(submission.getScore())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }
}
