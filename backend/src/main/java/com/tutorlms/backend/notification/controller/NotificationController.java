package com.tutorlms.backend.notification.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.notification.dto.NotificationResponse;
import com.tutorlms.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PARENT', 'ROLE_ADMIN')")
public class NotificationController {

    private final NotificationService notificationService;

    /** Lay danh sach thong bao */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(notificationService.getMyNotifications(currentUser));
    }

    /** So thong bao chua doc -- hien badge tren UI */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> countUnread(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(Map.of("unread", notificationService.countUnread(currentUser)));
    }

    /** Danh dau tat ca la da doc */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllRead(currentUser);
        return ResponseEntity.noContent().build();
    }

    /** Danh dau 1 thong bao la da doc */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markOneRead(
            @AuthenticationPrincipal User currentUser, @PathVariable UUID id) {
        notificationService.markOneRead(currentUser, id);
        return ResponseEntity.noContent().build();
    }
}