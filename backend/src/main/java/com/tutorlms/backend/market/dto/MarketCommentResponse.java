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
public class MarketCommentResponse {
    private UUID id;
    private UUID postId;
    private UUID userId;
    private String userName;
    private String userAvatar;
    private String userRole;
    private String content;
    private LocalDateTime createdAt;
}
