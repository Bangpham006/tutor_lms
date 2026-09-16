package com.tutorlms.backend.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationResponse {
    private UUID id;
    private String type;
    private String title;
    private String body;
    private UUID courseId;
    private String courseTitle;
    private UUID referenceId;
    private boolean read;
    private LocalDateTime createdAt;
}