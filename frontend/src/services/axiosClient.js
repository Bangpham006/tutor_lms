import axios from 'axios';

/**
 * ====================================================================
 * CẤU HÌNH AXIOS CLIENT (axiosClient.js)
 * Cầu nối trung tâm gửi request từ Frontend sang Backend Spring Boot
 * Tự động gắn Token JWT vào Header: Authorization: Bearer <token>
 * ====================================================================
 */
const apiBase = import.meta.env.VITE_API_URL || '';

const axiosClient = axios.create({
  baseURL: apiBase ? `${apiBase.replace(/\/$/, '')}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// INTERCEPTOR GỬI ĐI (Request): Tự động lấy JWT từ localStorage đính kèm vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR TRẢ VỀ (Response): Trả thẳng dữ liệu data và bắt lỗi phiên hết hạn
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập (401).');
      // Không ép logout ngay để tránh làm gián đoạn trải nghiệm người dùng
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
