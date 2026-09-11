package com.tutorlms.backend.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.ai.config.AiProperties;
import com.tutorlms.backend.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OpenAiClient {

    private final AiProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient.Builder restClientBuilder;

    public String chat(String systemPrompt, String userPrompt) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            throw new BadRequestException("Chưa cấu hình OPENAI_API_KEY cho tính năng AI");
        }

        Map<String, Object> body = Map.of(
                "model", properties.getModel(),
                "temperature", 0.3,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        try {
            String response = restClientBuilder.build()
                    .post()
                    .uri(trimSlash(properties.getBaseUrl()) + "/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(headers -> headers.setBearerAuth(properties.getApiKey()))
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.asText().isBlank()) {
                throw new BadRequestException("AI không trả về nội dung hợp lệ");
            }
            return content.asText();
        } catch (BadRequestException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new BadRequestException("Gọi AI API thất bại: " + ex.getMessage());
        } catch (Exception ex) {
            throw new BadRequestException("Không phân tích được phản hồi AI: " + ex.getMessage());
        }
    }

    private String trimSlash(String baseUrl) {
        if (baseUrl.endsWith("/")) {
            return baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl;
    }
}
