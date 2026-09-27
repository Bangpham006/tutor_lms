import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Settings,
  User,
  Eye,
  Lock,
  KeyRound,
  Save,
  ArrowLeft,
  Image,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../features/auth/api/authApi';

/**
 * ====================================================================
 * TRANG CHỈNH SỬA HỒ SƠ CÁ NHÂN (EditProfile.jsx)
 * Hỗ trợ cả Gia Sư và Học Viên cập nhật thông tin thực tế lên Supabase:
 *   - Họ và tên, Email, Số điện thoại (read-only định danh)
 *   - Chức danh / Tiêu đề chuyên môn (Headline)
 *   - Giới thiệu bản thân & kinh nghiệm (Bio)
 *   - Ảnh đại diện (Preset nhanh hoặc link ảnh tùy chỉnh)
 *   - Đổi mật khẩu tài khoản an toàn
 * ====================================================================
 */

// Danh sách ảnh đại diện mẫu chất lượng cao để người dùng chọn nhanh
const ANH_DAI_DIEN_GOI_Y = [
  { label: 'Thầy giáo 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { label: 'Thầy giáo 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { label: 'Thầy giáo 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { label: 'Thầy giáo 4', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { label: 'Cô giáo 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { label: 'Cô giáo 2', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { label: 'Cô giáo 3', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { label: 'Cô giáo 4', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { nguoiDung, daDangNhap, capNhatThongTinNguoiDung } = useAuth();

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  // Dữ liệu form hồ sơ
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    avatarUrl: '',
    headline: '',
    bio: '',
  });

  // Mục đổi mật khẩu
  const [hienDoiMatKhau, setHienDoiMatKhau] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [anHienMatKhau, setAnHienMatKhau] = useState(false);

  // Tải dữ liệu hồ sơ từ Backend
  useEffect(() => {
    if (!daDangNhap) {
      setDangTai(false);
      return;
    }

    const taiHoSo = async () => {
      setDangTai(true);
      try {
        const hoSo = await authApi.layHoSoCaNhan();
        setForm({
          fullName: hoSo.fullName || '',
          email: hoSo.email || '',
          phone: hoSo.phone || '',
          role: hoSo.role || '',
          avatarUrl: hoSo.avatarUrl || '',
          headline: hoSo.headline || '',
          bio: hoSo.bio || '',
        });
      } catch (err) {
        console.error('Không thể tải hồ sơ chi tiết, dùng thông tin phiên hiện tại:', err);
        if (nguoiDung) {
          setForm({
            fullName: nguoiDung.fullName || '',
            email: nguoiDung.email || '',
            phone: nguoiDung.phone || '',
            role: nguoiDung.role || '',
            avatarUrl: nguoiDung.avatarUrl || '',
            headline: nguoiDung.headline || '',
            bio: nguoiDung.bio || '',
          });
        }
      } finally {
        setDangTai(false);
      }
    };

    taiHoSo();
  }, [daDangNhap, nguoiDung]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChonAvatarGoiY = (url) => {
    setForm((prev) => ({ ...prev, avatarUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setThongBaoThanhCong('');
    setThongBaoLoi('');

    if (!form.fullName.trim()) {
      setThongBaoLoi('Họ và tên không được để trống.');
      return;
    }

    if (hienDoiMatKhau) {
      if (!currentPassword) {
        setThongBaoLoi('Vui lòng nhập mật khẩu hiện tại để xác thực.');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setThongBaoLoi('Mật khẩu mới phải có tối thiểu 6 ký tự.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setThongBaoLoi('Mật khẩu mới và xác nhận mật khẩu không khớp.');
        return;
      }
    }

    setDangLuu(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        avatarUrl: form.avatarUrl.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
      };

      if (hienDoiMatKhau && currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const hoSoCapNhat = await authApi.capNhatHoSo(payload);

      // Cập nhật AuthContext và localStorage ngay lập tức
      capNhatThongTinNguoiDung({
        fullName: hoSoCapNhat.fullName,
        email: hoSoCapNhat.email,
        avatarUrl: hoSoCapNhat.avatarUrl,
        headline: hoSoCapNhat.headline,
        bio: hoSoCapNhat.bio,
      });

      setThongBaoThanhCong('Cập nhật hồ sơ thành công! Dữ liệu đã được lưu an toàn.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setHienDoiMatKhau(false);

      // Tự cuộn lên đầu trang để người dùng nhìn thấy thông báo thành công
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại!';
      setThongBaoLoi(msg);
    } finally {
      setDangLuu(false);
    }
  };

  // Nếu chưa đăng nhập
  if (!daDangNhap && !dangTai) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-200">
          <Lock className="w-12 h-12 text-primary/80 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Yêu Cầu Đăng Nhập</h2>
          <p className="text-sm text-gray-600 mb-6">
            Bạn cần đăng nhập để xem và cập nhật hồ sơ cá nhân của mình.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition shadow"
          >
            Đăng Nhập Ngay
          </Link>
        </div>
      </div>
    );
  }

  const laGiaSu = form.role === 'ROLE_TUTOR' || form.role === 'TUTOR';
  const laAdmin = form.role === 'ROLE_ADMIN' || form.role === 'ADMIN';

  const avatarHienTai =
    form.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      form.fullName || 'User'
    )}&background=f97316&color=fff&bold=true`;

  return (
    <div className="khung_chinh_sua_ho_so bg-gray-50 min-h-screen py-8 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB & HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link to="/" className="hover:text-primary transition">Trang Chủ</Link>
              <span>/</span>
              <span className="text-gray-800 font-semibold">Chỉnh Sửa Hồ Sơ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-primary" />
              <span>Cài Đặt Hồ Sơ Cá Nhân</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Cập nhật thông tin giảng dạy, kinh nghiệm và thông tin liên hệ được hiển thị trên hệ thống TutorLMS.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/tutor-profile"
              className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 transition shadow-sm flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Hồ Sơ Công Khai</span>
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-3 py-2.5 rounded-xl transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* THÔNG BÁO THÀNH CÔNG */}
        {thongBaoThanhCong && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-bold">{thongBaoThanhCong}</p>
                <p className="text-xs text-green-700 mt-0.5">Thông tin mới đã được cập nhật đồng bộ trên toàn bộ nền tảng.</p>
              </div>
            </div>
            <button onClick={() => setThongBaoThanhCong('')} className="text-green-700 font-bold px-2">✕</button>
          </div>
        )}

        {/* THÔNG BÁO LỖI */}
        {thongBaoLoi && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="font-semibold">{thongBaoLoi}</p>
            </div>
            <button onClick={() => setThongBaoLoi('')} className="text-red-700 font-bold px-2">✕</button>
          </div>
        )}

        {dangTai ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-bold">Đang tải thông tin hồ sơ của bạn...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* THẺ TỔNG QUAN AVATAR & DANH TÍNH */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2 mb-6">
                <Image className="w-5 h-5 text-primary" />
                <span>Ảnh Đại Diện & Định Danh</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Khối xem trước avatar */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative group">
                    <img
                      src={avatarHienTai}
                      alt="Avatar Preview"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-orange-100 shadow-md transition group-hover:opacity-95"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                      {laGiaSu ? 'GIA SƯ' : laAdmin ? 'ADMIN' : 'HỌC VIÊN'}
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-3">Ảnh xem trước trực tiếp</span>
                </div>

                {/* Tùy chỉnh URL ảnh & Preset */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Đường Dẫn URL Ảnh Đại Diện
                    </label>
                    <input
                      type="url"
                      name="avatarUrl"
                      value={form.avatarUrl}
                      onChange={handleChange}
                      placeholder="Dán link ảnh trực tuyến (https://...)"
                      className="w-full text-xs sm:text-sm border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-200 outline-none px-3.5 py-2.5 rounded-xl transition"
                    />
                    <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Bạn có thể dán đường link ảnh cá nhân từ Imgur, Facebook, Google Drive công khai, hoặc chọn nhanh các avatar mẫu bên dưới:</span>
                    </p>
                  </div>

                  {/* Preset Avatar nhanh */}
                  <div>
                    <span className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Chọn nhanh avatar mẫu chuyên nghiệp:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {ANH_DAI_DIEN_GOI_Y.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleChonAvatarGoiY(av.url)}
                          className={`relative rounded-xl overflow-hidden border-2 transition transform hover:scale-105 ${
                            form.avatarUrl === av.url ? 'border-primary ring-2 ring-orange-200 scale-105' : 'border-gray-200 opacity-80 hover:opacity-100'
                          }`}
                          title={av.label}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-12 object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* THÔNG TIN CƠ BẢN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-5">
              <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>Thông Tin Tài Khoản & Liên Hệ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Thầy Hoàng Nam"
                    className="w-full text-xs sm:text-sm font-semibold border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-200 outline-none px-3.5 py-2.5 rounded-xl transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="hoangnam@tutorlms.vn"
                    className="w-full text-xs sm:text-sm border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-200 outline-none px-3.5 py-2.5 rounded-xl transition"
                  />
                </div>

                {/* Số điện thoại (read-only) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Số Điện Thoại (Tài khoản)</span>
                    <span className="text-[10px] text-gray-400 font-normal flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Không thể sửa
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    readOnly
                    className="w-full text-xs sm:text-sm bg-gray-100 border border-gray-200 text-gray-500 px-3.5 py-2.5 rounded-xl cursor-not-allowed select-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Số điện thoại được dùng làm mã định danh đăng nhập chính.</p>
                </div>

                {/* Vai trò tài khoản */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Vai Trò Hệ Thống
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {laGiaSu ? (
                      <span className="bg-orange-100 text-orange-800 text-xs font-black px-3 py-1.5 rounded-xl border border-orange-200 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Gia Sư / Giảng Viên Phụ Trách</span>
                      </span>
                    ) : laAdmin ? (
                      <span className="bg-red-100 text-red-800 text-xs font-black px-3 py-1.5 rounded-xl border border-red-200 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Quản Trị Viên (Admin)</span>
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Học Viên (Student)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tiêu đề chuyên môn (Headline) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Chức Danh / Tiêu Đề Chuyên Môn (Headline)
                </label>
                <input
                  type="text"
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  placeholder={
                    laGiaSu
                      ? 'Ví dụ: Thạc sĩ Toán học - 8 năm kinh nghiệm luyện thi ĐH Bách Khoa, Y Dược'
                      : 'Ví dụ: Học viên Chuyên Toán - Đam mê Công nghệ Thông tin & Khoa học Dữ liệu'
                  }
                  className="w-full text-xs sm:text-sm font-medium border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-200 outline-none px-3.5 py-2.5 rounded-xl transition"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Dòng ngắn gọn hiển thị ngay dưới tên của bạn trên hồ sơ công khai và danh sách chợ ghép lớp.
                </p>
              </div>

              {/* Tiểu sử / Giới thiệu chi tiết (Bio) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Giới Thiệu Bản Thân & Kinh Nghiệm (Bio)
                </label>
                <textarea
                  name="bio"
                  rows={5}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder={
                    laGiaSu
                      ? 'Mô tả chi tiết phương pháp giảng dạy, phong cách truyền cảm hứng, thành tích các khóa học trước, bằng cấp chứng chỉ...'
                      : 'Chia sẻ về mục tiêu học tập, sở thích, thế mạnh và những môn học bạn đang muốn rèn luyện thêm...'
                  }
                  className="w-full text-xs sm:text-sm border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-200 outline-none p-3.5 rounded-xl transition leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* MỤC BẢO MẬT & ĐỔI MẬT KHẨU */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">Bảo Mật & Mật Khẩu</h3>
                    <p className="text-xs text-gray-500">Thay đổi mật khẩu đăng nhập nếu cần bảo mật tài khoản.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHienDoiMatKhau(!hienDoiMatKhau)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition border flex items-center gap-1.5 ${
                    hienDoiMatKhau
                      ? 'bg-orange-50 text-primary border-orange-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {hienDoiMatKhau ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Hủy Đổi Mật Khẩu</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Đổi Mật Khẩu</span>
                    </>
                  )}
                </button>
              </div>

              {hienDoiMatKhau && (
                <div className="mt-5 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mật Khẩu Hiện Tại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={anHienMatKhau ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng"
                      className="w-full text-xs sm:text-sm border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-200 outline-none px-3.5 py-2 rounded-xl transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mật Khẩu Mới <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={anHienMatKhau ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full text-xs sm:text-sm border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-200 outline-none px-3.5 py-2 rounded-xl transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Xác Nhận Mật Khẩu Mới <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={anHienMatKhau ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full text-xs sm:text-sm border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-200 outline-none px-3.5 py-2 rounded-xl transition"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center justify-between text-xs text-gray-500 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={anHienMatKhau}
                        onChange={(e) => setAnHienMatKhau(e.target.checked)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span>Hiện mật khẩu</span>
                    </label>
                    <span className="text-[11px] text-gray-400">
                      Để trống nếu bạn không có nhu cầu đổi mật khẩu lúc này.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* NÚT THAO TÁC SUBMIT */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <Link
                to="/tutor-profile"
                className="text-xs font-bold text-gray-500 hover:text-primary transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Hồ Sơ Công Khai</span>
              </Link>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-1/2 sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangLuu}
                  className="w-1/2 sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-8 py-3 rounded-2xl text-xs sm:text-sm transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {dangLuu ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang Lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Hồ Sơ Thay Đổi</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
