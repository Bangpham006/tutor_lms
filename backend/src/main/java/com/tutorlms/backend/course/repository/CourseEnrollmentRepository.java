package com.tutorlms.backend.course.repository;

import com.tutorlms.backend.course.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {

    boolean existsByCourse_IdAndStudent_Id(UUID courseId, UUID studentId);

    Optional<CourseEnrollment> findByCourse_IdAndStudent_Id(UUID courseId, UUID studentId);

    List<CourseEnrollment> findByStudent_IdOrderByEnrolledAtDesc(UUID studentId);
}
