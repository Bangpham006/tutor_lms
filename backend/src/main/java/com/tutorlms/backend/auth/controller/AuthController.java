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
    // Lấy thông tin cá nhân của người dùng đang đăng nhập
    @GetMapping("/profile")
    public ResponseEntity<com.tutorlms.backend.auth.dto.UserProfileResponse> getProfile(
            @AuthenticationPrincipal com.tutorlms.backend.auth.entity.User currentUser
    ) {
        return ResponseEntity.ok(authService.getProfile(currentUser));
    }

    // Cập nhật thông tin cá nhân
    @PutMapping("/profile")
    public ResponseEntity<com.tutorlms.backend.auth.dto.UserProfileResponse> updateProfile(
            @AuthenticationPrincipal com.tutorlms.backend.auth.entity.User currentUser,
            @RequestBody com.tutorlms.backend.auth.dto.UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(authService.updateProfile(currentUser, request));
    }

    // Xem thông tin hồ sơ của một người dùng bất kỳ (ví dụ xem profile gia sư)
    @GetMapping("/users/{userId}")
    public ResponseEntity<com.tutorlms.backend.auth.dto.UserProfileResponse> getUserProfile(
            @PathVariable java.util.UUID userId
    ) {
        return ResponseEntity.ok(authService.getUserProfileById(userId));
    }

    // test api get current user
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Không tìm thấy thông tin xác thực");
        }
        return ResponseEntity.ok("Authenticated user ID: " + userDetails.getUsername());
    }
}