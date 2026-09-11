package com.tutorlms.backend.course.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.ForbiddenOperationException;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.common.security.CurrentUser;
import com.tutorlms.backend.common.security.Roles;
import com.tutorlms.backend.course.dto.CourseRequest;
import com.tutorlms.backend.course.dto.CourseResponse;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.entity.CourseEnrollment;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.course.repository.CourseRepository;
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

    @Transactional
    public CourseResponse create(User tutor, CourseRequest request) {
        CurrentUser.require(tutor);
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
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
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void delete(User tutor, UUID courseId) {
        Course course = requireOwnedCourse(tutor, courseId);
        courseRepository.delete(course);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> catalog() {
        return courseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public CourseResponse enroll(User student, UUID courseId) {
        CurrentUser.require(student);
        Course course = getCourse(courseId);
        if (enrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, student.getId())) {
            return toResponse(course);
        }
        enrollmentRepository.save(CourseEnrollment.builder()
                .course(course)
                .student(student)
                .build());
        return toResponse(course);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> listEnrolled(User student) {
        CurrentUser.require(student);
        return enrollmentRepository.findByStudent_IdOrderByEnrolledAtDesc(student.getId()).stream()
                .map(CourseEnrollment::getCourse)
                .map(this::toResponse)
                .toList();
    }

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
        getCourse(courseId);
        if (CurrentUser.isAdmin(student)) {
            return;
        }
        if (!student.hasRole(Roles.STUDENT) && !student.hasRole(Roles.PARENT)) {
            throw new ForbiddenOperationException("Chỉ học viên mới truy cập tài nguyên học tập này");
        }
        if (!enrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, student.getId())) {
            throw new ForbiddenOperationException("Bạn chưa ghi danh khóa học này");
        }
    }

    public CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .tutorId(course.getTutor().getId())
                .tutorName(course.getTutor().getFullName())
                .createdAt(course.getCreatedAt())
                .build();
    }
}
