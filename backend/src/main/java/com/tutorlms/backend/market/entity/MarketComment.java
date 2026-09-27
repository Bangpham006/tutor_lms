package com.tutorlms.backend.market.entity;

import com.tutorlms.backend.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "market_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private MarketPost post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_avatar")
    private String userAvatar;

    @Column(name = "user_role")
    private String userRole; // ROLE_TUTOR, ROLE_STUDENT, ROLE_PARENT, ROLE_ADMIN

    @Column(columnDefinition = "text", nullable = false)
    private String content;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
