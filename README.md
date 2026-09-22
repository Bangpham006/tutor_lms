# TutorLMS Backend API

> Spring Boot 3.2.5 · Java 17 · PostgreSQL · WebSocket STOMP · VNPay

---

## Mục Lục

- [Giới thiệu](#giới-thiệu)
- [Tech Stack](#tech-stack)
- [Cài đặt & Chạy](#cài-đặt--chạy)
- [Cấu trúc Module](#cấu-trúc-module)
- [API Reference](#api-reference)
- [Kết nối WebSocket](#kết-nối-websocket)
- [Cấu hình môi trường](#cấu-hình-môi-trường)

---

## Giới thiệu

Backend REST API cho nền tảng gia sư trực tuyến **TutorLMS**. Hệ thống hỗ trợ:
- Quản lý người dùng (Học viên, Giảng viên, Admin) với xác thực JWT
- Khóa học, ghi danh, tài liệu học tập và bài tập
- Thanh toán trực tuyến qua cổng VNPay
- Chat phòng học và thông báo realtime qua WebSocket STOMP

---

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2.5 |
| Security | Spring Security + JWT (JJWT 0.11.5) |
| Database | PostgreSQL (Production) / H2 (Test) |
| ORM | Spring Data JPA / Hibernate |
| Realtime | WebSocket STOMP + SockJS |
| Thanh toán | VNPay Payment Gateway 2.1.0 |
| Build | Maven Wrapper (`./mvnw`) |
| Utils | Lombok, Jackson |

---

## Cài đặt & Chạy

### Yêu cầu
- JDK 17+
- PostgreSQL 14+
- Maven (hoặc dùng `mvnw` wrapper đi kèm)

### Chạy local

```bash
# Clone & vào thư mục backend
cd TUTOR_LMS/backend

# Cấu hình database và VNPay trong application.yml

# Chạy ứng dụng
./mvnw spring-boot:run

# Chạy toàn bộ unit test
./mvnw test
```

---

## Cấu trúc Module

```
src/main/java/com/tutorlms/backend/
├── auth/           # Xác thực người dùng (JWT, đăng ký, đăng nhập)
├── course/         # Khóa học, ghi danh, marketplace
├── assignment/     # Bài tập, nộp bài, chấm điểm
├── material/       # Tài liệu học tập
├── payment/        # Thanh toán VNPay
├── chat/           # Chat realtime phòng học (WebSocket)
├── notification/   # Thông báo realtime (WebSocket)
├── ai/             # Tính năng AI
└── common/         # Exception handlers, utilities
```

---

## API Reference

### 🔐 Xác thực (Auth)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/api/v1/auth/login` | Đăng nhập, nhận JWT token |
| `GET` | `/api/v1/auth/me` | Xem thông tin tài khoản hiện tại |

---

### 📚 Khóa Học (Course)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/courses` | Public | Danh sách khóa học (có filter theo từ khóa, tutor) |
| `GET` | `/api/v1/courses/{id}` | Public | Chi tiết khóa học (ẩn file tài liệu nếu chưa ghi danh) |
| `POST` | `/api/v1/tutor/courses` | TUTOR | Tạo khóa học mới |
| `GET` | `/api/v1/tutor/courses` | TUTOR | Danh sách khóa học của tôi |
| `POST` | `/api/v1/student/courses/{id}/enroll` | STUDENT | Ghi danh khóa học miễn phí |
| `GET` | `/api/v1/student/courses` | STUDENT | Danh sách khóa học đã ghi danh |
| `GET` | `/api/v1/student/courses/{id}/detail` | STUDENT đã enroll | Chi tiết đầy đủ (hiện file tài liệu) |

---

### 📝 Bài Tập (Assignment)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/tutor/courses/{id}/assignments` | TUTOR | Đăng bài tập mới |
| `GET` | `/api/v1/courses/{id}/assignments` | Đã enroll | Danh sách bài tập của khóa học |
| `POST` | `/api/v1/student/assignments/{id}/submit` | STUDENT | Nộp bài tập |
| `POST` | `/api/v1/tutor/submissions/{id}/grade` | TUTOR | Chấm điểm bài nộp |
| `GET` | `/api/v1/tutor/courses/{id}/submissions` | TUTOR | Xem tất cả bài nộp của lớp |

> ⚡ Khi giảng viên **đăng bài tập mới** hoặc **chấm điểm xong**, hệ thống tự động gửi thông báo realtime đến học viên liên quan.

---

### 📎 Tài Liệu Học (Material)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/tutor/courses/{id}/materials` | TUTOR | Đăng tài liệu bài học |
| `PUT` | `/api/v1/tutor/materials/{id}` | TUTOR | Cập nhật tài liệu |
| `DELETE` | `/api/v1/tutor/materials/{id}` | TUTOR | Xóa tài liệu |
| `GET` | `/api/v1/student/courses/{id}/materials` | STUDENT đã enroll | Xem tài liệu (có file URL) |

> ⚡ Khi giảng viên **đăng tài liệu mới**, hệ thống tự động thông báo realtime đến toàn bộ học viên đã ghi danh.

---

### 💳 Thanh Toán VNPay (Payment)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/student/payment/create` | STUDENT | Tạo đơn thanh toán, nhận URL chuyển hướng VNPay |
| `GET` | `/api/v1/payment/vnpay-ipn` | Public | **Webhook VNPay** — xử lý kết quả server-to-server, tự động kích hoạt ghi danh |
| `GET` | `/api/v1/payment/vnpay-return` | Public | Điểm nhận redirect sau khi người dùng hoàn tất trên VNPay |

**Luồng thanh toán:**
1. Học viên gọi `/payment/create` → nhận `paymentUrl`
2. Frontend redirect người dùng sang trang VNPay
3. Sau khi thanh toán, VNPay gọi webhook `/vnpay-ipn` về server (server-to-server, không qua client)
4. Server xác minh chữ ký HMAC-SHA512, tự động tạo `CourseEnrollment` cho học viên
5. Người dùng được redirect về `/vnpay-return` để hiển thị kết quả

> 🔒 Khóa học **miễn phí** (`price = 0`) sẽ ghi danh ngay lập tức mà không cần qua VNPay.

---

### 💬 Chat Phòng Học (REST)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/chat/course/{id}/history` | TUTOR hoặc STUDENT đã enroll | Lịch sử tin nhắn phòng học |

---

### 🔔 Thông Báo (Notification)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/student/notifications` | STUDENT | Danh sách thông báo |
| `GET` | `/api/v1/student/notifications/unread-count` | STUDENT | Số thông báo chưa đọc |
| `PATCH` | `/api/v1/student/notifications/read-all` | STUDENT | Đánh dấu tất cả đã đọc |
| `PATCH` | `/api/v1/student/notifications/{id}/read` | STUDENT | Đánh dấu 1 thông báo đã đọc |

---

## Kết nối WebSocket

**Endpoint kết nối:** `ws://<domain>/ws` (hỗ trợ SockJS fallback)

**Xác thực:** Gửi JWT token trong STOMP CONNECT header:
```javascript
stompClient.connect({ Authorization: "Bearer <jwt_token>" }, callback)
```

### Kênh Subscribe (lắng nghe)

| Kênh | Mô tả |
|---|---|
| `/topic/course/{courseId}/chat` | Tin nhắn realtime trong phòng học |
| `/topic/course/{courseId}/notify` | Thông báo broadcast cho cả lớp (bài tập, tài liệu mới) |
| `/user/queue/notifications` | Thông báo cá nhân (điểm bài tập, ...) |

### Kênh Publish (gửi)

| Kênh | Mô tả |
|---|---|
| `/app/course/{courseId}/send-message` | Gửi tin nhắn vào phòng học |

---

## Cấu hình môi trường

```yaml
# src/main/resources/application.yml

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tutorlms_db
    username: your_db_user
    password: your_db_password

# JWT secret key
jwt:
  secret: your_jwt_secret_at_least_256_bits

# VNPay config (lấy từ VNPay merchant portal)
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
```

> ⚠️ Không commit file `application.yml` chứa secret key lên Git. Sử dụng biến môi trường hoặc `application-local.yml` được gitignore.
