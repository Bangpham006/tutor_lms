package com.tutorlms.backend.notification.service;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.entity.CourseEnrollment;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.notification.dto.NotificationResponse;
import com.tutorlms.backend.notification.entity.Notification;
import com.tutorlms.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final CourseEnrollmentRepository enrollmentRepo;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * NHIEM VU 3: Phat thong bao den tat ca hoc vien da enroll trong khoa hoc.
     * @Async: chay bat dong bo, khong lam cham API response chinh.
     *
     * Moi thong bao duoc:
     *   1. Luu vao DB (de hien thi khi user offline)
     *   2. Push realtime qua STOMP den:
     *      - /topic/course/{id}/notify (broadcast phong)
     *      - /user/{userId}/queue/notifications (ca nhan)
     */
    @Async
    @Transactional
    public void broadcastToEnrolledStudents(
            Course course, Notification.Type type,
            String title, String body, UUID referenceId) {

        List<User> students = enrollmentRepo.findByCourse_IdOrderByEnrolledAtDesc(course.getId())
                .stream().map(CourseEnrollment::getStudent).toList();

        for (User student : students) {
            Notification notification = notificationRepo.save(Notification.builder()
                    .recipient(student).course(course).type(type)
                    .title(title).body(body).referenceId(referenceId).build());

            NotificationResponse resp = toResponse(notification);

            // Broadcast toan phong
            messagingTemplate.convertAndSend(
                    "/topic/course/" + course.getId() + "/notify", resp);
            // Ca nhan rieng tu
            messagingTemplate.convertAndSendToUser(
                    student.getId().toString(), "/queue/notifications", resp);
        }
        log.info("Broadcast {} to {} students in course={}",
                type, students.size(), course.getId());
    }

    /**
     * Phat thong bao den 1 hoc vien cu the (dung cho cong bo diem).
     */
    @Async
    @Transactional
    public void broadcastToOneStudent(
            User student, Course course, Notification.Type type,
            String title, String body, UUID referenceId) {

        Notification notification = notificationRepo.save(Notification.builder()
                .recipient(student).course(course).type(type)
                .title(title).body(body).referenceId(referenceId).build());

        NotificationResponse resp = toResponse(notification);
        messagingTemplate.convertAndSendToUser(
                student.getId().toString(), "/queue/notifications", resp);
        log.info("Notification {} sent to student={}", type, student.getId());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(User user) {
        return notificationRepo.findByRecipient_IdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long countUnread(User user) {
        return notificationRepo.countByRecipient_IdAndReadFalse(user.getId());
    }

    @Transactional
    public void markAllRead(User user) {
        notificationRepo.markAllReadByRecipient(user.getId());
    }

    @Transactional
    public void markOneRead(User user, UUID notifId) {
        notificationRepo.findById(notifId).ifPresent(n -> {
            if (n.getRecipient().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepo.save(n);
            }
        });
    }

    public NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId()).type(n.getType().name()).title(n.getTitle()).body(n.getBody())
                .courseId(n.getCourse() != null ? n.getCourse().getId() : null)
                .courseTitle(n.getCourse() != null ? n.getCourse().getTitle() : null)
                .referenceId(n.getReferenceId()).read(n.isRead()).createdAt(n.getCreatedAt())
                .build();
    }
}