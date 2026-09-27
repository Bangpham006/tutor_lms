package com.tutorlms.backend.common.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Controller xu ly upload va tai file truc tiep cho Gia su va Hoc vien.
 * File duoc luu truc tiep tren may chu backend/uploads.
 */
@RestController
@RequestMapping("/api/v1/files")
@Slf4j
public class FileUploadController {

    private final Path storageDirectory;

    public FileUploadController() {
        this.storageDirectory = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageDirectory);
            log.info("Thu muc luu tru file da san sang tai: {}", this.storageDirectory);
        } catch (IOException e) {
            log.error("Khong the tao thu muc uploads", e);
            throw new RuntimeException("Khong the khoi tao thu muc luu tru file", e);
        }
    }

    /**
     * API upload file truc tiep: PDF, Word, Slide, Zip, Video, Anh...
     * POST /api/v1/files/upload
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui long chon file truoc khi upload"));
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ten file khong hop le"));
        }

        // Tao ten file duy nhat: uuid_originalName
        String uniqueFileName = UUID.randomUUID() + "_" + originalFilename.replaceAll("\\s+", "_");

        try {
            Path targetLocation = this.storageDirectory.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            try {
                Path parentUploads = Paths.get("..", "uploads").toAbsolutePath().normalize();
                if (Files.exists(parentUploads) && !parentUploads.equals(this.storageDirectory)) {
                    Files.copy(targetLocation, parentUploads.resolve(uniqueFileName), StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (Exception ignore) {}

            String fileUrl = "http://localhost:8080/api/v1/files/download/" + uniqueFileName;

            Map<String, Object> response = new HashMap<>();
            response.put("originalName", originalFilename);
            response.put("fileName", uniqueFileName);
            response.put("fileUrl", fileUrl);
            response.put("size", file.getSize());
            response.put("contentType", file.getContentType());

            log.info("File uploaded thanh cong: {} (size: {} bytes)", uniqueFileName, file.getSize());
            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            log.error("Loi khi luu file: {}", originalFilename, ex);
            return ResponseEntity.internalServerError().body(Map.of("message", "Loi may chu khi luu file: " + ex.getMessage()));
        }
    }

    /**
     * API tai xuong hoac xem truc tiep file da upload.
     * GET /api/v1/files/download/{fileName}
     */
    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = this.storageDirectory.resolve(fileName).normalize();
            if (!Files.exists(filePath)) {
                Path[] candidateDirs = new Path[] {
                    Paths.get("..", "uploads"),
                    Paths.get("backend", "uploads"),
                    Paths.get("D:", "TUTOR_LMS", "uploads"),
                    Paths.get("D:", "TUTOR_LMS", "backend", "uploads")
                };
                for (Path dir : candidateDirs) {
                    Path candidate = dir.resolve(fileName).toAbsolutePath().normalize();
                    if (Files.exists(candidate)) {
                        filePath = candidate;
                        break;
                    }
                }
            }
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Xac dinh content type
            String contentType = null;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException ex) {
                log.warn("Khong the xac dinh content type cho file: {}", fileName);
            }
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException ex) {
            log.error("Loi duong dan file: {}", fileName, ex);
            return ResponseEntity.badRequest().build();
        }
    }
}
