package com.tutorlms.backend.market.repository;

import com.tutorlms.backend.market.entity.MarketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketCommentRepository extends JpaRepository<MarketComment, UUID> {
    List<MarketComment> findByPost_IdOrderByCreatedAtAsc(UUID postId);
    long countByPost_Id(UUID postId);
}
