package com.tutorlms.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor  
@AllArgsConstructor
@Builder
public class AuthResponse {
    
    private String token;
    private String role;
    private String fullName;
    private String phone;
    private String email;
    
}
