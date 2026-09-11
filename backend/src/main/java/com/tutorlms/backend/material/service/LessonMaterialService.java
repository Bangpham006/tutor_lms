package com.tutorlms.backend.material.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.service.CourseService;
import com.tutorlms.backend.material.dto.LessonMaterialRequest;
import com.tutorlms.backend.material.dto.LessonMaterialResponse;
import com.tutorlms.backend.material.entity.LessonMaterial;
import com.tutorlms.backend.material.repository.LessonMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonMaterialService {

    private final LessonMaterialRepository materialRepository;
    private final CourseService courseService;

    @Transactional
    public LessonMaterialResponse create(User tutor, UUID courseId, LessonMaterialRequest request) {
        Course course = courseService.requireOwnedCourse(tutor, courseId);
        LessonMaterial material = LessonMaterial.builder()
                .title(request.getTitle())
                .fileUrl(request.getFileUrl())
                .lectureLink(request.getLectureLink())
                .course(course)
                .tutor(course.getTutor())
                .build();
        return toResponse(materialRepository.save(material));
    }

    @Transactional(readOnly = true)
    public List<LessonMaterialResponse> listForTutor(User tutor, UUID courseId) {
        courseService.requireOwnedCourse(tutor, courseId);
        return materialRepository.findByCourse_IdOrderByCreatedAtDesc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LessonMaterialResponse> listForStudent(User student, UUID courseId) {
        courseService.requireEnrolledStudent(student, courseId);
        return materialRepository.findByCourse_IdOrderByCreatedAtDesc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LessonMaterialResponse update(User tutor, UUID materialId, LessonMaterialRequest request) {
        LessonMaterial material = requireOwnedMaterial(tutor, materialId);
        material.setTitle(request.getTitle());
        material.setFileUrl(request.getFileUrl());
        material.setLectureLink(request.getLectureLink());
        return toResponse(materialRepository.save(material));
    }

    @Transactional
    public void delete(User tutor, UUID materialId) {
        LessonMaterial material = requireOwnedMaterial(tutor, materialId);
        materialRepository.delete(material);
    }

    @Transactional(readOnly = true)
    public LessonMaterial requireOwnedMaterial(User tutor, UUID materialId) {
        LessonMaterial material = getMaterial(materialId);
        courseService.requireOwnedCourse(tutor, material.getCourse().getId());
        return material;
    }

    @Transactional(readOnly = true)
    public LessonMaterial getMaterial(UUID materialId) {
        return materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài liệu bài giảng"));
    }

    public LessonMaterialResponse toResponse(LessonMaterial material) {
        return LessonMaterialResponse.builder()
                .id(material.getId())
                .courseId(material.getCourse().getId())
                .tutorId(material.getTutor() != null ? material.getTutor().getId() : material.getCourse().getTutor().getId())
                .title(material.getTitle())
                .fileUrl(material.getFileUrl())
                .lectureLink(material.getLectureLink())
                .createdAt(material.getCreatedAt())
                .build();
    }
}
