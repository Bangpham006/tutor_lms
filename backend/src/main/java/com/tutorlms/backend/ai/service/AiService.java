package com.tutorlms.backend.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.ai.client.OpenAiClient;
import com.tutorlms.backend.ai.client.PdfTextExtractor;
import com.tutorlms.backend.ai.config.AiProperties;
import com.tutorlms.backend.ai.dto.*;
import com.tutorlms.backend.assignment.dto.AssignmentResponse;
import com.tutorlms.backend.assignment.entity.Assignment;
import com.tutorlms.backend.assignment.repository.AssignmentRepository;
import com.tutorlms.backend.assignment.service.AssignmentService;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.BadRequestException;
import com.tutorlms.backend.common.exception.ForbiddenOperationException;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.course.service.CourseService;
import com.tutorlms.backend.material.entity.LessonMaterial;
import com.tutorlms.backend.material.service.LessonMaterialService;
import com.tutorlms.backend.notification.entity.Notification;
import com.tutorlms.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final LessonMaterialService materialService;
    private final CourseService courseService;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentService assignmentService;
    private final NotificationService notificationService;
    private final PdfTextExtractor pdfTextExtractor;
    private final OpenAiClient openAiClient;
    private final AiProperties properties;
    private final ObjectMapper objectMapper;

    /**
     * Lấy thông tin trạng thái cấu hình AI hiện tại
     */
    public AiConfigDto getAiConfig() {
        return AiConfigDto.builder()
                .configured(properties.isConfigured())
                .baseUrl(properties.getBaseUrl())
                .model(properties.getModel())
                .maskedApiKey(properties.getMaskedApiKey())
                .provider(properties.detectProvider())
                .build();
    }

    /**
     * Cập nhật API Key hoặc model runtime
     */
    public AiConfigDto configureKey(AiConfigureKeyRequest request) {
        if (request.getApiKey() != null && !request.getApiKey().isBlank()) {
            properties.setApiKey(request.getApiKey().trim());
        }
        if (request.getBaseUrl() != null && !request.getBaseUrl().isBlank()) {
            properties.setBaseUrl(request.getBaseUrl().trim());
        }
        if (request.getModel() != null && !request.getModel().isBlank()) {
            properties.setModel(request.getModel().trim());
        }
        log.info("Đã cập nhật cấu hình AI thành công: provider={}, model={}",
                properties.detectProvider(), properties.getModel());
        return getAiConfig();
    }

    /**
     * Tóm tắt bài giảng / slide bằng AI thật (Hỗ trợ cả Gia sư và Học viên đã ghi danh)
     */
    @Transactional(readOnly = true)
    public PdfSummaryResponse summarizeMaterial(User user, UUID materialId, SummarizeRequest request) {
        LessonMaterial material = materialService.getMaterial(materialId);
        assertCanAccessMaterial(user, material.getCourse());

        // Lấy nguồn nội dung: ưu tiên nội dung tùy chọn do user gửi lên, sau đó đến fileUrl PDF, cuối cùng là tiêu đề
        String source;
        if (request != null && request.getLectureContent() != null && !request.getLectureContent().isBlank()) {
            source = pdfTextExtractor.truncate(request.getLectureContent());
        } else if (material.getFileUrl() != null && !material.getFileUrl().isBlank()) {
            source = pdfTextExtractor.extractFromUrl(material.getFileUrl());
        } else {
            source = "Chủ đề bài học: " + material.getTitle();
        }

        String systemPrompt = """
                Bạn là trợ lý sư phạm AI cao cấp của nền tảng học trực tuyến TutorLMS.
                Nhiệm vụ của bạn là phân tích tài liệu học tập, slide bài giảng và tóm lược một cách trực quan, xúc tích, sư phạm, chuẩn tiếng Việt.
                """;

        String userPrompt = """
                Hãy phân tích và tóm tắt bài giảng sau:
                Tiêu đề: %s

                Nội dung học liệu:
                %s

                Yêu cầu trình bày:
                1. 🎯 Mục tiêu bài học & Khái niệm cốt lõi.
                2. 🔑 Các luận điểm / công thức / kiến thức trọng tâm (gạch đầu dòng rõ ràng).
                3. 💡 Lưu ý thực chiến & các bẫy thường gặp.
                4. 📌 Tóm lược ghi nhớ nhanh trong 1 câu.
                """.formatted(material.getTitle(), source);

        String summary = openAiClient.chat(systemPrompt, userPrompt);

        return PdfSummaryResponse.builder()
                .materialId(material.getId())
                .title(material.getTitle())
                .summary(summary)
                .build();
    }

    /**
     * Tạo bài trắc nghiệm tự động từ Slide / Bài giảng bằng AI thật
     */
    @Transactional(readOnly = true)
    public McqSetResponse generateMcq(User user, UUID materialId, GenerateMcqRequest request) {
        LessonMaterial material = materialService.getMaterial(materialId);
        assertCanAccessMaterial(user, material.getCourse());

        int count = 5;
        if (request != null && request.getQuestionCount() != null) {
            count = Math.min(Math.max(request.getQuestionCount(), 1), 20);
        }

        String source;
        if (request != null && request.getLectureContent() != null && !request.getLectureContent().isBlank()) {
            source = pdfTextExtractor.truncate(request.getLectureContent());
        } else if (material.getFileUrl() != null && !material.getFileUrl().isBlank()) {
            source = pdfTextExtractor.extractFromUrl(material.getFileUrl());
        } else {
            source = "Chủ đề kiến thức: " + material.getTitle();
        }

        String systemPrompt = """
                Bạn là chuyên gia khảo thí và tạo đề thi trắc nghiệm LMS chuẩn quốc tế.
                BẠN CHỈ TRẢ VỀ JSON THUẦN TÚY, TUYỆT ĐỐI KHÔNG DÙNG MARKDOWN VÀ KHÔNG THÊM BẤT KỲ LỜI MỞ ĐẦU NÀO.
                """;

        String userPrompt = """
                Dựa trên nội dung học liệu bài giảng dưới đây, hãy tạo %d câu hỏi trắc nghiệm chất lượng cao (4 lựa chọn A, B, C, D) kiểm tra mức độ hiểu và vận dụng của học sinh.

                Bắt buộc trả về đúng định dạng JSON có cấu trúc sau:
                {
                  "questions": [
                    {
                      "question": "Nội dung câu hỏi...",
                      "options": [
                        "A. Lựa chọn 1",
                        "B. Lựa chọn 2",
                        "C. Lựa chọn 3",
                        "D. Lựa chọn 4"
                      ],
                      "correctAnswer": "A",
                      "explanation": "Giải thích chi tiết vì sao đáp án này đúng..."
                    }
                  ]
                }

                Nội dung bài học:
                %s
                """.formatted(count, source);

        String rawResponse = openAiClient.chat(systemPrompt, userPrompt);
        List<McqQuestionResponse> questions = parseQuestions(rawResponse);

        return McqSetResponse.builder()
                .materialId(material.getId())
                .title(material.getTitle())
                .questions(questions)
                .build();
    }

    /**
     * Lưu bộ câu hỏi trắc nghiệm do AI sinh ra thành một bài tập chính thức trong Khóa Học
     */
    @Transactional
    public AssignmentResponse saveMcqAsAssignment(User tutor, UUID courseId, CreateMcqAssignmentRequest request) {
        Course course = courseService.requireOwnedCourse(tutor, courseId);

        if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
            throw new BadRequestException("Danh sách câu hỏi trắc nghiệm không được để trống");
        }

        StringBuilder contentBuilder = new StringBuilder();
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            contentBuilder.append(request.getDescription().trim()).append("\n\n");
        } else {
            contentBuilder.append("Bài tập trắc nghiệm củng cố kiến thức do AI tổng hợp từ bài giảng.\n\n");
        }

        for (int i = 0; i < request.getQuestions().size(); i++) {
            McqQuestionResponse q = request.getQuestions().get(i);
            contentBuilder.append(String.format("Câu %d: %s\n", i + 1, q.getQuestion()));
            if (q.getOptions() != null) {
                for (String opt : q.getOptions()) {
                    contentBuilder.append(String.format("   %s\n", opt));
                }
            }
            contentBuilder.append("\n");
        }

        LocalDateTime dueAt = request.getDueAt() != null ? request.getDueAt() : LocalDateTime.now().plusDays(7);

        Assignment assignment = Assignment.builder()
                .title(request.getTitle() != null && !request.getTitle().isBlank()
                        ? request.getTitle()
                        : "Bài tập trắc nghiệm tự luyện")
                .content(contentBuilder.toString())
                .dueAt(dueAt)
                .course(course)
                .build();

        Assignment saved = assignmentRepository.save(assignment);

        // Phát thông báo realtime tới toàn bộ học viên đã ghi danh
        notificationService.broadcastToEnrolledStudents(
                course,
                Notification.Type.NEW_ASSIGNMENT,
                "Bài tập trắc nghiệm mới: " + saved.getTitle(),
                "Gia sư vừa thêm bài tập trắc nghiệm mới vào khóa học " + course.getTitle(),
                saved.getId()
        );

        return assignmentService.toAssignmentResponse(saved);
    }

    private void assertCanAccessMaterial(User user, Course course) {
        if (user.hasRole("ROLE_ADMIN") || user.hasRole("ADMIN")) return;
        if (course.getTutor() != null && course.getTutor().getId().equals(user.getId())) return;
        if (enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), user.getId())) return;
        throw new ForbiddenOperationException("Bạn chưa ghi danh vào khóa học này, không thể truy cập tính năng AI cho học liệu!");
    }

    private List<McqQuestionResponse> parseQuestions(String raw) {
        try {
            String json = extractJson(raw);
            JsonNode root = objectMapper.readTree(json);
            JsonNode array = root.has("questions") ? root.get("questions") : root;
            List<McqQuestionResponse> questions = objectMapper.convertValue(
                    array,
                    new TypeReference<List<McqQuestionResponse>>() {}
            );
            if (questions == null || questions.isEmpty()) {
                throw new BadRequestException("AI không tạo được danh sách câu hỏi hợp lệ");
            }
            return questions;
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Lỗi khi parse JSON câu hỏi trắc nghiệm từ AI: raw={}", raw, ex);
            throw new BadRequestException("Không thể phân tích bộ câu hỏi từ phản hồi của AI: " + ex.getMessage());
        }
    }

    private String extractJson(String raw) {
        if (raw == null || raw.isBlank()) return "{}";
        String trimmed = raw.trim();

        if (trimmed.contains("```")) {
            int firstBlock = trimmed.indexOf("```");
            int afterLang = trimmed.indexOf('\n', firstBlock);
            if (afterLang != -1) {
                int closingBlock = trimmed.lastIndexOf("```");
                if (closingBlock > afterLang) {
                    trimmed = trimmed.substring(afterLang + 1, closingBlock).trim();
                }
            }
        }

        int objectStart = trimmed.indexOf('{');
        int objectEnd = trimmed.lastIndexOf('}');
        int arrayStart = trimmed.indexOf('[');
        int arrayEnd = trimmed.lastIndexOf(']');

        if (objectStart != -1 && objectEnd > objectStart && (arrayStart == -1 || objectStart < arrayStart)) {
            return trimmed.substring(objectStart, objectEnd + 1);
        }
        if (arrayStart != -1 && arrayEnd > arrayStart) {
            return trimmed.substring(arrayStart, arrayEnd + 1);
        }
        return trimmed;
    }
}
