package com.tutorlms.backend.assignment.repository;

import com.tutorlms.backend.assignment.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    List<Assignment> findByCourse_IdOrderByDueAtAsc(UUID courseId);
}
