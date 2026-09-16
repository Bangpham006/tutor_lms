package com.tutorlms.backend.chat.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.chat.dto.ChatMessageResponse;
import com.tutorlms.backend.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API lay lich su chat khi user load phong.
 * GET /api/v1/chat/course/{courseId}/history?limit=50
 */
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ChatRestController {

    private final ChatService chatService;

    @GetMapping("/course/{courseId}/history")
    public ResponseEntity<List<ChatMessageResponse>> getHistory(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID courseId,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(chatService.getHistory(currentUser, courseId, limit));
    }
}