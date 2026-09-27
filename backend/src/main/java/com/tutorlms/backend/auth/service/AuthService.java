package com.tutorlms.backend.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tutorlms.backend.auth.dto.AuthResponse;
import com.tutorlms.backend.auth.dto.LoginRequest;
import com.tutorlms.backend.auth.dto.RegisterRequest;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // Thêm JwtService vào đây

    public AuthResponse register(RegisterRequest request) {
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already exists");
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String role = request.getRole();
        if (role != null && role.toUpperCase().startsWith("ROLE_")) {
            role = role.substring(5).toUpperCase();
        } else if (role != null) {
            role = role.toUpperCase();
        }

        User user = User.builder()
                .phone(request.getPhone())
                .fullName(request.getFullName())
                .role(role) 
                .password(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(request.getAvatarUrl())
                .email(request.getEmail())
                .build();
                
        userRepository.save(user);

        // Sinh JWT thực tế dựa trên đối tượng User (User phải implements UserDetails và chứa ID)
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .id(user.getId())
                .token(jwtToken) // Trả về token thật
                .role(user.getRole())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhoneOrEmail(request.getAccount(), request.getAccount())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password or username");
        }

        // Sinh JWT thực tế khi đăng nhập
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .id(user.getId())
                .token(jwtToken) // Trả về token thật
                .role(user.getRole())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .build();
    }

    public com.tutorlms.backend.auth.dto.UserProfileResponse getProfile(User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return toProfileResponse(user);
    }

    public com.tutorlms.backend.auth.dto.UserProfileResponse updateProfile(User currentUser, com.tutorlms.backend.auth.dto.UpdateProfileRequest request) {
        if (currentUser == null) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getHeadline() != null) {
            user.setHeadline(request.getHeadline().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        // Đổi mật khẩu nếu có
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() != null && !request.getCurrentPassword().isBlank()) {
                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                    throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
                }
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    public com.tutorlms.backend.auth.dto.UserProfileResponse getUserProfileById(java.util.UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng ID: " + userId));
        return toProfileResponse(user);
    }

    public com.tutorlms.backend.auth.dto.UserProfileResponse toProfileResponse(User user) {
        return com.tutorlms.backend.auth.dto.UserProfileResponse.builder()
                .id(user.getId())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .headline(user.getHeadline())
                .bio(user.getBio())
                .createdAt(user.getCreatedAt())
                .build();
    }
}