package com.tutorlms.backend.course.repository;

import com.tutorlms.backend.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findByTutor_IdOrderByCreatedAtDesc(UUID tutorId);

    /**
     * Tìm kiếm khóa học theo từ khóa (title hoặc description) và/hoặc tutorId.
     * Nếu tham số là null thì điều kiện tương ứng bị bỏ qua (match all).
     */
    @Query("""
            SELECT c FROM Course c
            WHERE (:keyword IS NULL
                   OR LOWER(c.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                   OR LOWER(c.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
              AND (:tutorId IS NULL OR c.tutor.id = :tutorId)
            ORDER BY c.createdAt DESC
            """)
    List<Course> searchCourses(@Param("keyword") String keyword,
                               @Param("tutorId") UUID tutorId);
}
