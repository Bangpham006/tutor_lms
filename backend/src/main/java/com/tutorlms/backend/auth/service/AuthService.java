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
    // thuoc tinh 

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // methods
    // dang ky 
    public AuthResponse register(RegisterRequest request){
        // kiem tra co trung so dien thoai hoac email khong 
        // sdt
        if(request.getPhone() != null && userRepository.existsByPhone(request.getPhone())){
            throw new RuntimeException("Phone number already exists");
        }
        // kiem tra xem co trung email khong
        if(request.getEmail() != null && userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }
        // tao user entity va ma hoa mat khau bang BCrypt
            User user = User.builder()
            .phone(request.getPhone())
            .fullName(request.getFullName())
            .role(request.getRole()) 
            .password(passwordEncoder.encode(request.getPassword()))
            .avatarUrl(request.getAvatarUrl())
            .email(request.getEmail())
            .build();
            // luu user entity vao database 
            userRepository.save(user);

            // dong goi ket qua tra ve
            // gan va tra ve ma json cho controller lam viec tiep 
            return AuthResponse.builder()
                .token("dummy-token")
                .role(user.getRole())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .build();

    }
        public AuthResponse login(LoginRequest request){
            // kiem tra xem co ton tai user voi sdt hoac email ng dung nhap hay khong ?
            // truy van tu db 
            // gan vao bien user de kiem tra 
            User user = userRepository.findByPhoneOrEmail(request.getAccount(), request.getAccount())
            .orElseThrow(() -> new RuntimeException("User not found"));
            // kiem tra mat khau co dung khong 
            if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
                // sai thi nem ra loi
                throw new RuntimeException("Invalid password or username");

            }
            // tra ve ket qua cho controller
            return AuthResponse.builder()
                .token("dummy-token")
                .role(user.getRole())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .build();
        }

}
