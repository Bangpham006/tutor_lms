package com.tutorlms.backend.chat.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.chat.dto.ChatMessageRequest;
import com.tutorlms.backend.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

/**
 * STOMP MessageMapping cho chat realtime.
 *
 * Client gui:    /app/course/{courseId}/send-message
 * Broadcast den: /topic/course/{courseId}/chat  (tu dong trong ChatService)
 */
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/course/{courseId}/send-message")
    public void sendMessage(
            @DestinationVariable UUID courseId,
            ChatMessageRequest request,
            Principal principal) {
        User sender = (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        chatService.sendMessage(sender, courseId, request);
    }
}