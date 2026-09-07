package com.tutorlms.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RegisterRequest {
    private String phone;
    private String fullName;
    private String role ;
    private String password;
    private String avatarUrl;
    private String email;
    
}
