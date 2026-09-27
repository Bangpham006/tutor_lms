package com.tutorlms.backend.market.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.auth.repository.UserRepository;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.market.dto.MarketCommentRequest;
import com.tutorlms.backend.market.dto.MarketCommentResponse;
import com.tutorlms.backend.market.entity.MarketComment;
import com.tutorlms.backend.market.entity.MarketPost;
import com.tutorlms.backend.market.repository.MarketCommentRepository;
import com.tutorlms.backend.market.repository.MarketPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketCommentService {

    private final MarketCommentRepository commentRepo;
    private final MarketPostRepository postRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public List<MarketCommentResponse> getComments(UUID postId) {
        return commentRepo.findByPost_IdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MarketCommentResponse addComment(User currentUser, UUID postId, MarketCommentRequest request) {
        MarketPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết ID: " + postId));

        User user = currentUser;
        if (user == null) {
            // Fallback to first student or system user if unauthenticated
            user = userRepo.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng"));
        }

        String userName = currentUser != null ? currentUser.getFullName() : request.getAuthorName();
        if (userName == null || userName.isBlank()) userName = user.getFullName();

        String userAvatar = currentUser != null ? currentUser.getAvatarUrl() : request.getAuthorAvatar();
        if (userAvatar == null || userAvatar.isBlank()) userAvatar = user.getAvatarUrl();

        String userRole = currentUser != null ? currentUser.getRole() : request.getAuthorRole();
        if (userRole == null || userRole.isBlank()) userRole = user.getRole();

        MarketComment comment = MarketComment.builder()
                .post(post)
                .user(user)
                .userName(userName)
                .userAvatar(userAvatar)
                .userRole(userRole)
                .content(request.getContent())
                .build();

        MarketComment saved = commentRepo.save(comment);

        // Update comments count on post
        post.setCommentsCount((int) commentRepo.countByPost_Id(postId));
        postRepo.save(post);

        return toResponse(saved);
    }

    public MarketCommentResponse toResponse(MarketComment comment) {
        return MarketCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUserName())
                .userAvatar(comment.getUserAvatar())
                .userRole(comment.getUserRole())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
