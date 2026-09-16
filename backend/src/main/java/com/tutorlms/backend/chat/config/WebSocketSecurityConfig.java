package com.tutorlms.backend.chat.config;

import com.tutorlms.backend.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Xac thuc JWT cho ket noi WebSocket / STOMP.
 *
 * Client phai gui STOMP CONNECT voi header:
 *   Authorization: Bearer <jwt_token>
 *
 * Sau khi xac thuc, principal se duoc gan vao STOMP session
 * de dung cho @AuthenticationPrincipal va /user/... routing.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor
                        .getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) return message;

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            String userId = jwtService.extractUsername(token);
                            UserDetails user = userDetailsService.loadUserByUsername(userId);
                            if (jwtService.isTokenValid(token, user)) {
                                accessor.setUser(new UsernamePasswordAuthenticationToken(
                                        user, null, user.getAuthorities()));
                                log.debug("WS CONNECT authenticated: userId={}", userId);
                            }
                        } catch (Exception e) {
                            log.warn("WS CONNECT: Invalid JWT", e);
                        }
                    }
                }
                return message;
            }
        });
    }
}