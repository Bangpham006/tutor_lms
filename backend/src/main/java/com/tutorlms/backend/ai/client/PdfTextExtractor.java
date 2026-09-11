package com.tutorlms.backend.ai.client;

import com.tutorlms.backend.common.exception.BadRequestException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.net.URLConnection;

@Component
public class PdfTextExtractor {

    private static final int MAX_BYTES = 10 * 1024 * 1024;
    private static final int MAX_CHARS = 12_000;

    public String extractFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new BadRequestException("Tài liệu chưa có fileUrl PDF để tóm tắt");
        }
        try {
            URL url = URI.create(fileUrl).toURL();
            URLConnection connection = url.openConnection();
            connection.setConnectTimeout(10_000);
            connection.setReadTimeout(20_000);
            try (InputStream in = connection.getInputStream()) {
                byte[] bytes = readLimited(in);
                try (PDDocument document = PDDocument.load(bytes)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    String text = stripper.getText(document);
                    if (text == null || text.isBlank()) {
                        throw new BadRequestException("Không đọc được chữ từ file PDF");
                    }
                    return truncate(text);
                }
            }
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Không tải hoặc đọc được PDF: " + ex.getMessage());
        }
    }

    private byte[] readLimited(InputStream in) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int read;
        int total = 0;
        while ((read = in.read(chunk)) != -1) {
            total += read;
            if (total > MAX_BYTES) {
                throw new BadRequestException("File PDF vượt quá 10MB");
            }
            buffer.write(chunk, 0, read);
        }
        return buffer.toByteArray();
    }

    public String truncate(String text) {
        String normalized = text.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= MAX_CHARS) {
            return normalized;
        }
        return normalized.substring(0, MAX_CHARS);
    }
}
