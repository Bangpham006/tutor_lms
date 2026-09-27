package com.tutorlms.backend.course.entity;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.assignment.entity.Assignment;
import com.tutorlms.backend.material.entity.LessonMaterial;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    /**
     * Gia khoa hoc (VND). price = 0 nghia la mien phi, tu dong enroll khong can thanh toan.
     */
    @Column(nullable = false, precision = 12, scale = 0)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;


    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    private String courseCode;

    /**
     * Mật khẩu ghi danh / Mã vào lớp (Enrollment Key).
     * Nếu null hoặc rỗng nghĩa là khóa học mở (không cần mật khẩu).
     */
    @Column(name = "enrollment_key", length = 100)
    private String enrollmentKey;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LessonMaterial> materials = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Assignment> assignments = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CourseEnrollment> enrollments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.courseCode == null) {
            this.courseCode = "CRS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
