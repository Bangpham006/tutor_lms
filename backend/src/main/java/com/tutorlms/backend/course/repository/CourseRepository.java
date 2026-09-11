package com.tutorlms.backend.course.repository;

import com.tutorlms.backend.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findByTutor_IdOrderByCreatedAtDesc(UUID tutorId);
}
