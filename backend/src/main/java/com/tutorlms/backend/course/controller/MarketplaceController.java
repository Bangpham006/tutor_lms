package com.tutorlms.backend.course.controller;

import com.tutorlms.backend.course.dto.CourseDetailResponse;
import com.tutorlms.backend.course.dto.CourseResponse;
import com.tutorlms.backend.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * API Marketplace khoa hoc - KHONG yeu cau xac thuc.
 *
 * Cho phep bat ky nguoi dung nao (chua dang nhap) co the:
 * - Tim kiem, loc danh sach khoa hoc
 * - Xem thong tin chi tiet khoa hoc (fileUrl duoc an, chi hien tieu de tai lieu)
 *
 * Route duoc khai bao permitAll() trong SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/marketplace/courses")
@RequiredArgsConstructor
public class MarketplaceController {

    private final CourseService courseService;

    /**
     * Tim kiem va loc khoa hoc.
     *
     * @param keyword  Tu khoa tim kiem trong ten / mo ta khoa hoc (tuy chon)
     * @param tutorId  Loc theo ID gia su (tuy chon)
     * @return Danh sach khoa hoc phu hop
     */
    @GetMapping
    public ResponseEntity<List<CourseResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID tutorId
    ) {
        return ResponseEntity.ok(courseService.search(keyword, tutorId));
    }

    /**
     * Xem thong tin chi tiet mot khoa hoc.
     *
     * Tra ve day du thong tin: mo ta, danh sach ten tai lieu (fileUrl an),
     * danh sach bai tap va so luong hoc vien da dang ky.
     *
     * @param courseId ID khoa hoc
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetailResponse> detail(
            @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(courseService.getCourseDetail(courseId));
    }
}