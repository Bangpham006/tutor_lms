package com.tutorlms.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private UUID id;
    private String phone;
    private String fullName;
    private String email;
    private String role;
    private String avatarUrl;
    private String headline;
    private String bio;
    private LocalDateTime createdAt;
}
