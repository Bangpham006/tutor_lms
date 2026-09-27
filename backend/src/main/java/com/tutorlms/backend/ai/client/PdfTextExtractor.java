package com.tutorlms.backend.ai.client;

import com.tutorlms.backend.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@Slf4j
public class PdfTextExtractor {

    private static final int MAX_BYTES = 10 * 1024 * 1024; // 10MB
    private static final int MAX_CHARS = 12_000;

    public String extractFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new BadRequestException("Tài liệu chưa có đường dẫn fileUrl để trích xuất nội dung");
        }

        try {
            byte[] bytes = null;

            // 1. Nếu là file cục bộ lưu trong thư mục uploads của hệ thống
            if (fileUrl.contains("/api/v1/files/download/")) {
                String fileName = fileUrl.substring(fileUrl.lastIndexOf("/api/v1/files/download/") + "/api/v1/files/download/".length());
                Path[] candidateDirs = new Path[] {
                    Paths.get("uploads"),
                    Paths.get("..", "uploads"),
                    Paths.get("backend", "uploads"),
                    Paths.get("D:", "TUTOR_LMS", "uploads"),
                    Paths.get("D:", "TUTOR_LMS", "backend", "uploads")
                };
                for (Path dir : candidateDirs) {
                    Path candidate = dir.resolve(fileName).toAbsolutePath().normalize();
                    if (Files.exists(candidate)) {
                        log.info("Đọc file trực tiếp từ đĩa cục bộ: {}", candidate);
                        bytes = Files.readAllBytes(candidate);
                        break;
                    }
                }
            }

            // 2. Nếu không tìm thấy file cục bộ, tải qua HTTP URL
            if (bytes == null) {
                URL url = URI.create(fileUrl).toURL();
                URLConnection connection = url.openConnection();
                connection.setConnectTimeout(10_000);
                connection.setReadTimeout(20_000);
                try (InputStream in = connection.getInputStream()) {
                    bytes = readLimited(in);
                }
            }

            // 3. Thử phân tích cú pháp bằng Apache PDFBox
            try (PDDocument document = PDDocument.load(bytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                if (text != null && !text.isBlank()) {
                    return truncate(text);
                }
            } catch (Exception pdfEx) {
                log.info("Không phải định dạng PDF chuẩn, thử giải mã dạng Plain Text / UTF-8: {}", pdfEx.getMessage());
                // Thử đọc như plain text / markdown / code
                String rawText = new String(bytes, StandardCharsets.UTF_8);
                // Kiểm tra xem có nhiều ký tự có thể đọc được không
                if (isReadableText(rawText)) {
                    return truncate(rawText);
                }
            }

            throw new BadRequestException("Không thể đọc được văn bản từ file (vui lòng đảm bảo file là PDF hoặc tệp văn bản có nội dung chữ)");
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Lỗi khi tải hoặc đọc tài liệu từ {}: {}", fileUrl, ex.getMessage());
            throw new BadRequestException("Không thể tải hoặc trích xuất nội dung tài liệu: " + ex.getMessage());
        }
    }

    private boolean isReadableText(String text) {
        if (text == null || text.isBlank()) return false;
        long printable = text.chars().filter(ch -> ch >= 32 || ch == '\n' || ch == '\r' || ch == '\t').count();
        return (double) printable / text.length() > 0.85;
    }

    private byte[] readLimited(InputStream in) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int read;
        int total = 0;
        while ((read = in.read(chunk)) != -1) {
            total += read;
            if (total > MAX_BYTES) {
                throw new BadRequestException("Kích thước file vượt quá giới hạn 10MB");
            }
            buffer.write(chunk, 0, read);
        }
        return buffer.toByteArray();
    }

    public String truncate(String text) {
        if (text == null) return "";
        String normalized = text.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= MAX_CHARS) {
            return normalized;
        }
        return normalized.substring(0, MAX_CHARS);
    }
}
