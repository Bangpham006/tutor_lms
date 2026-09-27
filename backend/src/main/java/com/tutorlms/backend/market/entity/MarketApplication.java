package com.tutorlms.backend.market.entity;

import com.tutorlms.backend.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "market_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketApplication {

    public enum Status {
        PENDING,   // Chờ phản hồi từ phụ huynh / chủ bài viết
        ACCEPTED,  // Được chọn nhận lớp
        REJECTED   // Bị từ chối
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private MarketPost post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(name = "tutor_name", nullable = false)
    private String tutorName;

    @Column(name = "tutor_avatar")
    private String tutorAvatar;

    @Column(name = "introduction", columnDefinition = "text", nullable = false)
    private String introduction;

    @Column(name = "expected_rate")
    private String expectedRate;

    @Column(name = "phone_contact")
    private String phoneContact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
