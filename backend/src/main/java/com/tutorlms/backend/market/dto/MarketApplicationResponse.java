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
public class MarketApplicationResponse {
    private UUID id;
    private UUID postId;
    private String postSubject;
    private UUID tutorId;
    private String tutorName;
    private String tutorAvatar;
    private String introduction;
    private String expectedRate;
    private String phoneContact;
    private String status; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime createdAt;
}
