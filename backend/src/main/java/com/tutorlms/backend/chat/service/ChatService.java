package com.tutorlms.backend.chat.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.chat.dto.ChatMessageRequest;
import com.tutorlms.backend.chat.dto.ChatMessageResponse;
import com.tutorlms.backend.chat.entity.ChatMessage;
import com.tutorlms.backend.chat.repository.ChatMessageRepository;
import com.tutorlms.backend.common.exception.ForbiddenOperationException;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatRepo;
    private final CourseService courseService;
    private final CourseEnrollmentRepository enrollmentRepo;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gui tin nhan chat: luu DB + broadcast realtime den /topic/course/{id}/chat
     * Chi tutor so huu hoac student da enrolled hoac admin moi duoc gui.
     */
    @Transactional
    public ChatMessageResponse sendMessage(User sender, UUID courseId, ChatMessageRequest req) {
        Course course = courseService.getCourse(courseId);
        assertCanChat(sender, course);

        ChatMessage msg = chatRepo.save(ChatMessage.builder()
                .course(course).sender(sender).content(req.getContent()).build());

        ChatMessageResponse resp = toResponse(msg);
        messagingTemplate.convertAndSend("/topic/course/" + courseId + "/chat", resp);
        log.debug("Chat sent: course={} sender={}", courseId, sender.getId());
        return resp;
    }

    /**
     * Lay lich su chat (REST) -- hien thi khi user mo phong.
     * Tra ve toi da 100 tin nhan moi nhat.
     */
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getHistory(User user, UUID courseId, int limit) {
        Course course = courseService.getCourse(courseId);
        assertCanChat(user, course);
        return chatRepo.findByCourse_IdOrderBySentAtDesc(
                courseId, PageRequest.of(0, Math.min(limit, 100)))
                .stream().map(this::toResponse).toList();
    }

    private void assertCanChat(User user, Course course) {
        boolean isTutor = course.getTutor().getId().equals(user.getId());
        boolean isEnrolled = enrollmentRepo.existsByCourse_IdAndStudent_Id(course.getId(), user.getId());
        boolean isAdmin = user.hasRole("ROLE_ADMIN");
        if (!isTutor && !isEnrolled && !isAdmin) {
            throw new ForbiddenOperationException("Ban chua tham gia khoa hoc nay, khong the tham gia chat");
        }
    }

    public ChatMessageResponse toResponse(ChatMessage m) {
        return ChatMessageResponse.builder()
                .id(m.getId()).courseId(m.getCourse().getId())
                .senderId(m.getSender().getId()).senderName(m.getSender().getFullName())
                .senderRole(m.getSender().getRole()).content(m.getContent()).sentAt(m.getSentAt())
                .build();
    }
}