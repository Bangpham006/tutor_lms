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
            // 1. Tat CSRF cho REST API Stateless
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Phan quyen Endpoint
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/demo/**").permitAll()
                .requestMatchers("/api/v1/marketplace/**").permitAll()
                // VNPay IPN: Phai public vi VNPay server goi truc tiep (khong co JWT)
                // Bao mat bang HMAC-SHA512 signature verification trong PaymentService
                .requestMatchers("/api/v1/payment/vnpay-ipn").permitAll()
                .requestMatchers("/api/v1/payment/vnpay-return").permitAll()
                // WebSocket SockJS endpoint
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/v1/tutor/**").hasAnyAuthority("ROLE_TUTOR", "ROLE_ADMIN")
                .requestMatchers("/api/v1/student/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PARENT", "ROLE_ADMIN")
                .anyRequest().authenticated()
            )

            // 3. Session Stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. AuthenticationProvider & JWT Filter
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}