package com.tutorlms.backend.notification.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.entity.CourseEnrollment;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.notification.dto.NotificationResponse;
import com.tutorlms.backend.notification.entity.Notification;
import com.tutorlms.backend.notification.repository.NotificationRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepo;
    @Mock private CourseEnrollmentRepository enrollmentRepo;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    private User student1;
    private User student2;
    private Course course;

    @BeforeEach
    void setUp() {
        student1 = User.builder().id(UUID.randomUUID()).fullName("Student 1").build();
        student2 = User.builder().id(UUID.randomUUID()).fullName("Student 2").build();

        course = Course.builder()
                .id(UUID.randomUUID())
                .title("Khoa hoc Hoa hoc")
                .build();
    }

    @Test
    @DisplayName("broadcastToEnrolledStudents luu notification vao DB va push qua STOMP den cac hoc vien")
    void broadcastToEnrolledStudents_persistsAndBroadcasts() {
        CourseEnrollment e1 = CourseEnrollment.builder().course(course).student(student1).build();
        CourseEnrollment e2 = CourseEnrollment.builder().course(course).student(student2).build();

        when(enrollmentRepo.findByCourse_IdOrderByEnrolledAtDesc(course.getId()))
                .thenReturn(List.of(e1, e2));

        when(notificationRepo.save(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            n.setId(UUID.randomUUID());
            n.setCreatedAt(LocalDateTime.now());
            return n;
        });

        UUID assignmentId = UUID.randomUUID();
        notificationService.broadcastToEnrolledStudents(
                course,
                Notification.Type.NEW_ASSIGNMENT,
                "Bai tap moi: Hoa Vo Co",
                "Han nop 3 ngay toi",
                assignmentId
        );

        // Luu 2 thong bao cho 2 student
        verify(notificationRepo, times(2)).save(any(Notification.class));
        // Push rieng cho tung user
        verify(messagingTemplate, times(2)).convertAndSendToUser(anyString(), eq("/queue/notifications"), any(NotificationResponse.class));
        // Broadcast phong
        verify(messagingTemplate).convertAndSend(eq("/topic/course/" + course.getId() + "/notify"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("broadcastToOneStudent chi luu va push den 1 hoc vien cu the")
    void broadcastToOneStudent_sendsToTargetStudent() {
        when(notificationRepo.save(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            n.setId(UUID.randomUUID());
            n.setCreatedAt(LocalDateTime.now());
            return n;
        });

        notificationService.broadcastToOneStudent(
                student1,
                course,
                Notification.Type.SCORE_PUBLISHED,
                "Diem bai tap da co",
                "Ban duoc 9.5 diem",
                UUID.randomUUID()
        );

        verify(notificationRepo, times(1)).save(any(Notification.class));
        verify(messagingTemplate).convertAndSendToUser(eq(student1.getId().toString()), eq("/queue/notifications"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("countUnread dem so thong bao chua doc")
    void countUnread_returnsCount() {
        when(notificationRepo.countByRecipient_IdAndReadFalse(student1.getId())).thenReturn(5L);

        long unread = notificationService.countUnread(student1);

        assertThat(unread).isEqualTo(5L);
    }
}