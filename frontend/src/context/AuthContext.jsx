import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ====================================================================
 * QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP (AuthContext.jsx)
 * Lưu trữ thông tin người dùng đang đăng nhập và Token JWT
 * ====================================================================
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [nguoiDung, setNguoiDung] = useState(null);
  const [dangTai, setDangTai] = useState(true);

  // Khôi phục phiên đăng nhập khi tải lại trang
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (token && savedUser) {
        setNguoiDung(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Lỗi khôi phục phiên đăng nhập:', e);
    } finally {
      setDangTai(false);
    }
  }, []);

  // Hàm xử lý sau khi đăng nhập thành công
  const luuPhienDangNhap = (token, thongTinNguoiDung) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(thongTinNguoiDung));
    setNguoiDung(thongTinNguoiDung);
  };

  // Cập nhật thông tin profile khi chỉnh sửa
  const capNhatThongTinNguoiDung = (duLieuMoi) => {
    setNguoiDung((prev) => {
      const updated = { ...prev, ...duLieuMoi };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  // Hàm đăng xuất
  const dangXuat = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setNguoiDung(null);
  };

  return (
    <AuthContext.Provider
      value={{
        nguoiDung,
        dangTai,
        daDangNhap: !!nguoiDung,
        luuPhienDangNhap,
        capNhatThongTinNguoiDung,
        dangXuat,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
