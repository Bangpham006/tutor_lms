package com.tutorlms.backend.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Đăng nhập bằng Số điện thoại (Thay cho email)
    @Column(nullable = false, unique = true)
    private String phone;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email", unique = true)
    private String email;

    @Column(nullable = false)
    private String role; // STUDENT, TUTOR, ADMIN

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String password;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // =========================================================
    // CÁC HÀM BẮT BUỘC PHẢI OVERRIDE CỦA INTERFACE USERDETAILS
    // =========================================================
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(normalizedRole()));
    }

    public String normalizedRole() {
        String value = role == null ? "ROLE_STUDENT" : role.trim().toUpperCase();
        return value.startsWith("ROLE_") ? value : "ROLE_" + value;
    }

    public boolean hasRole(String expected) {
        return normalizedRole().equals(expected);
    }

    @Override
    public String getUsername() {
        // Trả về ID (UUID) thay vì phone/email vì ApplicationConfig đang dùng UUID để query
        return id.toString();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
    
    // Lưu ý: Không cần viết hàm getPassword() vì Lombok @Getter trên đầu class đã tự động tạo.
}