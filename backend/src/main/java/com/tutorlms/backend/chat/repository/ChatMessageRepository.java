package com.tutorlms.backend.chat.repository;

import com.tutorlms.backend.chat.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByCourse_IdOrderBySentAtDesc(UUID courseId, Pageable pageable);
}