package com.tutorlms.backend.chat.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ChatMessageResponse {
    private UUID id;
    private UUID courseId;
    private UUID senderId;
    private String senderName;
    private String senderRole;
    private String content;
    private LocalDateTime sentAt;
}