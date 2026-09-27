import axiosClient from '../../../services/axiosClient';

/**
 * ====================================================================
 * API KHÓA HỌC & HỌC LIỆU (courseApi.js)
 * Kết nối với Spring Boot:
 *   - /api/v1/marketplace/courses
 *   - /api/v1/student/courses
 *   - /api/v1/student/materials
 *   - /api/v1/student/assignments
 * ====================================================================
 */
export const courseApi = {
  /**
   * Lấy danh sách khóa học trên chợ đào tạo (Công khai)
   */
  layDanhSachKhoaHocChung: (tuKhoa = '') => {
    const params = tuKhoa ? { keyword: tuKhoa } : {};
    return axiosClient.get('/marketplace/courses', { params });
  },

  /**
   * Xem thông tin chi tiết một khóa học
   */
  layChiTietKhoaHoc: (courseId) => {
    return axiosClient.get(`/marketplace/courses/${courseId}`);
  },

  /**
   * Lấy danh sách khóa học của học viên đang đăng nhập
   */
  layKhoaHocCuaToi: () => {
    return axiosClient.get('/student/courses/me');
  },

  /**
   * Đăng ký tham gia khóa học (hỗ trợ mật khẩu ghi danh nếu có)
   */
  dangKyKhoaHoc: (courseId, data = {}) => {
    return axiosClient.post(`/student/courses/${courseId}/enroll`, data);
  },

  /**
   * Lấy danh sách tài liệu bài giảng của khóa học
   */
  layTaiLieuKhoaHoc: (courseId) => {
    return axiosClient.get(`/student/courses/${courseId}/materials`);
  },

  /**
   * Lấy danh sách bài tập về nhà của khóa học
   */
  layBaiTapKhoaHoc: (courseId) => {
    return axiosClient.get(`/student/courses/${courseId}/assignments`);
  },

  /**
   * Nộp bài tập về nhà
   */
  nopBaiTap: (assignmentId, data) => {
    return axiosClient.post(`/student/assignments/${assignmentId}/submissions`, data);
  },

  // ==========================================
  // DÀNH CHO GIA SƯ (TUTOR APIS)
  // ==========================================
  /**
   * Lấy danh sách khóa học do gia sư hiện tại sở hữu
   */
  layKhoaHocCuaGiaSu: () => {
    return axiosClient.get('/tutor/courses');
  },

  /**
   * Tạo khóa học mới (kèm mật khẩu bảo vệ hoặc để trống nếu công khai)
   */
  taoKhoaHocMoi: (data) => {
    return axiosClient.post('/tutor/courses', data);
  },

  /**
   * Cập nhật thông tin khóa học
   */
  capNhatKhoaHoc: (courseId, data) => {
    return axiosClient.put(`/tutor/courses/${courseId}`, data);
  },

  /**
   * Xóa khóa học
   */
  xoaKhoaHoc: (courseId) => {
    return axiosClient.delete(`/tutor/courses/${courseId}`);
  },

  /**
   * Lấy danh sách tài liệu của khóa học (Gia sư)
   */
  layTaiLieuGiaSu: (courseId) => {
    return axiosClient.get(`/tutor/courses/${courseId}/materials`);
  },

  /**
   * Đăng tài liệu / bài giảng mới
   */
  dangTaiLieuMoi: (courseId, data) => {
    return axiosClient.post(`/tutor/courses/${courseId}/materials`, data);
  },

  /**
   * Cập nhật thông tin tài liệu bài giảng
   */
  capNhatTaiLieu: (materialId, data) => {
    return axiosClient.put(`/tutor/materials/${materialId}`, data);
  },

  /**
   * Xóa tài liệu
   */
  xoaTaiLieu: (materialId) => {
    return axiosClient.delete(`/tutor/materials/${materialId}`);
  },

  /**
   * Lấy danh sách bài tập của khóa học (Gia sư)
   */
  layBaiTapGiaSu: (courseId) => {
    return axiosClient.get(`/tutor/courses/${courseId}/assignments`);
  },

  /**
   * Đăng bài tập mới
   */
  dangBaiTapMoi: (courseId, data) => {
    return axiosClient.post(`/tutor/courses/${courseId}/assignments`, data);
  },

  /**
   * Cập nhật bài tập về nhà
   */
  capNhatBaiTap: (assignmentId, data) => {
    return axiosClient.put(`/tutor/assignments/${assignmentId}`, data);
  },

  /**
   * Xóa bài tập
   */
  xoaBaiTap: (assignmentId) => {
    return axiosClient.delete(`/tutor/assignments/${assignmentId}`);
  },

  /**
   * Lấy danh sách bài nộp của học sinh
   */
  layDanhSachBaiNop: (assignmentId) => {
    return axiosClient.get(`/tutor/assignments/${assignmentId}/submissions`);
  },

  /**
   * Chấm điểm bài nộp
   */
  chamDiemBaiNop: (submissionId, data) => {
    return axiosClient.patch(`/tutor/submissions/${submissionId}/score`, data);
  },

  /**
   * Upload file trực tiếp lên máy chủ LMS (PDF, Word, PPT, Video, Ảnh...)
   * @param {FormData} formData Chứa trường 'file'
   */
  taiLenTepTin: (formData) => {
    return axiosClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // ==========================================
  // TÍNH NĂNG AI TRỢ GIẢNG (SLIDE SUMMARY & MCQ QUIZ)
  // ==========================================
  /**
   * Lấy trạng thái cấu hình AI (Key đã có chưa, model, provider)
   */
  kiemTraTrangThaiAi: () => {
    return axiosClient.get('/ai/status');
  },

  /**
   * Cập nhật API Key hoặc model runtime
   */
  cauHinhKeyAi: (data) => {
    return axiosClient.post('/ai/configure-key', data);
  },

  /**
   * Tóm tắt bài giảng / slide bằng AI thật
   * @param {string} materialId
   * @param {{ lectureContent?: string }} data
   */
  tomTatTaiLieuAi: (materialId, data = {}) => {
    return axiosClient.post(`/ai/materials/${materialId}/summarize`, data, { timeout: 120000 });
  },

  /**
   * Tạo bộ câu hỏi trắc nghiệm tự động từ slide / bài giảng
   * @param {string} materialId
   * @param {{ questionCount?: number, lectureContent?: string }} data
   */
  taoTracNghiemAi: (materialId, data = {}) => {
    return axiosClient.post(`/ai/materials/${materialId}/generate-mcq`, data, { timeout: 120000 });
  },

  /**
   * Gia sư lưu bộ câu hỏi trắc nghiệm AI thành Bài Tập chính thức trong Khóa Học
   * @param {string} courseId
   * @param {{ title: string, description?: string, dueAt?: string, questions: Array }} data
   */
  luuBaiTapTracNghiemAi: (courseId, data) => {
    return axiosClient.post(`/ai/courses/${courseId}/save-mcq-assignment`, data, { timeout: 60000 });
  },
};

