package com.tutorlms.backend.course.dto;

import java.util.UUID;

/**
 * Tham so tim kiem / loc khoa hoc tren Marketplace.
 * Truyen qua query string: ?keyword=java&tutorId=xxx
 */
public record CourseSearchParams(
        String keyword,
        UUID tutorId
) {
    /** Tra ve keyword da trim; null neu rong -- de JPQL IS NULL check hoat dong dung */
    public String normalizedKeyword() {
        if (keyword == null || keyword.isBlank()) return null;
        return keyword.trim();
    }
}