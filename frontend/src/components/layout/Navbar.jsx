import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Bell,
  User,
  Settings,
  BookOpen,
  Store,
  SlidersHorizontal,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * ====================================================================
 * COMPONENT: THANH ĐIỀU HƯỚNG CHÍNH (Navbar.jsx)
 * Sử dụng icon Lucide sắc nét, font chữ hiện đại, hỗ trợ dropdown mượt mà
 * ====================================================================
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { nguoiDung, daDangNhap, dangXuat } = useAuth();
  const [moMenuDiDong, setMoMenuDiDong] = useState(false);
  const [moMenuAvatar, setMoMenuAvatar] = useState(false);

  const handleDangXuat = () => {
    dangXuat();
    setMoMenuAvatar(false);
    alert('Đã đăng xuất tài khoản thành công!');
    navigate('/login');
  };

  const tenHienThi = nguoiDung?.fullName || 'Người dùng TutorLMS';
  const laGiaSu =
    nguoiDung?.role === 'ROLE_TUTOR' ||
    nguoiDung?.role === 'TUTOR' ||
    nguoiDung?.role === 'ROLE_ADMIN' ||
    nguoiDung?.role === 'ADMIN';

  const vaiTroHienThi =
    nguoiDung?.role === 'ROLE_TUTOR' || nguoiDung?.role === 'TUTOR'
      ? 'Gia Sư'
      : nguoiDung?.role === 'ROLE_PARENT' || nguoiDung?.role === 'PARENT'
      ? 'Phụ Huynh'
      : nguoiDung?.role === 'ROLE_ADMIN' || nguoiDung?.role === 'ADMIN'
      ? 'Quản Trị Viên'
      : 'Học Viên';

  return (
    <nav className="thanh_navbar_chinh fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
      <div className="khung_gioi_han_chieu_rong max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hang_noi_dung_navbar flex items-center justify-between h-16">
          
          {/* 1. LOGO & CÁC LINK CHÍNH */}
          <div className="khu_vuc_logo_va_menu flex items-center">
            <Link
              to="/"
              className="logo_thuong_hieu flex-shrink-0 flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                TutorLMS
              </span>
            </Link>

            <div className="menu_dieu_huong hidden md:block ml-8 lg:ml-10">
              <div className="danh_sach_link_menu flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm font-semibold text-slate-300">
                <Link
                  to="/"
                  className="link_menu hover:text-white hover:bg-slate-800/80 transition-colors px-3 py-2 rounded-xl"
                >
                  Trang Chủ
                </Link>
                <Link
                  to="/courses"
                  className="link_menu hover:text-white hover:bg-slate-800/80 transition-colors px-3 py-2 rounded-xl"
                >
                  Tất Cả Khóa Học
                </Link>
                <Link
                  to="/my-courses"
                  className="link_menu hover:text-white hover:bg-slate-800/80 transition-colors px-3 py-2 rounded-xl"
                >
                  Khóa Học Của Tôi
                </Link>
                <Link
                  to="/market"
                  className="link_menu hover:text-white hover:bg-slate-800/80 transition-colors px-3 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <span>Chợ Ghép Lớp</span>
                  <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    HOT
                  </span>
                </Link>
                <Link
                  to="/tutor-profile"
                  className="link_menu hover:text-white hover:bg-slate-800/80 transition-colors px-3 py-2 rounded-xl"
                >
                  Hồ Sơ Gia Sư
                </Link>
                {laGiaSu && (
                  <Link
                    to="/tutor/courses"
                    className="link_menu text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-colors px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Quản Lý Khóa Học</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 2. CỤM TIỆN ÍCH BÊN PHẢI */}
          <div className="cum_tien_ich_ben_phai hidden md:flex items-center space-x-3.5">
            {/* Nút tìm kiếm */}
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="nut_tim_kiem text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition"
              title="Tìm kiếm khóa học"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Nút chuông thông báo */}
            <button
              type="button"
              className="nut_thong_bao text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition relative"
              title="Thông báo mới"
            >
              <Bell className="w-4 h-4" />
              <span className="cham_do_thong_bao absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-slate-900" />
            </button>

            {/* Khối Tài khoản người dùng */}
            {daDangNhap ? (
              <div className="hop_avatar_nguoi_dung relative cursor-pointer">
                <div
                  onClick={() => setMoMenuAvatar(!moMenuAvatar)}
                  className="khung_nut_avatar flex items-center space-x-2.5 p-1.5 pl-2 rounded-2xl hover:bg-slate-800 border border-slate-700/60 transition"
                >
                  <img
                    src={
                      nguoiDung?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        tenHienThi
                      )}&background=f97316&color=fff&bold=true`
                    }
                    alt="Avatar"
                    className="anh_avatar_tron w-8 h-8 rounded-xl border border-orange-400/80 object-cover shadow-sm"
                  />
                  <div className="text-left hidden lg:block pr-1">
                    <div className="ten_nguoi_dung text-xs font-bold leading-none text-white truncate max-w-[120px]">{tenHienThi}</div>
                    <div className="vai_tro_nguoi_dung text-[10px] text-orange-400 font-semibold mt-0.5">{vaiTroHienThi}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Dropdown Menu */}
                {moMenuAvatar && (
                  <div className="menu_xo_xuong_avatar absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-slate-200 text-slate-800 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-slate-100 text-xs">
                      <div className="font-extrabold text-slate-900">{tenHienThi}</div>
                      <div className="text-slate-500 text-[11px] truncate">{nguoiDung?.email || 'Tài khoản hoạt động'}</div>
                    </div>
                    
                    <Link
                      to="/tutor-profile"
                      onClick={() => setMoMenuAvatar(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <User className="w-3.5 h-3.5 text-orange-500" />
                      <span>Xem Hồ Sơ Cá Nhân</span>
                    </Link>

                    <Link
                      to="/edit-profile"
                      onClick={() => setMoMenuAvatar(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Chỉnh Sửa Hồ Sơ</span>
                    </Link>

                    <Link
                      to="/courses"
                      onClick={() => setMoMenuAvatar(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tất Cả Khóa Học</span>
                    </Link>

                    <Link
                      to="/my-courses"
                      onClick={() => setMoMenuAvatar(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>Khóa Học Của Tôi</span>
                    </Link>

                    {laGiaSu && (
                      <Link
                        to="/tutor/courses"
                        onClick={() => setMoMenuAvatar(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-orange-600 bg-orange-50/50 hover:bg-orange-100 transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
                        <span>Quản Lý Khóa Học</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={handleDangXuat}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Nút Đăng nhập khi chưa đăng nhập */
              <Link
                to="/login"
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md shadow-orange-500/20"
              >
                Đăng Nhập
              </Link>
            )}
          </div>

          {/* 3. NÚT HAMBURGER MOBILE */}
          <div className="nut_menu_mobile -mr-2 flex md:hidden">
            <button
              type="button"
              onClick={() => setMoMenuDiDong(!moMenuDiDong)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {moMenuDiDong ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MENU DRAWER MOBILE */}
      {moMenuDiDong && (
        <div className="menu_drawer_mobile md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-5 space-y-1 text-sm font-medium">
          <Link
            to="/"
            onClick={() => setMoMenuDiDong(false)}
            className="block px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200"
          >
            Trang Chủ
          </Link>
          <Link
            to="/courses"
            onClick={() => setMoMenuDiDong(false)}
            className="block px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200"
          >
            Tất Cả Khóa Học
          </Link>
          <Link
            to="/my-courses"
            onClick={() => setMoMenuDiDong(false)}
            className="block px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200"
          >
            Khóa Học Của Tôi
          </Link>
          <Link
            to="/market"
            onClick={() => setMoMenuDiDong(false)}
            className="block px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200"
          >
            Chợ Ghép Lớp (HOT)
          </Link>
          <Link
            to="/tutor-profile"
            onClick={() => setMoMenuDiDong(false)}
            className="block px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200"
          >
            Hồ Sơ Gia Sư
          </Link>
          <Link
            to="/edit-profile"
            onClick={() => setMoMenuDiDong(false)}
            className="block px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200"
          >
            Chỉnh Sửa Profile
          </Link>
          {laGiaSu && (
            <Link
              to="/tutor/courses"
              onClick={() => setMoMenuDiDong(false)}
              className="block px-3 py-2.5 rounded-xl font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
            >
              Quản Lý Khóa Học
            </Link>
          )}
          {daDangNhap ? (
            <button
              onClick={() => {
                setMoMenuDiDong(false);
                handleDangXuat();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-red-400 hover:bg-slate-800"
            >
              Đăng Xuất ({tenHienThi})
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMoMenuDiDong(false)}
              className="block px-3 py-2.5 rounded-xl font-bold text-orange-400 hover:bg-slate-800"
            >
              Đăng Nhập / Đăng Ký
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
