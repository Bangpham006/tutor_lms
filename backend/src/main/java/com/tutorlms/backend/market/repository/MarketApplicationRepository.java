package com.tutorlms.backend.market.repository;

import com.tutorlms.backend.market.entity.MarketApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarketApplicationRepository extends JpaRepository<MarketApplication, UUID> {
    List<MarketApplication> findByPost_IdOrderByCreatedAtDesc(UUID postId);
    List<MarketApplication> findByTutor_IdOrderByCreatedAtDesc(UUID tutorId);
    boolean existsByPost_IdAndTutor_Id(UUID postId, UUID tutorId);
    Optional<MarketApplication> findByPost_IdAndTutor_Id(UUID postId, UUID tutorId);
    long countByPost_Id(UUID postId);
}
