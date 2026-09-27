package com.tutorlms.backend.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "ai.openai")
@Getter
@Setter
public class AiProperties {
    private String apiKey = "";
    private String baseUrl = "https://api.openai.com/v1";
    private String model = "gpt-4o-mini";

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isBlank();
    }

    public String getMaskedApiKey() {
        if (!isConfigured()) {
            return "";
        }
        String clean = apiKey.trim();
        if (clean.length() <= 8) {
            return "******";
        }
        return clean.substring(0, 4) + "..." + clean.substring(clean.length() - 4);
    }

    public String detectProvider() {
        if (baseUrl == null) return "Unknown";
        String lower = baseUrl.toLowerCase();
        if (lower.contains("openai.com")) return "OpenAI";
        if (lower.contains("googleapis.com")) return "Google Gemini";
        if (lower.contains("deepseek.com")) return "DeepSeek";
        if (lower.contains("groq.com")) return "Groq";
        if (lower.contains("openrouter.ai")) return "OpenRouter";
        return "Custom OpenAI-compatible";
    }
}
