package com.tutorlms.backend.market.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketCommentRequest {
    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;

    // Optional override if guest or specific display name
    private String authorName;
    private String authorAvatar;
    private String authorRole;
}
