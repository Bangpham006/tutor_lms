package com.tutorlms.backend.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.ai.config.AiProperties;
import com.tutorlms.backend.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class OpenAiClient {

    private final AiProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public OpenAiClient(AiProperties properties, ObjectMapper objectMapper, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.objectMapper = objectMapper;

        // Cấu hình timeouts: kết nối 15s, đọc phản hồi 60s (LLM cần thời gian sinh text)
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(15).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(60).toMillis());

        this.restClient = restClientBuilder
                .requestFactory(requestFactory)
                .build();
    }

    public String chat(String systemPrompt, String userPrompt) {
        if (!properties.isConfigured()) {
            throw new BadRequestException(
                    "Hệ thống chưa được cấu hình API Key của LLM. " +
                    "Vui lòng cung cấp API Key (OpenAI, Google Gemini, DeepSeek hoặc Groq) để kích hoạt tính năng AI thật!"
            );
        }

        String primaryModel = properties.getModel();
        List<String> modelCandidates = new java.util.ArrayList<>();
        modelCandidates.add(primaryModel);
        if (properties.detectProvider().contains("Gemini")) {
            for (String fallback : List.of("gemini-flash-lite-latest", "gemini-flash-latest", "gemini-pro-latest")) {
                if (!modelCandidates.contains(fallback)) {
                    modelCandidates.add(fallback);
                }
            }
        }

        String endpoint = trimSlash(properties.getBaseUrl()) + "/chat/completions";
        String lastError = null;

        for (String modelToUse : modelCandidates) {
            Map<String, Object> body = Map.of(
                    "model", modelToUse,
                    "temperature", 0.3,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    )
            );

            log.info("Gửi yêu cầu tới LLM Provider [{}], model [{}], endpoint: {}",
                    properties.detectProvider(), modelToUse, endpoint);

            try {
                String response = restClient
                        .post()
                        .uri(endpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .headers(headers -> headers.setBearerAuth(properties.getApiKey().trim()))
                        .body(body)
                        .retrieve()
                        .body(String.class);

                JsonNode root = objectMapper.readTree(response);
                JsonNode content = root.path("choices").path(0).path("message").path("content");
                if (content.isMissingNode() || content.asText().isBlank()) {
                    throw new BadRequestException("Mô hình AI không trả về nội dung hợp lệ.");
                }
                return content.asText().trim();

            } catch (BadRequestException ex) {
                throw ex;
            } catch (RestClientResponseException ex) {
                int code = ex.getStatusCode().value();
                log.warn("Lỗi từ LLM API với model [{}]: statusCode={}, body={}", modelToUse, code, ex.getResponseBodyAsString());
                lastError = ex.getResponseBodyAsString();
                if (code == 401) {
                    throw new BadRequestException("API Key của LLM không hợp lệ hoặc đã bị thu hồi (401 Unauthorized). Vui lòng kiểm tra lại Key!");
                } else if (code == 429) {
                    throw new BadRequestException("Tài khoản LLM đã hết hạn ngạch truy vấn (Rate limit hoặc hết credit - 429 Too Many Requests). Vui lòng nạp thêm credit hoặc đổi Key!");
                }
                // Thử model tiếp theo nếu 404 hoặc 503
            } catch (Exception ex) {
                log.error("Lỗi ngoại lệ khi gọi LLM: {}", ex.getMessage(), ex);
                throw new BadRequestException("Không thể kết nối đến nhà cung cấp AI: " + ex.getMessage());
            }
        }

        throw new BadRequestException("Không thể nhận phản hồi từ LLM API: " + (lastError != null ? lastError : "Server bận hoặc không tìm thấy model."));
    }

    private String trimSlash(String baseUrl) {
        if (baseUrl == null) return "https://api.openai.com/v1";
        String trimmed = baseUrl.trim();
        if (trimmed.endsWith("/")) {
            return trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
