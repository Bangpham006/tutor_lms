package com.tutorlms.backend.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketPostRequest {
    private java.util.UUID authorId;
    private String authorName;
    private String authorAvatar;
    private String authorRole;
    private String badgeType; // TUYEN_GIA_SU, CHIA_SE_KIEN_THUC, VIDEO
    private String content;
    private String subject;
    private String gradeLevel;
    private String location;
    private String schedule;
    private String fee;
    private String status;
    private String mediaUrl;
}
