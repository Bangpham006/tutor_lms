package com.tutorlms.backend.assignment.repository;

import com.tutorlms.backend.assignment.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {

    Optional<AssignmentSubmission> findByAssignment_IdAndStudent_Id(UUID assignmentId, UUID studentId);

    List<AssignmentSubmission> findByAssignment_IdOrderBySubmittedAtDesc(UUID assignmentId);
}
