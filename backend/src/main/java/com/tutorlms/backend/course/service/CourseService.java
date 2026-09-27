package com.tutorlms.backend.course.service;

import com.tutorlms.backend.assignment.dto.AssignmentResponse;
import com.tutorlms.backend.assignment.entity.Assignment;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.ForbiddenOperationException;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.common.security.CurrentUser;
import com.tutorlms.backend.common.security.Roles;
import com.tutorlms.backend.course.dto.CourseDetailResponse;
import com.tutorlms.backend.course.dto.CourseRequest;
import com.tutorlms.backend.course.dto.CourseResponse;
import com.tutorlms.backend.course.dto.EnrollmentResponse;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.entity.CourseEnrollment;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.course.repository.CourseRepository;
import com.tutorlms.backend.material.dto.LessonMaterialResponse;
import com.tutorlms.backend.material.entity.LessonMaterial;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    // =========================================================
    // TUTOR: Quản lý khóa học
    // =========================================================

    @Transactional
    public CourseResponse create(User tutor, CourseRequest request) {
        CurrentUser.require(tutor);
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice() != null ? request.getPrice() : java.math.BigDecimal.ZERO)
                .enrollmentKey(request.getEnrollmentKey() != null && !request.getEnrollmentKey().isBlank()
                        ? request.getEnrollmentKey().trim() : null)
                .tutor(tutor)
                .build();
        return toResponse(courseRepository.save(course));
    }


    @Transactional(readOnly = true)
    public List<CourseResponse> listOwnedByTutor(User tutor) {
        CurrentUser.require(tutor);
        if (CurrentUser.isAdmin(tutor)) {
            return courseRepository.findAll().stream().map(this::toResponse).toList();
        }
        return courseRepository.findByTutor_IdOrderByCreatedAtDesc(tutor.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CourseResponse update(User tutor, UUID courseId, CourseRequest request) {
        Course course = requireOwnedCourse(tutor, courseId);
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        if (request.getPrice() != null) {
            course.setPrice(request.getPrice());
        }
        if (request.getEnrollmentKey() != null) {
            course.setEnrollmentKey(request.getEnrollmentKey().isBlank() ? null : request.getEnrollmentKey().trim());
        }
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void delete(User tutor, UUID courseId) {
        Course course = requireOwnedCourse(tutor, courseId);
        courseRepository.delete(course);
    }

    // =========================================================
    // MARKETPLACE: Công khai — không cần đăng nhập
    // =========================================================

    /**
     * Tìm kiếm / lọc khóa học trên Marketplace.
     * Cả hai tham số đều tùy chọn — nếu null thì trả về tất cả.
     *
     * @param keyword  từ khóa tìm kiếm trong title / description
     * @param tutorId  lọc theo gia sư cụ thể
     */
    @Transactional(readOnly = true)
    public List<CourseResponse> search(String keyword, UUID tutorId) {
        return courseRepository.searchCourses(keyword, tutorId).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Xem chi tiết khóa học trên Marketplace (công khai).
     * Ẩn fileUrl của tài liệu — người dùng phải đăng ký mới xem được file.
     */
    @Transactional(readOnly = true)
    public CourseDetailResponse getCourseDetail(UUID courseId) {
        Course course = getCourse(courseId);
        return toDetailResponsePublic(course);
    }

    // =========================================================
    // STUDENT: Đăng ký & xem khóa học đã học
    // =========================================================

    /** Giữ tương thích với catalog endpoint cũ — trả tất cả khóa học. */
    @Transactional(readOnly = true)
    public List<CourseResponse> catalog() {
        return courseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public CourseResponse enroll(User student, UUID courseId) {
        return enroll(student, courseId, null);
    }

    /**
     * Đăng ký một khóa học. Idempotent — đăng ký lại sẽ trả về kết quả như cũ.
     * Kiểm tra mật khẩu khóa học (Enrollment Key) nếu có.
     */
    @Transactional
    public CourseResponse enroll(User student, UUID courseId, String enrollmentKey) {
        CurrentUser.require(student);
        Course course = getCourse(courseId);
        if (enrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, student.getId())) {
            return toResponse(course);
        }

        // Kiểm tra mật khẩu vào khóa học nếu khóa học có đặt mật khẩu
        if (course.getEnrollmentKey() != null && !course.getEnrollmentKey().isBlank()) {
            if (enrollmentKey == null || !course.getEnrollmentKey().trim().equalsIgnoreCase(enrollmentKey.trim())) {
                throw new com.tutorlms.backend.common.exception.BadRequestException("Mật khẩu vào khóa học không chính xác hoặc chưa được cung cấp.");
            }
        }

        enrollmentRepository.save(CourseEnrollment.builder()
                .course(course)
                .student(student)
                .build());
        return toResponse(course);
    }

    /**
     * Danh sách khóa học đã đăng ký — kèm thông tin enrollment (enrolledAt).
     */
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments(User student) {
        CurrentUser.require(student);
        return enrollmentRepository.findByStudent_IdOrderByEnrolledAtDesc(student.getId()).stream()
                .map(this::toEnrollmentResponse)
                .toList();
    }

    /**
     * Xem chi tiết khóa học khi đã đăng ký — trả về đầy đủ fileUrl.
     */
    @Transactional(readOnly = true)
    public CourseDetailResponse getCourseDetailForEnrolledStudent(User student, UUID courseId) {
        Course course = getCourse(courseId);
        boolean isOwner = course.getTutor() != null && course.getTutor().getId().equals(student.getId());
        boolean isAdmin = student.hasRole("ROLE_ADMIN");
        if (!isOwner && !isAdmin) {
            requireEnrolledStudent(student, courseId);
        }
        return toDetailResponse(course, false); // false = không ẩn fileUrl
    }

    // =========================================================
    // Phương thức kiểm tra quyền (helpers)
    // =========================================================

    @Transactional(readOnly = true)
    public Course getCourse(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));
    }

    public Course requireOwnedCourse(User user, UUID courseId) {
        CurrentUser.require(user);
        Course course = getCourse(courseId);
        if (!CurrentUser.isAdmin(user) && !course.getTutor().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Bạn chỉ được quản lý khóa học do mình sở hữu");
        }
        if (!CurrentUser.isAdmin(user) && !user.hasRole(Roles.TUTOR)) {
            throw new ForbiddenOperationException("Chỉ giảng viên mới được quản lý khóa học");
        }
        return course;
    }

    public void requireEnrolledStudent(User student, UUID courseId) {
        CurrentUser.require(student);
        getCourse(courseId); // kiểm tra khóa học tồn tại
        if (CurrentUser.isAdmin(student)) {
            return;
        }
        if (!enrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, student.getId())) {
            throw new ForbiddenOperationException("Bạn chưa ghi danh khóa học này");
        }
    }

    // =========================================================
    // Mapper helpers
    // =========================================================

    public CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .courseCode(course.getCourseCode())
                .tutorId(course.getTutor().getId())
                .tutorName(course.getTutor().getFullName())
                .createdAt(course.getCreatedAt())
                .hasEnrollmentKey(course.getEnrollmentKey() != null && !course.getEnrollmentKey().isBlank())
                .build();
    }

    private EnrollmentResponse toEnrollmentResponse(CourseEnrollment enrollment) {
        Course course = enrollment.getCourse();
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseDescription(course.getDescription())
                .courseCode(course.getCourseCode())
                .price(course.getPrice())
                .hasEnrollmentKey(course.getEnrollmentKey() != null && !course.getEnrollmentKey().isBlank())
                .tutorId(course.getTutor().getId())
                .tutorName(course.getTutor().getFullName())
                .enrolledAt(enrollment.getEnrolledAt())
                .courseCreatedAt(course.getCreatedAt())
                .build();
    }

    /**
     * Map Course thành CourseDetailResponse.
     *
     * @param hideFileUrl nếu true thì ẩn fileUrl (dùng cho Marketplace công khai)
     */
    private CourseDetailResponse toDetailResponse(Course course, boolean hideFileUrl) {
        List<LessonMaterialResponse> materials = course.getMaterials().stream()
                .map(m -> mapMaterial(m, hideFileUrl))
                .toList();

        List<AssignmentResponse> assignments = course.getAssignments().stream()
                .map(this::mapAssignment)
                .toList();

        long count = enrollmentRepository.countByCourse_Id(course.getId());

        return CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .courseCode(course.getCourseCode())
                .tutorId(course.getTutor().getId())
                .tutorName(course.getTutor().getFullName())
                .createdAt(course.getCreatedAt())
                .enrollmentCount(count)
                .hasEnrollmentKey(course.getEnrollmentKey() != null && !course.getEnrollmentKey().isBlank())
                .materials(materials)
                .assignments(assignments)
                .build();
    }

    /** Marketplace công khai — ẩn fileUrl */
    private CourseDetailResponse toDetailResponsePublic(Course course) {
        return toDetailResponse(course, true);
    }

    private LessonMaterialResponse mapMaterial(LessonMaterial m, boolean hideFileUrl) {
        return LessonMaterialResponse.builder()
                .id(m.getId())
                .courseId(m.getCourse().getId())
                .tutorId(m.getTutor().getId())
                .title(m.getTitle())
                .fileUrl(hideFileUrl ? null : m.getFileUrl())
                .lectureLink(m.getLectureLink())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private AssignmentResponse mapAssignment(Assignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .courseId(a.getCourse().getId())
                .title(a.getTitle())
                .content(a.getContent())
                .dueAt(a.getDueAt())
                .createdAt(a.getCreatedAt())
                .build();
    }
}

