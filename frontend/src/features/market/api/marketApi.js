import axiosClient from '../../../services/axiosClient';

/**
 * ====================================================================
 * API CHỢ GHÉP LỚP (marketApi.js)
 * Kết nối với Spring Boot:
 *   - /api/v1/market/posts
 *   - /api/v1/market/posts/{postId}/like
 *   - /api/v1/market/posts/{postId}/status
 *   - /api/v1/market/posts/{postId}/comments
 *   - /api/v1/market/posts/{postId}/apply
 *   - /api/v1/market/posts/{postId}/applications
 *   - /api/v1/market/my-applications
 *   - /api/v1/market/applications/{applicationId}/status
 * ====================================================================
 */
export const marketApi = {
  /**
   * Lấy danh sách toàn bộ bài đăng từ Database
   */
  layDanhSachBaiDang: () => {
    return axiosClient.get('/market/posts');
  },

  /**
   * Đăng bài mới lên Chợ ghép lớp (Lưu vào Database)
   */
  taoBaiDangMoi: (data) => {
    return axiosClient.post('/market/posts', data);
  },

  /**
   * Thích bài đăng
   */
  thichBaiDang: (postId) => {
    return axiosClient.post(`/market/posts/${postId}/like`);
  },

  /**
   * Đổi trạng thái bài đăng (OPEN, MATCHED, CLOSED)
   */
  doiTrangThaiBaiDang: (postId, status) => {
    return axiosClient.patch(`/market/posts/${postId}/status`, { status });
  },

  /**
   * Lấy danh sách bình luận của bài viết
   */
  layBinhLuan: (postId) => {
    return axiosClient.get(`/market/posts/${postId}/comments`);
  },

  /**
   * Gửi bình luận mới vào bài viết
   */
  guiBinhLuan: (postId, data) => {
    return axiosClient.post(`/market/posts/${postId}/comments`, data);
  },

  /**
   * Gia sư gửi hồ sơ ứng tuyển nhận lớp
   */
  ungTuyenNhanLop: (postId, data) => {
    return axiosClient.post(`/market/posts/${postId}/apply`, data);
  },

  /**
   * Chủ bài đăng xem danh sách các gia sư đã ứng tuyển
   */
  layDanhSachUngTuyen: (postId) => {
    return axiosClient.get(`/market/posts/${postId}/applications`);
  },

  /**
   * Gia sư xem các lớp mình đã ứng tuyển
   */
  layDonUngTuyenCuaToi: () => {
    return axiosClient.get('/market/my-applications');
  },

  /**
   * Chủ bài đăng duyệt/từ chối đơn ứng tuyển của gia sư
   */
  capNhatTrangThaiDon: (applicationId, status) => {
    return axiosClient.patch(`/market/applications/${applicationId}/status`, { status });
  },
};
