# TutorLMS — Backend API

> **Nền tảng gia sư trực tuyến** · Spring Boot 3.2.5 · Java 17 · PostgreSQL · WebSocket STOMP · VNPay · OpenAI

---

## Mục Lục

1. [Tổng quan sản phẩm](#1-tổng-quan-sản-phẩm)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Tech Stack](#3-tech-stack)
4. [Phân quyền (RBAC)](#4-phân-quyền-rbac)
5. [Cài đặt & Chạy local](#5-cài-đặt--chạy-local)
6. [Cấu trúc Module](#6-cấu-trúc-module)
7. [API Reference](#7-api-reference)
8. [Kết nối WebSocket Realtime](#8-kết-nối-websocket-realtime)
9. [Luồng nghiệp vụ chính](#9-luồng-nghiệp-vụ-chính)
10. [Cấu hình môi trường](#10-cấu-hình-môi-trường)

---

## 1. Tổng quan sản phẩm

**TutorLMS** là nền tảng kết nối **gia sư** (Tutor) và **học viên** (Student) trực tuyến. Hệ thống cho phép:

| Vai trò | Có thể làm gì |
|---|---|
| **Học viên** | Tìm kiếm & ghi danh khóa học, học tài liệu, nộp bài tập, nhận điểm, chat với lớp, thanh toán qua VNPay |
| **Giảng viên** | Tạo & quản lý khóa học, đăng tài liệu bài giảng, ra bài tập, chấm điểm, dùng AI tóm tắt bài giảng & tạo đề trắc nghiệm tự động |
| **Admin** | Quản trị toàn hệ thống (có quyền của TUTOR) |

**Điểm nổi bật:**
- 🎓 Marketplace khóa học với thanh toán VNPay (HMAC-SHA512)
- ⚡ Realtime: Chat phòng học + thông báo qua WebSocket STOMP
- 🤖 Tích hợp OpenAI: tóm tắt PDF & sinh câu hỏi trắc nghiệm tự động
- 🔒 Xác thực JWT, đăng nhập bằng số điện thoại

---

## 2. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend / App)                  │
│              REST HTTP/S          WebSocket (STOMP + SockJS)    │
└────────────────────┬──────────────────────┬─────────────────────┘
                     │                      │
┌────────────────────▼──────────────────────▼─────────────────────┐
│                   SPRING BOOT BACKEND (Port 8080)               │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │   Auth   │ │  Course  │ │ Payment  │ │   AI (OpenAI)    │   │
│  │  (JWT)   │ │Enrollment│ │  VNPay   │ │ Summarize / MCQ  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │Assignment│ │ Material │ │   Chat   │ │  Notification    │   │
│  │  Grade   │ │  Upload  │ │ WebSocket│ │   WebSocket      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │  JPA / Hibernate
┌─────────────────────────▼───────────────────────────────────────┐
│              PostgreSQL Database (Production)                   │
│              H2 In-Memory (Testing only)                        │
└─────────────────────────────────────────────────────────────────┘

External Services:
  VNPay Payment Gateway  ←→  /api/v1/payment/vnpay-ipn  (Webhook)
  OpenAI API             ←→  AiService (Summarize / MCQ)
```

---

## 3. Tech Stack

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Language | Java 17 | |
| Framework | Spring Boot 3.2.5 | |
| Security | Spring Security + JWT | JJWT 0.11.5, đăng nhập bằng số điện thoại |
| Database | PostgreSQL 14+ | Production |
| Database (Test) | H2 In-Memory | Chỉ dùng khi chạy test |
| ORM | Spring Data JPA / Hibernate | |
| Realtime | WebSocket STOMP + SockJS | |
| Thanh toán | VNPay 2.1.0 | HMAC-SHA512, hỗ trợ IPN webhook |
| AI | OpenAI API | Tóm tắt PDF + tạo câu hỏi trắc nghiệm |
| Build | Maven Wrapper (`mvnw`) | |
| Utilities | Lombok, Jackson | |

---

## 4. Phân quyền (RBAC)

Hệ thống có **3 vai trò** được kiểm soát bởi Spring Security `@PreAuthorize`:

```
ROLE_STUDENT   →  Học viên (mặc định khi đăng ký)
ROLE_TUTOR     →  Giảng viên
ROLE_ADMIN     →  Quản trị viên (có tất cả quyền của TUTOR)
```

| Chức năng | Public | STUDENT | TUTOR / ADMIN |
|---|:---:|:---:|:---:|
| Xem danh sách & chi tiết khóa học | ✅ | ✅ | ✅ |
| Ghi danh khóa học miễn phí | | ✅ | |
| Thanh toán qua VNPay | | ✅ | |
| Xem tài liệu bài học (sau khi ghi danh) | | ✅ | ✅ |
| Chat phòng học | | ✅ | ✅ |
| Nhận thông báo realtime | | ✅ | |
| Nộp bài tập | | ✅ | |
| Tạo & quản lý khóa học | | | ✅ |
| Đăng tài liệu bài học | | | ✅ |
| Ra bài tập & chấm điểm | | | ✅ |
| AI: Tóm tắt PDF / tạo MCQ | | | ✅ |

> **Lưu ý bảo mật:** Học viên chưa ghi danh sẽ không thấy URL file tài liệu dù đọc được metadata khóa học.

---

## 5. Cài đặt & Chạy local

### Yêu cầu

- JDK 17+
- PostgreSQL 14+
- Maven (hoặc dùng `mvnw` wrapper đi kèm)

### Các bước

```bash
# 1. Clone repo và vào thư mục backend
cd TUTOR_LMS/backend

# 2. Tạo database PostgreSQL
psql -U postgres -c "CREATE DATABASE tutorlms_db;"

# 3. Cấu hình kết nối DB, JWT, VNPay, OpenAI trong:
#    src/main/resources/application.yml

# 4. Chạy ứng dụng
./mvnw spring-boot:run
# → Server khởi động tại http://localhost:8080

# 5. Chạy toàn bộ unit test (73 tests)
./mvnw test
```

> ⚠️ **Windows:** Maven Surefire được cấu hình `forkCount=0` để tránh crash JVM do giới hạn bộ nhớ ảo.

---

## 6. Cấu trúc Module

```
src/main/java/com/tutorlms/backend/
│
├── auth/               # Xác thực & phân quyền
│   ├── entity/         → User.java (STUDENT | TUTOR | ADMIN, đăng nhập bằng phone)
│   ├── config/         → JwtService, JwtAuthenticationFilter, SecurityConfig
│   ├── controller/     → AuthController (register, login, me)
│   └── service/        → AuthService
│
├── course/             # Khóa học & ghi danh
│   ├── entity/         → Course.java, CourseEnrollment.java
│   ├── controller/     → MarketplaceController, TutorCourseController, StudentCourseController
│   └── service/        → CourseService
│
├── assignment/         # Bài tập & chấm điểm
│   ├── entity/         → Assignment.java, Submission.java
│   ├── controller/     → TutorAssignmentController, StudentAssignmentController
│   └── service/        → AssignmentService  ← tự động gửi notification
│
├── material/           # Tài liệu học tập
│   ├── entity/         → LessonMaterial.java
│   ├── controller/     → TutorMaterialController, StudentMaterialController
│   └── service/        → LessonMaterialService  ← tự động gửi notification
│
├── payment/            # Thanh toán VNPay
│   ├── config/         → VnPayConfig.java
│   ├── entity/         → Order.java, Transaction.java
│   ├── controller/     → PaymentController, VnPayCallbackController
│   └── service/        → PaymentService, VnPayService
│
├── chat/               # Chat realtime phòng học
│   ├── entity/         → ChatMessage.java
│   ├── controller/     → ChatController (@MessageMapping), ChatRestController (history)
│   └── service/        → ChatService
│
├── notification/       # Thông báo realtime
│   ├── entity/         → Notification.java (NEW_ASSIGNMENT | SCORE_PUBLISHED | NEW_MATERIAL | SYSTEM)
│   ├── controller/     → NotificationController
│   └── service/        → NotificationService (@Async broadcast)
│
├── ai/                 # Tính năng AI (OpenAI)
│   ├── client/         → OpenAiClient, PdfTextExtractor
│   ├── controller/     → TutorAiController
│   └── service/        → AiService (summarize PDF, generate MCQ)
│
└── common/             # Dùng chung
    └── exception/      → GlobalExceptionHandler, BadRequestException, ...
```

---

## 7. API Reference

> **Base URL:** `http://localhost:8080/api/v1`
>
> **Xác thực:** Thêm header `Authorization: Bearer <jwt_token>` cho tất cả endpoint yêu cầu đăng nhập.

---

### 🔐 Xác thực (Auth)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Đăng ký tài khoản |
| `POST` | `/auth/login` | Public | Đăng nhập, nhận JWT |
| `GET` | `/auth/me` | Đã đăng nhập | Thông tin tài khoản hiện tại |

**Ví dụ — Đăng nhập:**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phone": "0901234567",
  "password": "your_password"
}
```

```json
// Response 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": "uuid-string",
  "role": "STUDENT"
}
```

---

### 📚 Khóa Học (Course)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/courses` | Public | Danh sách khóa học (filter: `?keyword=`, `?tutorId=`) |
| `GET` | `/courses/{id}` | Public | Chi tiết khóa học (file tài liệu ẩn nếu chưa ghi danh) |
| `POST` | `/tutor/courses` | TUTOR | Tạo khóa học mới |
| `GET` | `/tutor/courses` | TUTOR | Danh sách khóa học của tôi |
| `POST` | `/student/courses/{id}/enroll` | STUDENT | Ghi danh khóa học **miễn phí** |
| `GET` | `/student/courses` | STUDENT | Danh sách khóa học đã ghi danh |
| `GET` | `/student/courses/{id}/detail` | STUDENT đã enroll | Chi tiết đầy đủ (có URL file tài liệu) |

**Ví dụ — Tạo khóa học:**

```http
POST /api/v1/tutor/courses
Authorization: Bearer <tutor_token>
Content-Type: application/json

{
  "title": "Lập trình Java cơ bản",
  "description": "Khóa học dành cho người mới bắt đầu",
  "price": 299000
}
```

---

### 📝 Bài Tập (Assignment)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/tutor/courses/{id}/assignments` | TUTOR | Đăng bài tập mới _(→ thông báo realtime đến học viên)_ |
| `GET` | `/courses/{id}/assignments` | Đã enroll | Danh sách bài tập |
| `POST` | `/student/assignments/{id}/submit` | STUDENT | Nộp bài tập |
| `POST` | `/tutor/submissions/{id}/grade` | TUTOR | Chấm điểm _(→ thông báo realtime đến học viên)_ |
| `GET` | `/tutor/courses/{id}/submissions` | TUTOR | Xem tất cả bài nộp của lớp |

---

### 📎 Tài Liệu Học (Material)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/tutor/courses/{id}/materials` | TUTOR | Đăng tài liệu bài học _(→ thông báo realtime đến học viên)_ |
| `PUT` | `/tutor/materials/{id}` | TUTOR | Cập nhật tài liệu |
| `DELETE` | `/tutor/materials/{id}` | TUTOR | Xóa tài liệu |
| `GET` | `/student/courses/{id}/materials` | STUDENT đã enroll | Xem tài liệu (có URL file) |

---

### 💳 Thanh Toán VNPay (Payment)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/student/payment/create` | STUDENT | Tạo đơn thanh toán → nhận URL redirect VNPay |
| `GET` | `/payment/vnpay-ipn` | Public (VNPay gọi) | **Webhook** server-to-server, xác minh HMAC, tự động enroll |
| `GET` | `/payment/vnpay-return` | Public | Redirect sau khi người dùng hoàn tất trên VNPay |

**Ví dụ — Tạo đơn thanh toán:**

```http
POST /api/v1/student/payment/create
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "courseId": "uuid-of-course"
}
```

```json
// Response 200 OK
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=..."
}
```

> **Lưu ý:** Khóa học có `price = 0` sẽ ghi danh ngay mà **không** cần redirect VNPay.

---

### 💬 Chat Phòng Học

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/chat/course/{id}/history` | TUTOR hoặc STUDENT đã enroll | Lịch sử tin nhắn |

> Gửi tin nhắn mới qua **WebSocket** (xem mục 8).

---

### 🔔 Thông Báo (Notification)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/student/notifications` | STUDENT | Danh sách thông báo (phân trang) |
| `GET` | `/student/notifications/unread-count` | STUDENT | Số thông báo chưa đọc |
| `PATCH` | `/student/notifications/read-all` | STUDENT | Đánh dấu tất cả đã đọc |
| `PATCH` | `/student/notifications/{id}/read` | STUDENT | Đánh dấu 1 thông báo đã đọc |

---

### 🤖 AI — Hỗ trợ Giảng viên (AI)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/tutor/materials/{id}/ai/summarize` | TUTOR | Tóm tắt tài liệu PDF bằng AI (tiếng Việt) |
| `POST` | `/tutor/materials/{id}/ai/generate-mcq` | TUTOR | Tạo bộ câu hỏi trắc nghiệm từ tài liệu |

**Ví dụ — Tạo câu hỏi trắc nghiệm:**

```http
POST /api/v1/tutor/materials/{materialId}/ai/generate-mcq
Authorization: Bearer <tutor_token>
Content-Type: application/json

{
  "questionCount": 5
}
```

```json
// Response 200 OK
{
  "materialId": "uuid",
  "title": "Bài 1 - Biến và kiểu dữ liệu",
  "questions": [
    {
      "question": "Kiểu dữ liệu nào dùng để lưu số nguyên trong Java?",
      "options": ["A. float", "B. int", "C. String", "D. boolean"],
      "correctAnswer": "B",
      "explanation": "Kiểu int dùng để lưu số nguyên 32-bit trong Java."
    }
  ]
}
```

---

## 8. Kết nối WebSocket Realtime

**Endpoint:** `ws://localhost:8080/ws` _(hỗ trợ SockJS fallback cho trình duyệt cũ)_

**Xác thực:** Gửi JWT trong header lúc CONNECT:

```javascript
const stompClient = new StompJs.Client({
  brokerURL: 'ws://localhost:8080/ws',
  connectHeaders: { Authorization: 'Bearer <jwt_token>' }
});
```

### Kênh Subscribe (lắng nghe sự kiện)

| Kênh | Ai nhận | Nội dung |
|---|---|---|
| `/topic/course/{courseId}/chat` | Tất cả trong lớp | Tin nhắn chat mới |
| `/topic/course/{courseId}/notify` | Tất cả trong lớp | Bài tập mới, tài liệu mới |
| `/user/queue/notifications` | Riêng từng học viên | Điểm bài tập được chấm |

### Kênh Publish (gửi tin)

| Kênh | Mô tả |
|---|---|
| `/app/course/{courseId}/send-message` | Gửi tin nhắn vào phòng học |

---

## 9. Luồng nghiệp vụ chính

### Luồng Thanh toán & Ghi danh

```
Student                 Backend                  VNPay
  │                        │                       │
  │── POST /payment/create ──▶                      │
  │                        │── Tạo Order (PENDING) │
  │◀── { paymentUrl } ─────│                       │
  │                        │                       │
  │── Redirect user ────────────────────────────▶  │
  │                        │     (User thanh toán) │
  │                        │◀── IPN Webhook ────── │
  │                        │  Xác minh HMAC-SHA512 │
  │                        │  Tạo CourseEnrollment │
  │                        │  Order.status = SUCCESS│
  │◀── Redirect về /vnpay-return ──────────────── │
```

### Luồng Thông báo Realtime

```
Tutor đăng bài tập
        │
        ▼
AssignmentService.create()
        │
        ▼
NotificationService.notifyNewAssignment()  [@Async]
        │
        ├── Lưu Notification vào DB (mỗi học viên 1 bản)
        │
        └── Push STOMP:
             ├── /topic/course/{id}/notify  (broadcast cả lớp)
             └── /user/queue/notifications  (từng học viên)
```

---

## 10. Cấu hình môi trường

Tạo file `src/main/resources/application.yml` (không commit lên Git):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tutorlms_db
    username: your_db_user
    password: your_db_password
  jpa:
    hibernate:
      ddl-auto: update         # "validate" cho production

# JWT
jwt:
  secret: your_jwt_secret_key_at_least_256_bits_long
  expiration: 86400000         # 24 giờ (ms)

# VNPay (lấy từ VNPay merchant portal)
vnpay:
  tmn-code: YOUR_TMN_CODE
  hash-secret: YOUR_HASH_SECRET
  payment-url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
  return-url: http://your-domain.com/api/v1/payment/vnpay-return
  version: "2.1.0"
  command: pay
  currency-code: VND
  locale: vn
  order-type: other

# OpenAI (dùng cho tính năng AI)
openai:
  api-key: sk-your-openai-api-key
  model: gpt-4o-mini
```

> ⚠️ **Bảo mật:** Thêm `application.yml` vào `.gitignore`. Dùng biến môi trường hoặc `application-local.yml` riêng cho từng môi trường.

---

## Error Codes

| HTTP Status | Ý nghĩa |
|---|---|
| `200 OK` | Thành công |
| `201 Created` | Tạo mới thành công |
| `400 Bad Request` | Dữ liệu đầu vào không hợp lệ |
| `401 Unauthorized` | Chưa đăng nhập hoặc token hết hạn |
| `403 Forbidden` | Không đủ quyền truy cập |
| `404 Not Found` | Resource không tồn tại |
| `409 Conflict` | Trùng lặp (ví dụ: đã ghi danh rồi) |
| `500 Internal Server Error` | Lỗi hệ thống |

---

*Được xây dựng với ❤️ bằng Spring Boot · Tài liệu cập nhật lần cuối: 09/2026*
