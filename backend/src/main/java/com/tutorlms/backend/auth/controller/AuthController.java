package com.tutorlms.backend.auth.controller;

import com.tutorlms.backend.auth.dto.AuthResponse;
import com.tutorlms.backend.auth.dto.LoginRequest;
import com.tutorlms.backend.auth.dto.RegisterRequest;
import com.tutorlms.backend.auth.service.AuthService;
import lombok.RequiredArgsConstructor;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
// thuoc tinh authService de goi cac phuong thuc trong AuthService
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    // test api get current user
   @GetMapping("/me")
public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
    if (userDetails == null) {
        return ResponseEntity.status(401).body("Không tìm thấy thông tin xác thực");
    }
    // userDetails.getUsername() đang trả về ID (UUID) của user theo hàm getUsername() bạn đã định nghĩa trong class User
    return ResponseEntity.ok("Authenticated user ID: " + userDetails.getUsername());
}

}