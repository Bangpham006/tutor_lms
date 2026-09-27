package com.tutorlms.backend.market.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.auth.repository.UserRepository;
import com.tutorlms.backend.common.exception.BadRequestException;
import com.tutorlms.backend.common.exception.ResourceNotFoundException;
import com.tutorlms.backend.market.dto.MarketApplicationRequest;
import com.tutorlms.backend.market.dto.MarketApplicationResponse;
import com.tutorlms.backend.market.entity.MarketApplication;
import com.tutorlms.backend.market.entity.MarketPost;
import com.tutorlms.backend.market.repository.MarketApplicationRepository;
import com.tutorlms.backend.market.repository.MarketPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketApplicationService {

    private final MarketApplicationRepository applicationRepo;
    private final MarketPostRepository postRepo;
    private final UserRepository userRepo;

    @Transactional
    public MarketApplicationResponse applyToPost(User currentUser, UUID postId, MarketApplicationRequest request) {
        MarketPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết ID: " + postId));

        User tutor = currentUser;
        if (tutor == null) {
            // Find a default tutor if unauthenticated
            tutor = userRepo.findAll().stream()
                    .filter(u -> "ROLE_TUTOR".equals(u.getRole()) || "TUTOR".equals(u.getRole()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Vui lòng đăng nhập tài khoản Gia Sư để ứng tuyển"));
        }

        // Check if tutor already applied
        if (applicationRepo.existsByPost_IdAndTutor_Id(postId, tutor.getId())) {
            throw new BadRequestException("Bạn đã gửi hồ sơ ứng tuyển vào lớp này rồi!");
        }

        String phone = request.getPhoneContact();
        if (phone == null || phone.isBlank()) {
            phone = tutor.getPhone();
        }

        String expectedRate = request.getExpectedRate();
        if (expectedRate == null || expectedRate.isBlank()) {
            expectedRate = post.getFee();
        }

        MarketApplication application = MarketApplication.builder()
                .post(post)
                .tutor(tutor)
                .tutorName(tutor.getFullName())
                .tutorAvatar(tutor.getAvatarUrl())
                .introduction(request.getIntroduction())
                .expectedRate(expectedRate)
                .phoneContact(phone)
                .status(MarketApplication.Status.PENDING)
                .build();

        MarketApplication saved = applicationRepo.save(application);

        // Update applications count on post
        post.setApplicationsCount((int) applicationRepo.countByPost_Id(postId));
        postRepo.save(post);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MarketApplicationResponse> getApplicationsForPost(UUID postId) {
        return applicationRepo.findByPost_IdOrderByCreatedAtDesc(postId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketApplicationResponse> getMyApplications(User currentUser) {
        if (currentUser == null) return List.of();
        return applicationRepo.findByTutor_IdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MarketApplicationResponse updateStatus(User currentUser, UUID applicationId, String newStatus) {
        if (currentUser == null) {
            throw new BadRequestException("Vui lòng đăng nhập để duyệt đơn ứng tuyển!");
        }

        MarketApplication app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển ID: " + applicationId));

        MarketPost post = app.getPost();
        boolean isAuthor = (post.getAuthorId() != null && post.getAuthorId().equals(currentUser.getId()))
                || (post.getAuthorName() != null && post.getAuthorName().equalsIgnoreCase(currentUser.getFullName()));
        boolean isAdmin = currentUser.hasRole("ROLE_ADMIN");

        if (!isAuthor && !isAdmin) {
            throw new com.tutorlms.backend.common.exception.ForbiddenOperationException(
                    "Chỉ tài khoản người đăng bài viết này mới có quyền duyệt gia sư nhận lớp!");
        }

        MarketApplication.Status statusEnum = MarketApplication.Status.valueOf(newStatus.toUpperCase());
        app.setStatus(statusEnum);
        MarketApplication saved = applicationRepo.save(app);

        // If accepted, update the post status to MATCHED (Đã ghép lớp thành công)
        if (statusEnum == MarketApplication.Status.ACCEPTED) {
            post.setStatus("MATCHED");
            postRepo.save(post);
        }

        return toResponse(saved);
    }

    public MarketApplicationResponse toResponse(MarketApplication app) {
        return MarketApplicationResponse.builder()
                .id(app.getId())
                .postId(app.getPost().getId())
                .postSubject(app.getPost().getSubject() != null ? app.getPost().getSubject() : app.getPost().getContent())
                .tutorId(app.getTutor().getId())
                .tutorName(app.getTutorName())
                .tutorAvatar(app.getTutorAvatar())
                .introduction(app.getIntroduction())
                .expectedRate(app.getExpectedRate())
                .phoneContact(app.getPhoneContact())
                .status(app.getStatus().name())
                .createdAt(app.getCreatedAt())
                .build();
    }
}
