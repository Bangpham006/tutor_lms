package com.tutorlms.backend.notification.repository;

import com.tutorlms.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(UUID recipientId);

    long countByRecipient_IdAndReadFalse(UUID recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.id = :rid AND n.read = false")
    void markAllReadByRecipient(@Param("rid") UUID recipientId);
}