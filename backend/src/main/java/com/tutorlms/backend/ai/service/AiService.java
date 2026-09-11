package com.tutorlms.backend.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.ai.client.OpenAiClient;
import com.tutorlms.backend.ai.client.PdfTextExtractor;
import com.tutorlms.backend.ai.dto.GenerateMcqRequest;
import com.tutorlms.backend.ai.dto.McqQuestionResponse;
import com.tutorlms.backend.ai.dto.McqSetResponse;
import com.tutorlms.backend.ai.dto.PdfSummaryResponse;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.BadRequestException;
import com.tutorlms.backend.material.entity.LessonMaterial;
import com.tutorlms.backend.material.service.LessonMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiService {

    private final LessonMaterialService materialService;
    private final PdfTextExtractor pdfTextExtractor;
    private final OpenAiClient openAiClient;
    private final ObjectMapper objectMapper;

    public PdfSummaryResponse summarizeMaterial(User tutor, java.util.UUID materialId) {
        LessonMaterial material = materialService.requireOwnedMaterial(tutor, materialId);
        String pdfText = pdfTextExtractor.extractFromUrl(material.getFileUrl());
        String summary = openAiClient.chat(
                "Bạn là trợ lý sư phạm. Hãy tóm tắt tài liệu bài giảng bằng tiếng Việt, rõ ràng, súc tích, chia mục nếu phù hợp.",
                "Tóm tắt tài liệu sau:\n\n" + pdfText
        );
        return PdfSummaryResponse.builder()
                .materialId(material.getId())
                .title(material.getTitle())
                .summary(summary)
                .build();
    }

    public McqSetResponse generateMcq(User tutor, java.util.UUID materialId, GenerateMcqRequest request) {
        LessonMaterial material = materialService.requireOwnedMaterial(tutor, materialId);
        int count = request.getQuestionCount() == null ? 5 : Math.min(Math.max(request.getQuestionCount(), 1), 20);

        String source;
        if (request.getLectureContent() != null && !request.getLectureContent().isBlank()) {
            source = pdfTextExtractor.truncate(request.getLectureContent());
        } else {
            source = pdfTextExtractor.extractFromUrl(material.getFileUrl());
        }

        String raw = openAiClient.chat(
                "Bạn tạo câu hỏi trắc nghiệm cho LMS. Chỉ trả JSON thuần, không markdown.",
                """
                Dựa trên nội dung bài giảng, tạo %d câu hỏi trắc nghiệm (4 lựa chọn A-D).
                JSON bắt buộc theo dạng:
                {"questions":[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":"A","explanation":"..."}]}
                Nội dung:
                %s
                """.formatted(count, source)
        );

        return McqSetResponse.builder()
                .materialId(material.getId())
                .title(material.getTitle())
                .questions(parseQuestions(raw))
                .build();
    }

    private List<McqQuestionResponse> parseQuestions(String raw) {
        try {
            String json = extractJson(raw);
            JsonNode root = objectMapper.readTree(json);
            JsonNode array = root.has("questions") ? root.get("questions") : root;
            List<McqQuestionResponse> questions = objectMapper.convertValue(
                    array,
                    new TypeReference<List<McqQuestionResponse>>() {
                    }
            );
            if (questions == null || questions.isEmpty()) {
                throw new BadRequestException("AI không tạo được câu hỏi");
            }
            return questions;
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Không parse được bộ câu hỏi AI");
        }
    }

    private String extractJson(String raw) {
        String trimmed = raw.trim();
        int objectStart = trimmed.indexOf('{');
        int arrayStart = trimmed.indexOf('[');
        if (objectStart == -1 && arrayStart == -1) {
            return trimmed;
        }
        if (objectStart == -1) {
            return trimmed.substring(arrayStart);
        }
        if (arrayStart == -1 || objectStart < arrayStart) {
            return trimmed.substring(objectStart);
        }
        return trimmed.substring(arrayStart);
    }
}
