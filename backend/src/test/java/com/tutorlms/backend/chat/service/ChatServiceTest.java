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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock private ChatMessageRepository chatRepo;
    @Mock private CourseService courseService;
    @Mock private CourseEnrollmentRepository enrollmentRepo;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    private User tutor;
    private User student;
    private Course course;

    @BeforeEach
    void setUp() {
        tutor = User.builder()
                .id(UUID.randomUUID())
                .fullName("Gia su 1")
                .role("ROLE_TUTOR")
                .build();

        student = User.builder()
                .id(UUID.randomUUID())
                .fullName("Hoc vien 1")
                .role("ROLE_STUDENT")
                .build();

        course = Course.builder()
                .id(UUID.randomUUID())
                .title("Lop Toan Nang Cao")
                .tutor(tutor)
                .build();
    }

    @Test
    @DisplayName("sendMessage boi Tutor so huu khoa hoc -> luu DB va broadcast qua STOMP")
    void sendMessage_asTutor_savesAndBroadcasts() {
        when(courseService.getCourse(course.getId())).thenReturn(course);
        when(chatRepo.save(any(ChatMessage.class))).thenAnswer(inv -> {
            ChatMessage m = inv.getArgument(0);
            m.setId(UUID.randomUUID());
            m.setSentAt(LocalDateTime.now());
            return m;
        });

        ChatMessageRequest req = new ChatMessageRequest();
        req.setContent("Chao cac em, hom nay hoc chuong 3");

        ChatMessageResponse res = chatService.sendMessage(tutor, course.getId(), req);

        assertThat(res.getContent()).isEqualTo("Chao cac em, hom nay hoc chuong 3");
        assertThat(res.getSenderName()).isEqualTo("Gia su 1");
        verify(chatRepo).save(any(ChatMessage.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/course/" + course.getId() + "/chat"), any(ChatMessageResponse.class));
    }

    @Test
    @DisplayName("sendMessage boi Student chua ghi danh -> nem loi ForbiddenOperationException")
    void sendMessage_notEnrolled_throwsForbidden() {
        when(courseService.getCourse(course.getId())).thenReturn(course);
        when(enrollmentRepo.existsByCourse_IdAndStudent_Id(course.getId(), student.getId()))
                .thenReturn(false);

        ChatMessageRequest req = new ChatMessageRequest();
        req.setContent("Co ai o day khong?");

        assertThatThrownBy(() -> chatService.sendMessage(student, course.getId(), req))
                .isInstanceOf(ForbiddenOperationException.class);

        verify(chatRepo, never()).save(any());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    @DisplayName("getHistory tra ve lich su chat sap xep moi nhat truoc")
    void getHistory_returnsRecentMessages() {
        when(courseService.getCourse(course.getId())).thenReturn(course);

        ChatMessage msg1 = ChatMessage.builder()
                .id(UUID.randomUUID())
                .course(course)
                .sender(tutor)
                .content("Tin nhan 1")
                .sentAt(LocalDateTime.now())
                .build();

        when(chatRepo.findByCourse_IdOrderBySentAtDesc(eq(course.getId()), any()))
                .thenReturn(List.of(msg1));

        List<ChatMessageResponse> history = chatService.getHistory(tutor, course.getId(), 50);

        assertThat(history).hasSize(1);
        assertThat(history.get(0).getContent()).isEqualTo("Tin nhan 1");
    }
}