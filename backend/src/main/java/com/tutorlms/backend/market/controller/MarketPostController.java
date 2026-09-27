package com.tutorlms.backend.market.controller;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.market.dto.*;
import com.tutorlms.backend.market.service.MarketApplicationService;
import com.tutorlms.backend.market.service.MarketCommentService;
import com.tutorlms.backend.market.service.MarketPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketPostController {

    private final MarketPostService marketPostService;
    private final MarketCommentService marketCommentService;
    private final MarketApplicationService marketApplicationService;

    // =========================================================
    // 1. BÀI ĐĂNG CHỢ GHÉP LỚP (POSTS)
    // =========================================================

    @GetMapping("/posts")
    public ResponseEntity<List<MarketPostResponse>> getAllPosts(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(marketPostService.getAllPosts(currentUser));
    }

    @PostMapping("/posts")
    public ResponseEntity<MarketPostResponse> createPost(
            @AuthenticationPrincipal User currentUser,
            @RequestBody MarketPostRequest request
    ) {
        return ResponseEntity.ok(marketPostService.createPost(currentUser, request));
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<MarketPostResponse> likePost(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID postId
    ) {
        return ResponseEntity.ok(marketPostService.likePost(currentUser, postId));
    }

    @PatchMapping("/posts/{postId}/status")
    public ResponseEntity<MarketPostResponse> updatePostStatus(
            @PathVariable UUID postId,
            @RequestBody Map<String, String> body
    ) {
        String status = body.getOrDefault("status", "OPEN");
        return ResponseEntity.ok(marketPostService.updateStatus(postId, status));
    }

    // =========================================================
    // 2. BÌNH LUẬN BÀI VIẾT (COMMENTS)
    // =========================================================

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<MarketCommentResponse>> getComments(@PathVariable UUID postId) {
        return ResponseEntity.ok(marketCommentService.getComments(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<MarketCommentResponse> addComment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID postId,
            @Valid @RequestBody MarketCommentRequest request
    ) {
        return ResponseEntity.ok(marketCommentService.addComment(currentUser, postId, request));
    }

    // =========================================================
    // 3. ỨNG TUYỂN NHẬN LỚP (TUTOR APPLICATIONS)
    // =========================================================

    @PostMapping("/posts/{postId}/apply")
    public ResponseEntity<MarketApplicationResponse> applyToPost(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID postId,
            @Valid @RequestBody MarketApplicationRequest request
    ) {
        return ResponseEntity.ok(marketApplicationService.applyToPost(currentUser, postId, request));
    }

    @GetMapping("/posts/{postId}/applications")
    public ResponseEntity<List<MarketApplicationResponse>> getApplicationsForPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(marketApplicationService.getApplicationsForPost(postId));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<List<MarketApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(marketApplicationService.getMyApplications(currentUser));
    }

    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<MarketApplicationResponse> updateApplicationStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID applicationId,
            @RequestBody Map<String, String> body
    ) {
        String status = body.getOrDefault("status", "ACCEPTED");
        return ResponseEntity.ok(marketApplicationService.updateStatus(currentUser, applicationId, status));
    }
}
