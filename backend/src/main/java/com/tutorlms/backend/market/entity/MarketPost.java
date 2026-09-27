package com.tutorlms.backend.market.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "market_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_id")
    private UUID authorId;

    @Column(name = "author_avatar")
    private String authorAvatar;

    @Column(name = "author_role")
    private String authorRole; // PHU_HUYNH, GIA_SU, HOC_VIEN

    @Column(name = "badge_type", nullable = false)
    private String badgeType; // TUYEN_GIA_SU, CHIA_SE_KIEN_THUC, VIDEO

    @Column(columnDefinition = "text", nullable = false)
    private String content;

    // Các thông tin chi tiết nếu là tin tuyển gia sư
    private String subject;

    @Column(name = "grade_level")
    private String gradeLevel;

    private String location;
    private String schedule;
    private String fee;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "OPEN"; // OPEN (Đang tuyển), MATCHED (Đã ghép lớp), CLOSED (Đã đóng)

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "likes_count")
    @Builder.Default
    private int likesCount = 0;

    @Column(name = "comments_count")
    @Builder.Default
    private int commentsCount = 0;

    @Column(name = "applications_count")
    @Builder.Default
    private int applicationsCount = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
