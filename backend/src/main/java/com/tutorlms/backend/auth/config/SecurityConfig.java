package com.tutorlms.backend.auth.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 0. Cau hinh CORS cho phep Frontend (Vercel, localhost, v.v.) goi API
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 1. Tat CSRF cho REST API Stateless
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Phan quyen Endpoint
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/demo/**").permitAll()
                .requestMatchers("/api/v1/marketplace/**").permitAll()
                .requestMatchers("/api/v1/market/**").permitAll()
                // VNPay IPN: Phai public vi VNPay server goi truc tiep (khong co JWT)
                // Bao mat bang HMAC-SHA512 signature verification trong PaymentService
                .requestMatchers("/api/v1/payment/vnpay-ipn").permitAll()
                .requestMatchers("/api/v1/payment/vnpay-return").permitAll()
                // WebSocket SockJS endpoint
                .requestMatchers("/ws/**").permitAll()
                // AI features
                .requestMatchers("/api/v1/ai/status").permitAll()
                .requestMatchers("/api/v1/ai/**").authenticated()
                // File upload va download cho he thong LMS
                .requestMatchers("/api/v1/files/download/**").permitAll()
                .requestMatchers("/api/v1/files/upload").hasAnyAuthority("ROLE_TUTOR", "ROLE_ADMIN", "ROLE_STUDENT")
                .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/v1/tutor/**").hasAnyAuthority("ROLE_TUTOR", "ROLE_ADMIN")
                .requestMatchers("/api/v1/student/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PARENT", "ROLE_TUTOR", "ROLE_ADMIN")
                .anyRequest().authenticated()
            )

            // 3. Session Stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. AuthenticationProvider & JWT Filter
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}