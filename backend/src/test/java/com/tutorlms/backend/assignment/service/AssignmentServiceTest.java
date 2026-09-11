package com.tutorlms.backend.assignment.service;

import com.tutorlms.backend.assignment.dto.AssignmentRequest;
import com.tutorlms.backend.assignment.dto.AssignmentSubmissionRequest;
import com.tutorlms.backend.assignment.dto.AssignmentSubmissionResponse;
import com.tutorlms.backend.assignment.dto.GradeSubmissionRequest;
import com.tutorlms.backend.assignment.entity.Assignment;
import com.tutorlms.backend.assignment.entity.AssignmentSubmission;
import com.tutorlms.backend.assignment.repository.AssignmentRepository;
import com.tutorlms.backend.assignment.repository.AssignmentSubmissionRepository;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.BadRequestException;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.service.CourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private AssignmentSubmissionRepository submissionRepository;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private AssignmentService assignmentService;

    private User tutor;
    private User student;
    private Course course;
    private Assignment assignment;

    @BeforeEach
    void setUp() {
        tutor = User.builder()
                .id(UUID.randomUUID())
                .phone("0901111111")
                .fullName("Giang vien")
                .role("ROLE_TUTOR")
                .password("secret")
                .build();
        student = User.builder()
                .id(UUID.randomUUID())
                .phone("0902222222")
                .fullName("Hoc vien")
                .role("ROLE_STUDENT")
                .password("secret")
                .build();
        course = Course.builder()
                .id(UUID.randomUUID())
                .title("Vat ly")
                .tutor(tutor)
                .build();
        assignment = Assignment.builder()
                .id(UUID.randomUUID())
                .title("Bai tap 1")
                .content("Lam cau 1 den cau 5")
                .dueAt(LocalDateTime.now().plusDays(3))
                .course(course)
                .build();
    }

    @Test
    void create_savesAssignmentForOwnedCourse() {
        when(courseService.requireOwnedCourse(tutor, course.getId())).thenReturn(course);
        when(assignmentRepository.save(any(Assignment.class))).thenAnswer(invocation -> {
            Assignment saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        AssignmentRequest request = new AssignmentRequest();
        request.setTitle("Bai tap 1");
        request.setContent("Lam cau 1 den cau 5");
        request.setDueAt(LocalDateTime.now().plusDays(3));

        var response = assignmentService.create(tutor, course.getId(), request);

        assertThat(response.getTitle()).isEqualTo("Bai tap 1");
        assertThat(response.getCourseId()).isEqualTo(course.getId());
        verify(assignmentRepository).save(any(Assignment.class));
    }

    @Test
    void submit_createsSubmissionBoxEntry() {
        when(assignmentRepository.findById(assignment.getId())).thenReturn(Optional.of(assignment));
        when(submissionRepository.findByAssignment_IdAndStudent_Id(assignment.getId(), student.getId()))
                .thenReturn(Optional.empty());
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> {
            AssignmentSubmission saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        AssignmentSubmissionRequest request = new AssignmentSubmissionRequest();
        request.setSubmissionContent("Bai lam cua em");
        request.setFileUrl("https://cdn.example.com/nopbai.pdf");

        AssignmentSubmissionResponse response = assignmentService.submit(student, assignment.getId(), request);

        verify(courseService).requireEnrolledStudent(student, course.getId());
        assertThat(response.getSubmissionContent()).isEqualTo("Bai lam cua em");
        assertThat(response.getFileUrl()).isEqualTo("https://cdn.example.com/nopbai.pdf");
        assertThat(response.getStudentId()).isEqualTo(student.getId());
        assertThat(response.getScore()).isNull();
    }

    @Test
    void submit_rejectsEmptyWork() {
        when(assignmentRepository.findById(assignment.getId())).thenReturn(Optional.of(assignment));

        AssignmentSubmissionRequest request = new AssignmentSubmissionRequest();

        assertThatThrownBy(() -> assignmentService.submit(student, assignment.getId(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cần nội dung bài làm hoặc fileUrl");
    }

    @Test
    void submit_rejectsAfterDueDate() {
        assignment.setDueAt(LocalDateTime.now().minusHours(1));
        when(assignmentRepository.findById(assignment.getId())).thenReturn(Optional.of(assignment));

        AssignmentSubmissionRequest request = new AssignmentSubmissionRequest();
        request.setSubmissionContent("Nop tre");

        assertThatThrownBy(() -> assignmentService.submit(student, assignment.getId(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Đã quá hạn nộp bài");
    }

    @Test
    void submit_rejectsResubmitAfterGrading() {
        AssignmentSubmission graded = AssignmentSubmission.builder()
                .id(UUID.randomUUID())
                .assignment(assignment)
                .student(student)
                .submissionContent("Da cham")
                .score(8.5)
                .build();
        when(assignmentRepository.findById(assignment.getId())).thenReturn(Optional.of(assignment));
        when(submissionRepository.findByAssignment_IdAndStudent_Id(assignment.getId(), student.getId()))
                .thenReturn(Optional.of(graded));

        AssignmentSubmissionRequest request = new AssignmentSubmissionRequest();
        request.setSubmissionContent("Nop lai");

        assertThatThrownBy(() -> assignmentService.submit(student, assignment.getId(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Bài đã được chấm");
    }

    @Test
    void grade_setsScoreForTutor() {
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .id(UUID.randomUUID())
                .assignment(assignment)
                .student(student)
                .submissionContent("Bai lam")
                .submittedAt(LocalDateTime.now())
                .build();
        when(submissionRepository.findById(submission.getId())).thenReturn(Optional.of(submission));
        when(courseService.requireOwnedCourse(tutor, course.getId())).thenReturn(course);
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GradeSubmissionRequest request = new GradeSubmissionRequest();
        request.setScore(9.0);

        AssignmentSubmissionResponse response = assignmentService.grade(tutor, submission.getId(), request);

        assertThat(response.getScore()).isEqualTo(9.0);
        assertThat(response.getStudentName()).isEqualTo("Hoc vien");
    }

    @Test
    void listSubmissions_returnsAllForAssignment() {
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .id(UUID.randomUUID())
                .assignment(assignment)
                .student(student)
                .submissionContent("Bai lam")
                .submittedAt(LocalDateTime.now())
                .build();
        when(assignmentRepository.findById(assignment.getId())).thenReturn(Optional.of(assignment));
        when(courseService.requireOwnedCourse(tutor, course.getId())).thenReturn(course);
        when(submissionRepository.findByAssignment_IdOrderBySubmittedAtDesc(assignment.getId()))
                .thenReturn(List.of(submission));

        List<AssignmentSubmissionResponse> result = assignmentService.listSubmissions(tutor, assignment.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAssignmentId()).isEqualTo(assignment.getId());
    }
}
