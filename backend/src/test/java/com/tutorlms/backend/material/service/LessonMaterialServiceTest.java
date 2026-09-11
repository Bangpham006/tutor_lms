package com.tutorlms.backend.material.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.service.CourseService;
import com.tutorlms.backend.material.dto.LessonMaterialRequest;
import com.tutorlms.backend.material.dto.LessonMaterialResponse;
import com.tutorlms.backend.material.entity.LessonMaterial;
import com.tutorlms.backend.material.repository.LessonMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LessonMaterialServiceTest {

    @Mock
    private LessonMaterialRepository materialRepository;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private LessonMaterialService materialService;

    private User tutor;
    private User student;
    private Course course;

    @BeforeEach
    void setUp() {
        tutor = User.builder()
                .id(UUID.randomUUID())
                .phone("0901111111")
                .fullName("Giang vien")
                .role("ROLE_TUTOR")
                .password("secret")
                .build();
        student = User.builder()
                .id(UUID.randomUUID())
                .phone("0902222222")
                .fullName("Hoc vien")
                .role("ROLE_STUDENT")
                .password("secret")
                .build();
        course = Course.builder()
                .id(UUID.randomUUID())
                .title("Toan 12")
                .tutor(tutor)
                .build();
    }

    @Test
    void create_persistsMaterialLinkedToCourseAndTutor() {
        when(courseService.requireOwnedCourse(tutor, course.getId())).thenReturn(course);
        when(materialRepository.save(any(LessonMaterial.class))).thenAnswer(invocation -> {
            LessonMaterial saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        LessonMaterialRequest request = new LessonMaterialRequest();
        request.setTitle("Chuong 1 PDF");
        request.setFileUrl("https://cdn.example.com/chuong1.pdf");
        request.setLectureLink("https://meet.example.com/lecture-1");

        LessonMaterialResponse response = materialService.create(tutor, course.getId(), request);

        ArgumentCaptor<LessonMaterial> captor = ArgumentCaptor.forClass(LessonMaterial.class);
        verify(materialRepository).save(captor.capture());
        assertThat(captor.getValue().getCourse()).isEqualTo(course);
        assertThat(captor.getValue().getTutor()).isEqualTo(tutor);
        assertThat(response.getTitle()).isEqualTo("Chuong 1 PDF");
        assertThat(response.getFileUrl()).isEqualTo("https://cdn.example.com/chuong1.pdf");
        assertThat(response.getTutorId()).isEqualTo(tutor.getId());
        assertThat(response.getCourseId()).isEqualTo(course.getId());
    }

    @Test
    void listForStudent_returnsCourseMaterials() {
        LessonMaterial material = LessonMaterial.builder()
                .id(UUID.randomUUID())
                .title("Bai giang")
                .fileUrl("https://cdn.example.com/a.pdf")
                .course(course)
                .tutor(tutor)
                .createdAt(LocalDateTime.now())
                .build();
        when(materialRepository.findByCourse_IdOrderByCreatedAtDesc(course.getId()))
                .thenReturn(List.of(material));

        List<LessonMaterialResponse> result = materialService.listForStudent(student, course.getId());

        verify(courseService).requireEnrolledStudent(student, course.getId());
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Bai giang");
    }

    @Test
    void update_changesOwnedMaterial() {
        LessonMaterial material = LessonMaterial.builder()
                .id(UUID.randomUUID())
                .title("Cu")
                .fileUrl("old.pdf")
                .course(course)
                .tutor(tutor)
                .build();
        when(materialRepository.findById(material.getId())).thenReturn(Optional.of(material));
        when(courseService.requireOwnedCourse(tutor, course.getId())).thenReturn(course);
        when(materialRepository.save(any(LessonMaterial.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LessonMaterialRequest request = new LessonMaterialRequest();
        request.setTitle("Moi");
        request.setFileUrl("new.pdf");
        request.setLectureLink("https://lecture");

        LessonMaterialResponse response = materialService.update(tutor, material.getId(), request);

        assertThat(response.getTitle()).isEqualTo("Moi");
        assertThat(response.getFileUrl()).isEqualTo("new.pdf");
        assertThat(response.getLectureLink()).isEqualTo("https://lecture");
    }

    @Test
    void delete_removesOwnedMaterial() {
        LessonMaterial material = LessonMaterial.builder()
                .id(UUID.randomUUID())
                .title("Xoa")
                .course(course)
                .tutor(tutor)
                .build();
        when(materialRepository.findById(material.getId())).thenReturn(Optional.of(material));
        when(courseService.requireOwnedCourse(tutor, course.getId())).thenReturn(course);

        materialService.delete(tutor, material.getId());

        verify(materialRepository).delete(material);
    }

    @Test
    void getMaterial_throwsWhenMissing() {
        UUID missingId = UUID.randomUUID();
        when(materialRepository.findById(missingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> materialService.getMaterial(missingId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Không tìm thấy tài liệu bài giảng");
    }
}
