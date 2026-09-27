package com.tutorlms.backend.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPostResponse {
    private UUID id;
    private UUID authorId;
    private String authorName;
    private String authorAvatar;
    private String authorRole;
    private String badgeType;
    private String content;
    private String subject;
    private String gradeLevel;
    private String location;
    private String schedule;
    private String fee;
    private String status;
    private String mediaUrl;
    private int likesCount;
    private boolean hasLiked;
    private java.util.List<String> likedUserNames;
    private int commentsCount;
    private int applicationsCount;
    private LocalDateTime createdAt;
}
