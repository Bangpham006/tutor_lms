package com.tutorlms.backend.market.repository;

import com.tutorlms.backend.market.entity.MarketPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketPostRepository extends JpaRepository<MarketPost, UUID> {
    List<MarketPost> findAllByOrderByCreatedAtDesc();
}
