import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Shield,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  LogIn,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { authApi } from '../features/auth/api/authApi';
import { useAuth } from '../context/AuthContext';

/**
 * ====================================================================
 * TRANG ĐĂNG NHẬP / ĐĂNG KÝ (Login.jsx)
 * Kết nối thực tế với Backend Spring Boot:
 *   - POST /api/v1/auth/login
 *   - POST /api/v1/auth/register
 * ====================================================================
 */
export default function Login() {
  const navigate = useNavigate();
  const { luuPhienDangNhap } = useAuth();

  const [laDangNhap, setLaDangNhap] = useState(true);
  const [account, setAccount] = useState('0912345678');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');
  const [hienThiMatKhau, setHienThiMatKhau] = useState(false);

  // Xử lý gửi form đăng nhập hoặc đăng ký
  const handleXacNhan = async (e) => {
    e.preventDefault();
    setDangXuLy(true);
    setThongBaoLoi('');

    try {
      if (laDangNhap) {
        // GỌI API ĐĂNG NHẬP THẬT SANG SPRING BOOT
        const res = await authApi.dangNhap({ account, password });
        luuPhienDangNhap(res.token, {
          id: res.id,
          fullName: res.fullName || 'Người dùng TutorLMS',
          role: res.role,
          phone: res.phone,
          email: res.email,
        });
        alert('Đăng nhập thành công!');
        navigate('/');
      } else {
        // GỌI API ĐĂNG KÝ
        const res = await authApi.dangKy({
          fullName,
          phone,
          email,
          password,
          role,
        });
        // TỰ ĐỘNG ĐĂNG NHẬP NGAY LẬP TỨC
        if (res?.token) {
          luuPhienDangNhap(res.token, {
            id: res.id,
            fullName: res.fullName || fullName,
            role: res.role,
            phone: res.phone,
            email: res.email,
          });
          alert('Đăng ký tài khoản thành công! Chào mừng bạn đến với TutorLMS.');
          navigate('/');
        } else {
          alert('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
          setLaDangNhap(true);
        }
      }
    } catch (err) {
      console.warn('Lỗi đăng nhập:', err);
      const tinNhan =
        err.response?.data?.message ||
        'Tài khoản hoặc mật khẩu không chính xác, hoặc hệ thống đang bảo trì. Vui lòng thử lại.';
      setThongBaoLoi(tinNhan);
    } finally {
      setDangXuLy(false);
    }
  };

  // Đăng nhập nhanh trải nghiệm
  const handleDangNhapDemo = () => {
    luuPhienDangNhap('demo-token-123456', {
      fullName: 'Trần Bích Thảo',
      role: 'ROLE_TUTOR',
      email: 'demo@tutorlms.vn',
      phone: '0988888888',
    });
    alert('Đăng nhập chế độ trải nghiệm thành công!');
    navigate('/');
  };

  return (
    <div className="khung_dang_nhap_toan_man_hinh min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Nền ảnh mờ */}
      <div className="hinh_nen_mo absolute inset-0 opacity-15 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="hop_chua_form_dang_nhap w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 sm:p-9 relative z-10 border border-gray-100 hover-card-elevation transition-all duration-300">
        
        {/* LOGO */}
        <div className="logo_thuong_hieu text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-md shadow-primary/20 text-white font-black group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight font-heading">
              Tutor<span className="text-primary">LMS</span>
            </span>
          </Link>
          <p className="text-xs text-gray-500 mt-1 font-medium">Nền tảng học tập & kết nối gia sư trực tuyến</p>
        </div>

        {/* THÔNG BÁO LỖI (NẾU CÓ) */}
        {thongBaoLoi && (
          <div className="hop_thong_bao_loi bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl mb-5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Đăng nhập không thành công:</p>
              <p className="mt-0.5 text-red-600 leading-relaxed">{thongBaoLoi}</p>
            </div>
          </div>
        )}

        {/* NÚT CHUYỂN TAB ĐĂNG NHẬP / ĐĂNG KÝ */}
        <div className="thanh_chuyen_doi_dang_nhap_dang_ky flex bg-gray-100/80 p-1 rounded-2xl mb-6 border border-gray-200/60">
          <button
            type="button"
            onClick={() => {
              setLaDangNhap(true);
              setThongBaoLoi('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              laDangNhap ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLaDangNhap(false);
              setThongBaoLoi('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              !laDangNhap ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tạo Tài Khoản Mới</span>
          </button>
        </div>

        {/* FORM GỬI API */}
        <form onSubmit={handleXacNhan} className="khoi_cac_truong_nhap space-y-4">
          
          {/* Form Đăng ký */}
          {!laDangNhap ? (
            <>
              <div className="truong_nhap_ho_ten">
                <label className="text-xs font-bold text-gray-700 block mb-1">Họ và Tên</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn An"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-gray-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="truong_nhap_sdt">
                <label className="text-xs font-bold text-gray-700 block mb-1">Số Điện Thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-gray-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="truong_nhap_email">
                <label className="text-xs font-bold text-gray-700 block mb-1">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="VD: an.nguyen@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-gray-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="truong_chon_vai_tro">
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Vai trò của bạn</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_STUDENT')}
                    className={`py-2.5 px-2 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 ${
                      role === 'ROLE_STUDENT'
                        ? 'border-primary bg-orange-50/80 text-primary shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Học Viên</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_TUTOR')}
                    className={`py-2.5 px-2 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 ${
                      role === 'ROLE_TUTOR'
                        ? 'border-primary bg-orange-50/80 text-primary shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Gia Sư</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_PARENT')}
                    className={`py-2.5 px-2 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 ${
                      role === 'ROLE_PARENT'
                        ? 'border-primary bg-orange-50/80 text-primary shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Phụ Huynh</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Form Đăng nhập */
            <div className="o_nhap_email">
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Số Điện Thoại Hoặc Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="VD: 0987654321 hoặc name@example.com"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Mật khẩu */}
          <div className="o_nhap_mat_khau">
            <label className="text-xs font-bold text-gray-700 block mb-1">Mật Khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type={hienThiMatKhau ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-gray-50/50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setHienThiMatKhau(!hienThiMatKhau)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
              >
                {hienThiMatKhau ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nút gửi */}
          <button
            type="submit"
            disabled={dangXuLy}
            className="nut_xac_nhan_dang_nhap w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-primary/20 text-xs mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {dangXuLy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý đăng nhập...</span>
              </>
            ) : laDangNhap ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Hoàn Tất Đăng Ký</span>
              </>
            )}
          </button>

          {/* Gợi ý tài khoản mẫu thực tế */}
          {laDangNhap && (
            <div className="khoi_tai_khoan_mau mt-3 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500 mb-2.5 text-center">
                Tài khoản trải nghiệm nhanh hệ thống:
              </p>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setAccount('0912345678');
                    setPassword('123456');
                  }}
                  className="p-2 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/80 text-orange-800 font-semibold text-center transition flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
                  <span>Học Viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccount('0988888888');
                    setPassword('123456');
                  }}
                  className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-800 font-semibold text-center transition flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gia Sư</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccount('0900000000');
                    setPassword('123456');
                  }}
                  className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-800 font-semibold text-center transition flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Nút đăng nhập Demo */}
        <div className="khung_nut_demo mt-4 pt-3 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={handleDangNhapDemo}
            className="text-xs text-gray-500 hover:text-primary font-semibold transition inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Trải nghiệm nhanh không cần nhập thông tin</span>
          </button>
        </div>

        <div className="nut_quay_ve_trang_chu mt-4 text-center text-xs text-gray-500">
          <Link to="/" className="text-primary font-semibold hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay về Trang Chủ</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
