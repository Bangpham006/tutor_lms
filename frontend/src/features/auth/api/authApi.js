import axiosClient from '../../../services/axiosClient';

/**
 * ====================================================================
 * API XÁC THỰC NGƯỜI DÙNG (authApi.js)
 * Kết nối với Spring Boot: /api/v1/auth
 * ====================================================================
 */
export const authApi = {
  /**
   * Đăng nhập tài khoản
   * @param {Object} data { account: 'email_hoac_sdt', password: 'mat_khau' }
   * @returns {Promise<{ token, role, fullName, phone, email }>}
   */
  dangNhap: (data) => {
    return axiosClient.post('/auth/login', {
      account: data.account,
      password: data.password,
    });
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} data { fullName, phone, email, password, role: 'ROLE_STUDENT' | 'ROLE_TUTOR' | 'ROLE_PARENT' }
   */
  dangKy: (data) => {
    return axiosClient.post('/auth/register', {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      password: data.password,
      role: data.role,
      avatarUrl: data.avatarUrl || '',
    });
  },

  /**
   * Lấy thông tin người dùng hiện tại đang đăng nhập
   */
  layThongTinToi: () => {
    return axiosClient.get('/auth/me');
  },

  /**
   * Lấy hồ sơ cá nhân đầy đủ (headline, bio, avatar, email, v.v.)
   */
  layHoSoCaNhan: () => {
    return axiosClient.get('/auth/profile');
  },

  /**
   * Cập nhật hồ sơ cá nhân lên database
   */
  capNhatHoSo: (data) => {
    return axiosClient.put('/auth/profile', data);
  },

  /**
   * Lấy hồ sơ công khai của người dùng / gia sư theo ID
   */
  layHoSoTheoId: (userId) => {
    return axiosClient.get(`/auth/users/${userId}`);
  },
};
