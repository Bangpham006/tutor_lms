package com.tutorlms.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Cấu hình PasswordEncoder để mã hóa mật khẩu 
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Cấu hình SecurityFilterChain để xác thực và phân quyền người dùng
    @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // 1. Tắt CSRF
        .csrf(csrf -> csrf.disable())
        
        // 2. Tắt Session (Dùng cho REST API / JWT)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        
        // 3. Cấu hình phân quyền URL
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll() // URL auth thì mở
            .anyRequest().authenticated()               // Còn lại thì khóa
        );

    // 4. Trả về đối tượng đã build
    return http.build();
};
    }

