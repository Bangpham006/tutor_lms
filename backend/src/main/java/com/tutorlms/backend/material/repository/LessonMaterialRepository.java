package com.tutorlms.backend.material.repository;

import com.tutorlms.backend.material.entity.LessonMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LessonMaterialRepository extends JpaRepository<LessonMaterial, UUID> {

    List<LessonMaterial> findByCourse_IdOrderByCreatedAtDesc(UUID courseId);
}
