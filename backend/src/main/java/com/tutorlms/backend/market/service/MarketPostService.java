package com.tutorlms.backend.market.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.BadRequestException;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.market.dto.MarketPostRequest;
import com.tutorlms.backend.market.dto.MarketPostResponse;
import com.tutorlms.backend.market.entity.MarketPost;
import com.tutorlms.backend.market.entity.MarketPostLike;
import com.tutorlms.backend.market.repository.MarketPostLikeRepository;
import com.tutorlms.backend.market.repository.MarketPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketPostService {

    private final MarketPostRepository marketPostRepository;
    private final MarketPostLikeRepository marketPostLikeRepository;

    @Transactional(readOnly = true)
    public List<MarketPostResponse> getAllPosts(User currentUser) {
        List<MarketPost> posts = marketPostRepository.findAllByOrderByCreatedAtDesc();

        // Xác định danh sách bài viết currentUser đã bấm Like
        Set<UUID> likedPostIds = new HashSet<>();
        if (currentUser != null) {
            List<MarketPostLike> myLikes = marketPostLikeRepository.findByUser_Id(currentUser.getId());
            likedPostIds = myLikes.stream()
                    .map(like -> like.getPost().getId())
                    .collect(Collectors.toSet());
        }

        final Set<UUID> finalLikedPostIds = likedPostIds;
        return posts.stream()
                .map(post -> toResponse(post, finalLikedPostIds.contains(post.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public MarketPostResponse createPost(User currentUser, MarketPostRequest request) {
        String authorName = request.getAuthorName();
        String authorAvatar = request.getAuthorAvatar();
        String authorRole = request.getAuthorRole();
        UUID authorId = request.getAuthorId();

        if (currentUser != null) {
            authorId = currentUser.getId();
            if (authorName == null || authorName.isBlank()) {
                authorName = currentUser.getFullName();
            }
            if (authorAvatar == null || authorAvatar.isBlank()) {
                authorAvatar = currentUser.getAvatarUrl();
            }
            if (authorRole == null || authorRole.isBlank()) {
                authorRole = currentUser.getRole();
            }
        }

        MarketPost post = MarketPost.builder()
                .authorId(authorId)
                .authorName(authorName != null ? authorName : "Người dùng TutorLMS")
                .authorAvatar(authorAvatar)
                .authorRole(authorRole != null ? authorRole : "PHU_HUYNH")
                .badgeType(request.getBadgeType() != null ? request.getBadgeType() : "TUYEN_GIA_SU")
                .content(request.getContent())
                .subject(request.getSubject())
                .gradeLevel(request.getGradeLevel())
                .location(request.getLocation())
                .schedule(request.getSchedule())
                .fee(request.getFee())
                .status("OPEN")
                .mediaUrl(request.getMediaUrl())
                .likesCount(0)
                .commentsCount(0)
                .applicationsCount(0)
                .build();

        MarketPost saved = marketPostRepository.save(post);
        return toResponse(saved, false);
    }

    @Transactional
    public MarketPostResponse likePost(User currentUser, UUID postId) {
        if (currentUser == null) {
            throw new BadRequestException("Vui lòng đăng nhập để thích bài viết!");
        }

        MarketPost post = marketPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết ID: " + postId));

        Optional<MarketPostLike> existingLike = marketPostLikeRepository.findByPost_IdAndUser_Id(postId, currentUser.getId());
        boolean hasLiked;

        if (existingLike.isPresent()) {
            // Đã like -> Huỷ like (Unlike)
            marketPostLikeRepository.delete(existingLike.get());
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            hasLiked = false;
        } else {
            // Chưa like -> Thêm like mới
            MarketPostLike newLike = MarketPostLike.builder()
                    .post(post)
                    .user(currentUser)
                    .build();
            marketPostLikeRepository.save(newLike);
            post.setLikesCount(post.getLikesCount() + 1);
            hasLiked = true;
        }

        MarketPost saved = marketPostRepository.save(post);
        return toResponse(saved, hasLiked);
    }

    @Transactional
    public MarketPostResponse updateStatus(UUID postId, String newStatus) {
        MarketPost post = marketPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết ID: " + postId));
        post.setStatus(newStatus != null ? newStatus.toUpperCase() : "OPEN");
        return toResponse(marketPostRepository.save(post), false);
    }

    public MarketPostResponse toResponse(MarketPost post, boolean hasLiked) {
        // Lấy danh sách tên những người đã like bài viết để hiển thị tooltip
        List<String> likedUserNames = marketPostLikeRepository.findByPost_Id(post.getId())
                .stream()
                .map(l -> l.getUser() != null ? l.getUser().getFullName() : null)
                .filter(Objects::nonNull)
                .limit(5)
                .collect(Collectors.toList());

        return MarketPostResponse.builder()
                .id(post.getId())
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .authorAvatar(post.getAuthorAvatar())
                .authorRole(post.getAuthorRole())
                .badgeType(post.getBadgeType())
                .content(post.getContent())
                .subject(post.getSubject())
                .gradeLevel(post.getGradeLevel())
                .location(post.getLocation())
                .schedule(post.getSchedule())
                .fee(post.getFee())
                .status(post.getStatus() != null ? post.getStatus() : "OPEN")
                .mediaUrl(post.getMediaUrl())
                .likesCount(post.getLikesCount())
                .hasLiked(hasLiked)
                .likedUserNames(likedUserNames)
                .commentsCount(post.getCommentsCount())
                .applicationsCount(post.getApplicationsCount())
                .createdAt(post.getCreatedAt())
                .build();
    }

    public MarketPostResponse toResponse(MarketPost post) {
        return toResponse(post, false);
    }
}
