package com.tutorlms.backend.course.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.ForbiddenOperationException;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.course.dto.CourseDetailResponse;
import com.tutorlms.backend.course.dto.CourseRequest;
import com.tutorlms.backend.course.dto.CourseResponse;
import com.tutorlms.backend.course.dto.EnrollmentResponse;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.entity.CourseEnrollment;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.course.repository.CourseRepository;
import com.tutorlms.backend.material.entity.LessonMaterial;
import com.tutorlms.backend.assignment.entity.Assignment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CourseService - Unit Tests")
class CourseServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private CourseEnrollmentRepository enrollmentRepository;

    @InjectMocks private CourseService courseService;

    private User tutor;
    private User student;
    private Course course;

    @BeforeEach
    void setUp() {
        tutor = User.builder()
                .id(UUID.randomUUID())
                .phone("0901111111")
                .fullName("Giang Vien A")
                .role("TUTOR")
                .password("secret")
                .build();
        student = User.builder()
                .id(UUID.randomUUID())
                .phone("0902222222")
                .fullName("Hoc Vien B")
                .role("STUDENT")
                .password("secret")
                .build();
        course = Course.builder()
                .id(UUID.randomUUID())
                .title("Khoa hoc Java")
                .description("Lap trinh Java co ban")
                .tutor(tutor)
                .createdAt(LocalDateTime.now())
                .materials(new ArrayList<>())
                .assignments(new ArrayList<>())
                .enrollments(new ArrayList<>())
                .build();
    }

    // ================================================================
    // CREATE
    // ================================================================
    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("Tutor tao khoa hoc thanh cong")
        void create_success() {
            CourseRequest request = new CourseRequest();
            request.setTitle("Khoa hoc Java");
            request.setDescription("Lap trinh Java co ban");

            when(courseRepository.save(any(Course.class))).thenReturn(course);

            CourseResponse response = courseService.create(tutor, request);

            assertThat(response.getTitle()).isEqualTo("Khoa hoc Java");
            assertThat(response.getTutorId()).isEqualTo(tutor.getId());
            verify(courseRepository).save(any(Course.class));
        }

        @Test
        @DisplayName("Null user -> ForbiddenOperationException")
        void create_nullUser_throws() {
            CourseRequest request = new CourseRequest();
            request.setTitle("Test");

            assertThatThrownBy(() -> courseService.create(null, request))
                    .isInstanceOf(ForbiddenOperationException.class);
        }
    }

    // ================================================================
    // SEARCH (Marketplace)
    // ================================================================
    @Nested
    @DisplayName("search()")
    class Search {

        @Test
        @DisplayName("Khong co filter -> tra tat ca khoa hoc")
        void search_noFilter_returnsAll() {
            when(courseRepository.searchCourses(null, null))
                    .thenReturn(List.of(course));

            List<CourseResponse> result = courseService.search(null, null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(course.getId());
        }

        @Test
        @DisplayName("Filter theo keyword -> goi searchCourses voi keyword")
        void search_withKeyword_callsRepository() {
            when(courseRepository.searchCourses("java", null))
                    .thenReturn(List.of(course));

            List<CourseResponse> result = courseService.search("java", null);

            assertThat(result).hasSize(1);
            verify(courseRepository).searchCourses("java", null);
        }

        @Test
        @DisplayName("Filter theo tutorId -> chi tra khoa hoc cua tutor do")
        void search_withTutorId_filtersCorrectly() {
            when(courseRepository.searchCourses(null, tutor.getId()))
                    .thenReturn(List.of(course));

            List<CourseResponse> result = courseService.search(null, tutor.getId());

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTutorId()).isEqualTo(tutor.getId());
        }

        @Test
        @DisplayName("Khong co khoa hoc phu hop -> tra danh sach rong")
        void search_noMatch_returnsEmpty() {
            when(courseRepository.searchCourses("khong ton tai", null))
                    .thenReturn(List.of());

            List<CourseResponse> result = courseService.search("khong ton tai", null);

            assertThat(result).isEmpty();
        }
    }

    // ================================================================
    // GET COURSE DETAIL (Public Marketplace)
    // ================================================================
    @Nested
    @DisplayName("getCourseDetail() - Public Marketplace")
    class GetCourseDetail {

        @Test
        @DisplayName("Tra ve chi tiet cong khai, fileUrl duoc an (null)")
        void getCourseDetail_hidesFileUrl() {
            LessonMaterial material = LessonMaterial.builder()
                    .id(UUID.randomUUID())
                    .title("Chuong 1")
                    .fileUrl("https://secret.pdf")
                    .lectureLink("https://meet.example.com")
                    .course(course)
                    .tutor(tutor)
                    .createdAt(LocalDateTime.now())
                    .build();
            course.getMaterials().add(material);

            when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
            when(enrollmentRepository.countByCourse_Id(course.getId())).thenReturn(5L);

            CourseDetailResponse detail = courseService.getCourseDetail(course.getId());

            assertThat(detail.getId()).isEqualTo(course.getId());
            assertThat(detail.getMaterials()).hasSize(1);
            // fileUrl phai bi an (null) voi marketplace cong khai
            assertThat(detail.getMaterials().get(0).getFileUrl()).isNull();
            // lectureLink van hien
            assertThat(detail.getMaterials().get(0).getLectureLink()).isEqualTo("https://meet.example.com");
            assertThat(detail.getEnrollmentCount()).isEqualTo(5);
        }

        @Test
        @DisplayName("Khoa hoc khong ton tai -> ResourceNotFoundException")
        void getCourseDetail_notFound_throws() {
            UUID missingId = UUID.randomUUID();
            when(courseRepository.findById(missingId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> courseService.getCourseDetail(missingId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Chi tiet co ca assignments")
        void getCourseDetail_includesAssignments() {
            Assignment assignment = Assignment.builder()
                    .id(UUID.randomUUID())
                    .title("Bai tap 1")
                    .content("Noi dung bai tap")
                    .dueAt(LocalDateTime.now().plusDays(7))
                    .course(course)
                    .createdAt(LocalDateTime.now())
                    .build();
            course.getAssignments().add(assignment);

            when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
            when(enrollmentRepository.countByCourse_Id(course.getId())).thenReturn(0L);

            CourseDetailResponse detail = courseService.getCourseDetail(course.getId());

            assertThat(detail.getAssignments()).hasSize(1);
            assertThat(detail.getAssignments().get(0).getTitle()).isEqualTo("Bai tap 1");
        }
    }

    // ================================================================
    // GET COURSE DETAIL (Enrolled Student - full fileUrl)
    // ================================================================
    @Nested
    @DisplayName("getCourseDetailForEnrolledStudent()")
    class GetCourseDetailForEnrolledStudent {

        @Test
        @DisplayName("Student da enroll -> tra ve fileUrl day du")
        void detail_enrolled_showsFileUrl() {
            LessonMaterial material = LessonMaterial.builder()
                    .id(UUID.randomUUID())
                    .title("Chuong 2")
                    .fileUrl("https://secret-file.pdf")
                    .course(course)
                    .tutor(tutor)
                    .createdAt(LocalDateTime.now())
                    .build();
            course.getMaterials().add(material);

            when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
            when(enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId()))
                    .thenReturn(true);
            when(enrollmentRepository.countByCourse_Id(course.getId())).thenReturn(1L);

            CourseDetailResponse detail = courseService.getCourseDetailForEnrolledStudent(student, course.getId());

            // fileUrl PHAI hien thi day du voi student da enroll
            assertThat(detail.getMaterials().get(0).getFileUrl()).isEqualTo("https://secret-file.pdf");
        }

        @Test
        @DisplayName("Student chua enroll -> ForbiddenOperationException")
        void detail_notEnrolled_throws() {
            when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
            when(enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId()))
                    .thenReturn(false);

            assertThatThrownBy(() ->
                courseService.getCourseDetailForEnrolledStudent(student, course.getId()))
                    .isInstanceOf(ForbiddenOperationException.class);
        }
    }

    // ================================================================
    // ENROLL
    // ================================================================
    @Nested
    @DisplayName("enroll()")
    class Enroll {

        @Test
        @DisplayName("Dang ky lan dau -> luu enrollment moi")
        void enroll_firstTime_savesEnrollment() {
            when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
            when(enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId()))
                    .thenReturn(false);
            when(enrollmentRepository.save(any(CourseEnrollment.class))).thenReturn(
                    CourseEnrollment.builder().id(UUID.randomUUID()).course(course).student(student).build()
            );

            CourseResponse response = courseService.enroll(student, course.getId());

            assertThat(response.getId()).isEqualTo(course.getId());
            verify(enrollmentRepository).save(any(CourseEnrollment.class));
        }

        @Test
        @DisplayName("Da dang ky truoc do -> idempotent, khong luu lai")
        void enroll_alreadyEnrolled_idempotent() {
            when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
            when(enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId()))
                    .thenReturn(true);

            CourseResponse response = courseService.enroll(student, course.getId());

            assertThat(response.getId()).isEqualTo(course.getId());
            // Khong luu lai
            verify(enrollmentRepository, never()).save(any());
        }

        @Test
        @DisplayName("Khoa hoc khong ton tai -> ResourceNotFoundException")
        void enroll_courseNotFound_throws() {
            UUID missingId = UUID.randomUUID();
            when(courseRepository.findById(missingId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> courseService.enroll(student, missingId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ================================================================
    // GET MY ENROLLMENTS
    // ================================================================
    @Nested
    @DisplayName("getMyEnrollments()")
    class GetMyEnrollments {

        @Test
        @DisplayName("Tra ve danh sach khoa hoc da dang ky kem enrolledAt")
        void getMyEnrollments_returnsEnrollmentWithDate() {
            LocalDateTime enrolledTime = LocalDateTime.now().minusDays(2);
            CourseEnrollment enrollment = CourseEnrollment.builder()
                    .id(UUID.randomUUID())
                    .course(course)
                    .student(student)
                    .enrolledAt(enrolledTime)
                    .build();

            when(enrollmentRepository.findByStudent_IdOrderByEnrolledAtDesc(student.getId()))
                    .thenReturn(List.of(enrollment));

            List<EnrollmentResponse> result = courseService.getMyEnrollments(student);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCourseId()).isEqualTo(course.getId());
            assertThat(result.get(0).getCourseTitle()).isEqualTo("Khoa hoc Java");
            assertThat(result.get(0).getTutorName()).isEqualTo("Giang Vien A");
            assertThat(result.get(0).getEnrolledAt()).isEqualTo(enrolledTime);
        }

        @Test
        @DisplayName("Chua dang ky khoa hoc nao -> danh sach rong")
        void getMyEnrollments_empty_returnsEmptyList() {
            when(enrollmentRepository.findByStudent_IdOrderByEnrolledAtDesc(student.getId()))
                    .thenReturn(List.of());

            List<EnrollmentResponse> result = courseService.getMyEnrollments(student);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Null user -> ForbiddenOperationException")
        void getMyEnrollments_nullUser_throws() {
            assertThatThrownBy(() -> courseService.getMyEnrollments(null))
                    .isInstanceOf(ForbiddenOperationException.class);
        }
    }

    // ================================================================
    // REQUIRE OWNED COURSE
    // ================================================================
    @Nested
    @DisplayName("requireOwnedCourse()")
    class RequireOwnedCourse {

        @Test
        @DisplayName("Tutor so huu khoa hoc -> tra ve course")
        void requireOwnedCourse_success() {
            when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));

            Course result = courseService.requireOwnedCourse(tutor, course.getId());

            assertThat(result.getId()).isEqualTo(course.getId());
        }

        @Test
        @DisplayName("Tutor khac so huu -> ForbiddenOperationException")
        void requireOwnedCourse_differentTutor_throws() {
            User otherTutor = User.builder()
                    .id(UUID.randomUUID())
                    .phone("0903333333")
                    .fullName("Giang Vien Khac")
                    .role("TUTOR")
                    .password("secret")
                    .build();
            when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));

            assertThatThrownBy(() -> courseService.requireOwnedCourse(otherTutor, course.getId()))
                    .isInstanceOf(ForbiddenOperationException.class);
        }
    }
}