package com.tutorlms.backend.market.repository;

import com.tutorlms.backend.market.entity.MarketPostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarketPostLikeRepository extends JpaRepository<MarketPostLike, UUID> {
    boolean existsByPost_IdAndUser_Id(UUID postId, UUID userId);
    Optional<MarketPostLike> findByPost_IdAndUser_Id(UUID postId, UUID userId);
    long countByPost_Id(UUID postId);
    List<MarketPostLike> findByUser_Id(UUID userId);
    List<MarketPostLike> findByPost_Id(UUID postId);
}
