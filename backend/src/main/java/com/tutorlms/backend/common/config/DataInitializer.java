package com.tutorlms.backend.common.config;

import com.tutorlms.backend.assignment.entity.Assignment;
import com.tutorlms.backend.assignment.repository.AssignmentRepository;
import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.auth.repository.UserRepository;
import com.tutorlms.backend.course.entity.Course;
import com.tutorlms.backend.course.entity.CourseEnrollment;
import com.tutorlms.backend.course.repository.CourseEnrollmentRepository;
import com.tutorlms.backend.course.repository.CourseRepository;
import com.tutorlms.backend.market.entity.MarketPost;
import com.tutorlms.backend.market.repository.MarketPostRepository;
import com.tutorlms.backend.material.entity.LessonMaterial;
import com.tutorlms.backend.material.repository.LessonMaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ====================================================================
 * TU DONG KHOI TAO DU LIEU MAU THAT VAO DATABASE
 * Co try-catch day du de KHONG BAO GIO crash app
 * Tat ca log ghi ra console de debug
 * ====================================================================
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonMaterialRepository materialRepository;
    private final AssignmentRepository assignmentRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final MarketPostRepository marketPostRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            log.info("========================================================");
            log.info(">>> BAT DAU KHOI TAO DU LIEU MAU CHO TUTORLMS...");
            log.info("========================================================");

            // BUOC 1: TAO USERS
            log.info("--- BUOC 1: Tao tai khoan nguoi dung ---");
            User thayTuan = taoUser("0988888888", "thaytuan@tutorlms.vn", "Thay Tuan Toan", "TUTOR",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80");
            User coLanAnh = taoUser("0977777777", "lananh@tutorlms.vn", "Co Lan Anh IELTS", "TUTOR",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80");
            User thayMinhLy = taoUser("0966666666", "minhly@tutorlms.vn", "Thay Minh Ly", "TUTOR",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80");
            User bichThao = taoUser("0912345678", "bichthao@tutorlms.vn", "Tran Bich Thao", "STUDENT",
                    "https://ui-avatars.com/api/?name=Tran+Bich+Thao&background=f97316&color=fff&bold=true");
            taoUser("0900000000", "admin@tutorlms.vn", "Quan Tri Vien LMS", "ADMIN", "");

            if (thayTuan == null || coLanAnh == null || thayMinhLy == null || bichThao == null) {
                log.error("!!! KHONG TAO DUOC USER -> DUNG LAI, KHONG TAO KHOA HOC");
                return;
            }
            log.info(">>> BUOC 1 HOAN TAT: Da co {} users trong DB", userRepository.count());

            // BUOC 2: TAO KHOA HOC
            log.info("--- BUOC 2: Tao khoa hoc ---");
            Course courseWeb = taoKhoaHoc(
                    "[CNTT101] Lap Trinh Web Toan Dien (HTML, CSS, JS, React)",
                    "Khoa hoc lap trinh web tu co ban den nang cao.",
                    BigDecimal.valueOf(1200000), thayTuan);
            Course courseToan = taoKhoaHoc(
                    "[TOAN12] Chinh Phuc 9+ Mon Toan Thi Tot Nghiep THPT",
                    "Tong hop ky thuat giai nhanh hinh khong gian, toa do Oxyz.",
                    BigDecimal.valueOf(890000), thayTuan);
            Course courseIelts = taoKhoaHoc(
                    "[ENG-IELTS] But Pha IELTS 7.5+ Toan Dien 4 Ky Nang",
                    "Chien thuat Reading Listening 8.0+, luyen Speaking tu nhien.",
                    BigDecimal.valueOf(1450000), coLanAnh);
            taoKhoaHoc("[LY102] Vat Ly Dai Cuong va Ky Thuat Tinh Toan",
                    "Phan tich hien tuong quang hoc, nhiet hoc, dien xoay chieu.",
                    BigDecimal.valueOf(750000), thayMinhLy);
            taoKhoaHoc("[CNTT201] Cau Truc Du Lieu va Giai Thuat Thuc Chien",
                    "Giai thuat sap xep, cay nhi phan, do thi, quy hoach dong.",
                    BigDecimal.valueOf(950000), thayTuan);
            taoKhoaHoc("[AI301] Nhap Mon Tri Tue Nhan Tao va Machine Learning",
                    "Mo hinh hoc may co ban, hoi quy tuyen tinh, mang no-ron.",
                    BigDecimal.valueOf(1600000), thayMinhLy);
            log.info(">>> BUOC 2 HOAN TAT: Da co {} khoa hoc trong DB", courseRepository.count());

            // BUOC 3: TAO TAI LIEU BAI GIANG
            if (courseWeb != null) {
                log.info("--- BUOC 3: Tao tai lieu bai giang ---");
                try {
                    if (materialRepository.findByCourse_IdOrderByCreatedAtDesc(courseWeb.getId()).isEmpty()) {
                        materialRepository.save(LessonMaterial.builder().course(courseWeb).tutor(thayTuan)
                                .title("Bai giang 1a: Gioi thieu HTTP, DNS va Client-Server")
                                .fileUrl("https://example.com/materials/bai1a.pdf")
                                .lectureLink("https://youtube.com/watch?v=demo1").build());
                        materialRepository.save(LessonMaterial.builder().course(courseWeb).tutor(thayTuan)
                                .title("Bai giang 1b: HTML5 Semantic va CSS3 Flexbox/Grid")
                                .fileUrl("https://example.com/materials/bai1b.pdf").build());
                        materialRepository.save(LessonMaterial.builder().course(courseWeb).tutor(thayTuan)
                                .title("Bai giang 2: JavaScript DOM va Event Listeners")
                                .fileUrl("https://example.com/materials/bai2.pdf").build());
                        materialRepository.save(LessonMaterial.builder().course(courseWeb).tutor(thayTuan)
                                .title("Bai giang 3: ES6+, Async/Await, Fetch API va RESTful")
                                .fileUrl("https://example.com/materials/bai3.pdf").build());
                        log.info(">>> Da tao 4 bai giang cho CNTT101");
                    } else {
                        log.info(">>> Bai giang CNTT101 da ton tai, bo qua");
                    }
                } catch (Exception e) {
                    log.error("!!! LOI tao bai giang: {}", e.getMessage());
                }
            }

            // BUOC 4: TAO BAI TAP
            if (courseWeb != null) {
                log.info("--- BUOC 4: Tao bai tap ve nha ---");
                try {
                    if (assignmentRepository.findByCourse_IdOrderByDueAtAsc(courseWeb.getId()).isEmpty()) {
                        assignmentRepository.save(Assignment.builder().course(courseWeb)
                                .title("Tutorial 01: Cai dat moi truong VS Code, Node.js va Git")
                                .content("Hoc vien cai dat moi truong lap trinh va nop anh git log.")
                                .dueAt(LocalDateTime.now().plusDays(5)).build());
                        assignmentRepository.save(Assignment.builder().course(courseWeb)
                                .title("Tutorial 02: Xay dung Landing Page Responsive voi Tailwind")
                                .content("Thuc hanh cat layout landing page tu Figma sang HTML/CSS.")
                                .dueAt(LocalDateTime.now().plusDays(10)).build());
                        assignmentRepository.save(Assignment.builder().course(courseWeb)
                                .title("Mini Project: Xay dung TodoList va Shopping Cart luu LocalStorage")
                                .content("Su dung JavaScript thuan thao tac DOM va LocalStorage.")
                                .dueAt(LocalDateTime.now().plusDays(15)).build());
                        log.info(">>> Da tao 3 bai tap cho CNTT101");
                    } else {
                        log.info(">>> Bai tap CNTT101 da ton tai, bo qua");
                    }
                } catch (Exception e) {
                    log.error("!!! LOI tao bai tap: {}", e.getMessage());
                }
            }

            // BUOC 5: GHI DANH HOC VIEN
            log.info("--- BUOC 5: Ghi danh hoc vien ---");
            if (courseWeb != null) ghiDanh(courseWeb, bichThao);
            if (courseToan != null) ghiDanh(courseToan, bichThao);
            if (courseIelts != null) ghiDanh(courseIelts, bichThao);
            log.info(">>> BUOC 5 HOAN TAT: Da co {} luot ghi danh", enrollmentRepository.count());

            // BUOC 6: TAO BAI DANG CHO GHEP LOP
            log.info("--- BUOC 6: Tao bai dang Cho ghep lop ---");
            try {
                if (marketPostRepository.count() == 0) {
                    marketPostRepository.save(MarketPost.builder()
                            .authorName("Chi Lan Phuong (Phu huynh)")
                            .authorAvatar("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80")
                            .authorRole("PHU_HUYNH").badgeType("TUYEN_GIA_SU")
                            .content("Can tim 1 gia su Tieng Anh cho con gai dang hoc lop 8 tai khu vuc Cau Giay.")
                            .subject("Tieng Anh Lop 8").location("Quan Cau Giay, Ha Noi")
                            .schedule("Toi Thu 3, Thu 6").fee("220.000d / buoi")
                            .likesCount(18).commentsCount(7).build());
                    marketPostRepository.save(MarketPost.builder()
                            .authorName("Thay Tuan Toan (Thac si Su Pham)")
                            .authorAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80")
                            .authorRole("GIA_SU").badgeType("VIDEO")
                            .content("Video Giai Nhanh: 3 buoc xu ly bai toan Ti so the tich khoi chop")
                            .mediaUrl("https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80")
                            .likesCount(84).commentsCount(23).build());
                    marketPostRepository.save(MarketPost.builder()
                            .authorName("Anh Hoang Nam (Phu huynh be lop 5)")
                            .authorAvatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80")
                            .authorRole("PHU_HUYNH").badgeType("TUYEN_GIA_SU")
                            .content("Tim sinh vien Bach Khoa hoac Su Pham day kem Toan va Tieng Viet on thi lop 6.")
                            .subject("Toan va Tieng Viet on thi lop 6").location("Quan Dong Da, Ha Noi")
                            .schedule("Chieu Thu 7 va Sang Chu Nhat").fee("200.000d / buoi")
                            .likesCount(9).commentsCount(3).build());
                    marketPostRepository.save(MarketPost.builder()
                            .authorName("Co Minh Thu (Gia su IELTS)")
                            .authorAvatar("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80")
                            .authorRole("GIA_SU").badgeType("CHIA_SE_KIEN_THUC")
                            .content("Chia se tron bo 100 Collocations thong dung nhat trong IELTS Writing Task 2.")
                            .mediaUrl("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80")
                            .likesCount(142).commentsCount(45).build());
                    log.info(">>> Da tao 4 bai dang cho Cho ghep lop");
                } else {
                    log.info(">>> Cho ghep lop da co {} bai dang, bo qua", marketPostRepository.count());
                }
            } catch (Exception e) {
                log.error("!!! LOI tao bai dang market: {}", e.getMessage());
            }

            log.info("========================================================");
            log.info(">>> KHOI TAO DU LIEU MAU HOAN TAT THANH CONG!");
            log.info(">>> Users: {} | Courses: {} | Enrollments: {} | Materials: {} | Posts: {}",
                    userRepository.count(), courseRepository.count(), enrollmentRepository.count(),
                    materialRepository.count(), marketPostRepository.count());
            log.info("========================================================");

        } catch (Exception e) {
            log.error("========================================================");
            log.error("!!! LOI NGHIEM TRONG KHI KHOI TAO DU LIEU MAU:");
            log.error("!!! Loai loi: {}", e.getClass().getSimpleName());
            log.error("!!! Thong bao: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("!!! Nguyen nhan goc: {}", e.getCause().getMessage());
            }
            log.error("!!! (App VAN CHAY BINH THUONG, chi khong co du lieu mau)");
            log.error("========================================================");
            // KHONG THROW -> APP VAN CHAY BINH THUONG
        }
    }

    private User taoUser(String phone, String email, String fullName, String role, String avatarUrl) {
        try {
            return userRepository.findByPhoneOrEmail(phone, email).orElseGet(() -> {
                User user = User.builder()
                        .phone(phone)
                        .email(email)
                        .fullName(fullName)
                        .role(role)
                        .password(passwordEncoder.encode("123456"))
                        .avatarUrl(avatarUrl)
                        .build();
                User saved = userRepository.save(user);
                log.info("  + Tao user OK: {} ({}) role={}", fullName, phone, role);
                return saved;
            });
        } catch (Exception e) {
            log.error("  ! LOI tao user {} ({}): {}", fullName, phone, e.getMessage());
            // Thu tim lai user da ton tai
            return userRepository.findByPhone(phone).orElse(null);
        }
    }

    private Course taoKhoaHoc(String title, String description, BigDecimal price, User tutor) {
        try {
            return courseRepository.findAll().stream()
                    .filter(c -> c.getTitle().equalsIgnoreCase(title))
                    .findFirst()
                    .orElseGet(() -> {
                        Course course = Course.builder()
                                .title(title).description(description)
                                .price(price).tutor(tutor).build();
                        Course saved = courseRepository.save(course);
                        log.info("  + Tao khoa hoc OK: {}", title);
                        return saved;
                    });
        } catch (Exception e) {
            log.error("  ! LOI tao khoa hoc {}: {}", title, e.getMessage());
            return null;
        }
    }

    private void ghiDanh(Course course, User student) {
        try {
            if (!enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId())) {
                enrollmentRepository.save(CourseEnrollment.builder()
                        .course(course).student(student).build());
                log.info("  + Ghi danh OK: {} -> {}", student.getFullName(), course.getTitle());
            }
        } catch (Exception e) {
            log.error("  ! LOI ghi danh: {}", e.getMessage());
        }
    }
}
