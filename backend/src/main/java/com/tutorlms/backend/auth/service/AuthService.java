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

        User user = User.builder()
                .phone(request.getPhone())
                .fullName(request.getFullName())
                .role(request.getRole()) 
                .password(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(request.getAvatarUrl())
                .email(request.getEmail())
                .build();
                
        userRepository.save(user);

        // Sinh JWT thực tế dựa trên đối tượng User (User phải implements UserDetails và chứa ID)
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
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
                .token(jwtToken) // Trả về token thật
                .role(user.getRole())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .build();
    }
}