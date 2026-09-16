package com.tutorlms.backend.auth.service;

import com.tutorlms.backend.auth.dto.AuthResponse;
import com.tutorlms.backend.auth.dto.LoginRequest;
import com.tutorlms.backend.auth.dto.RegisterRequest;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(UUID.randomUUID())
                .phone("0901234567")
                .email("student@example.com")
                .fullName("Nguyen Van A")
                .role("STUDENT")
                .password("hashed_password")
                .build();
    }

    // ================================================================
    // REGISTER
    // ================================================================
    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("Happy path: dang ky thanh cong, tra ve token")
        void register_success_returnsToken() {
            RegisterRequest request = new RegisterRequest();
            request.setPhone("0901234567");
            request.setEmail("student@example.com");
            request.setFullName("Nguyen Van A");
            request.setPassword("password123");
            request.setRole("STUDENT");

            when(userRepository.existsByPhone("0901234567")).thenReturn(false);
            when(userRepository.existsByEmail("student@example.com")).thenReturn(false);
            when(passwordEncoder.encode("password123")).thenReturn("hashed_password");
            when(userRepository.save(any(User.class))).thenReturn(sampleUser);
            when(jwtService.generateToken(any(User.class))).thenReturn("jwt_token_abc");

            AuthResponse response = authService.register(request);

            assertThat(response.getToken()).isEqualTo("jwt_token_abc");
            assertThat(response.getRole()).isEqualTo("STUDENT");
            assertThat(response.getFullName()).isEqualTo("Nguyen Van A");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Fail: so dien thoai da ton tai -> nem RuntimeException")
        void register_duplicatePhone_throwsException() {
            RegisterRequest request = new RegisterRequest();
            request.setPhone("0901234567");
            request.setPassword("password123");

            when(userRepository.existsByPhone("0901234567")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Phone number already exists");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Fail: email da ton tai -> nem RuntimeException")
        void register_duplicateEmail_throwsException() {
            RegisterRequest request = new RegisterRequest();
            request.setPhone(null); // khong co phone
            request.setEmail("student@example.com");
            request.setPassword("password123");

            when(userRepository.existsByEmail("student@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Email already exists");
        }
    }

    // ================================================================
    // LOGIN
    // ================================================================
    @Nested
    @DisplayName("login()")
    class Login {

        @Test
        @DisplayName("Happy path: dang nhap bang so dien thoai thanh cong")
        void login_withPhone_success() {
            LoginRequest request = new LoginRequest();
            request.setAccount("0901234567");
            request.setPassword("password123");

            when(userRepository.findByPhoneOrEmail("0901234567", "0901234567"))
                    .thenReturn(Optional.of(sampleUser));
            when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
            when(jwtService.generateToken(sampleUser)).thenReturn("jwt_token_xyz");

            AuthResponse response = authService.login(request);

            assertThat(response.getToken()).isEqualTo("jwt_token_xyz");
            assertThat(response.getPhone()).isEqualTo("0901234567");
        }

        @Test
        @DisplayName("Happy path: dang nhap bang email thanh cong")
        void login_withEmail_success() {
            LoginRequest request = new LoginRequest();
            request.setAccount("student@example.com");
            request.setPassword("password123");

            when(userRepository.findByPhoneOrEmail("student@example.com", "student@example.com"))
                    .thenReturn(Optional.of(sampleUser));
            when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
            when(jwtService.generateToken(sampleUser)).thenReturn("jwt_token_xyz");

            AuthResponse response = authService.login(request);

            assertThat(response.getToken()).isNotBlank();
        }

        @Test
        @DisplayName("Fail: user khong ton tai -> nem RuntimeException")
        void login_userNotFound_throwsException() {
            LoginRequest request = new LoginRequest();
            request.setAccount("khongtontai@email.com");
            request.setPassword("password123");

            when(userRepository.findByPhoneOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("Fail: mat khau sai -> nem RuntimeException")
        void login_wrongPassword_throwsException() {
            LoginRequest request = new LoginRequest();
            request.setAccount("0901234567");
            request.setPassword("wrong_password");

            when(userRepository.findByPhoneOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(sampleUser));
            when(passwordEncoder.matches("wrong_password", "hashed_password")).thenReturn(false);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Invalid password");
        }
    }
}