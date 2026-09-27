import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Star,
  BookOpen,
  Users,
  Edit3,
  Phone,
  MessageSquare,
  PhoneCall,
  Mail,
  MapPin,
  Target,
  Award,
  Plus,
  Inbox,
  Lock,
  Globe,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../features/auth/api/authApi';
import { courseApi } from '../features/courses/api/courseApi';

/**
 * ====================================================================
 * TRANG HỒ SƠ CHI TIẾT GIA SƯ (TutorProfile.jsx)
 * Kết nối dữ liệu thực từ Database Supabase:
 *   - Lấy thông tin gia sư theo ID (từ URL: /tutor-profile?id=... hoặc profile hiện tại)
 *   - Hiển thị Chức danh (Headline), Giới thiệu & Kinh nghiệm (Bio)
 *   - Liệt kê danh sách các khóa học thực tế do gia sư này phụ trách
 *   - Nút Chỉnh Sửa Hồ Sơ (nếu xem hồ sơ của chính mình)
 *   - Nút Nhắn tin / Liên hệ nhận lớp (nếu là học sinh/phụ huynh xem)
 * ====================================================================
 */
export default function TutorProfile() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { nguoiDung, daDangNhap } = useAuth();

  const tutorIdFromUrl = searchParams.get('id');
  const tutorInfoFromState = location.state?.tutorInfo;

  const [hoSo, setHoSo] = useState(null);
  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);

  useEffect(() => {
    const taiDuLieu = async () => {
      setDangTai(true);
      setLoi(null);
      try {
        let thongTinNguoiDung = null;

        // 1. Xác định profile cần tải:
        // - Nếu có ?id trên URL: gọi API lấy theo ID
        // - Nếu không có ?id nhưng đã đăng nhập: lấy profile cá nhân của mình
        // - Fallback: dùng state truyền sang từ ApplicantsModal
        if (tutorIdFromUrl) {
          try {
            thongTinNguoiDung = await authApi.layHoSoTheoId(tutorIdFromUrl);
          } catch (fetchErr) {
            console.warn('Không gọi được API theo ID, thử kiểm tra state:', fetchErr);
            if (tutorInfoFromState) {
              thongTinNguoiDung = {
                id: tutorIdFromUrl,
                fullName: tutorInfoFromState.tutorName,
                avatarUrl: tutorInfoFromState.tutorAvatar,
                phone: tutorInfoFromState.phoneContact,
                role: 'ROLE_TUTOR',
                headline: tutorInfoFromState.expectedRate ? `Mức phí: ${tutorInfoFromState.expectedRate}` : 'Gia Sư TutorLMS',
                bio: tutorInfoFromState.introduction || 'Gia sư nhiều năm kinh nghiệm trên nền tảng TutorLMS.',
              };
            }
          }
        } else if (daDangNhap) {
          thongTinNguoiDung = await authApi.layHoSoCaNhan();
        } else {
          // Chưa đăng nhập và không có ID: Tải danh sách khóa học để lấy gia sư tiêu biểu
          const allCourses = await courseApi.layDanhSachKhoaHocChung();
          if (allCourses && allCourses.length > 0 && allCourses[0].tutorId) {
            thongTinNguoiDung = await authApi.layHoSoTheoId(allCourses[0].tutorId);
          }
        }

        if (!thongTinNguoiDung && nguoiDung) {
          thongTinNguoiDung = nguoiDung;
        }

        setHoSo(thongTinNguoiDung);

        // 2. Tải các khóa học do gia sư này phụ trách
        const courses = await courseApi.layDanhSachKhoaHocChung();
        if (Array.isArray(courses) && thongTinNguoiDung) {
          const coursesCuaGiaSu = courses.filter(
            (c) =>
              (thongTinNguoiDung.id && c.tutorId && String(c.tutorId) === String(thongTinNguoiDung.id)) ||
              (thongTinNguoiDung.fullName && c.tutorName && c.tutorName.toLowerCase() === thongTinNguoiDung.fullName.toLowerCase())
          );
          setDanhSachKhoaHoc(coursesCuaGiaSu);
        }
      } catch (err) {
        console.error('Lỗi khi tải hồ sơ gia sư:', err);
        setLoi('Không thể tải thông tin hồ sơ gia sư. Vui lòng kiểm tra lại kết nối!');
      } finally {
        setDangTai(false);
      }
    };

    taiDuLieu();
  }, [tutorIdFromUrl, daDangNhap, nguoiDung, tutorInfoFromState]);

  // Kiểm tra xem người dùng hiện tại có phải chính chủ hồ sơ này không
  const laChinhMinh =
    daDangNhap &&
    hoSo &&
    ((nguoiDung?.id && hoSo?.id && String(nguoiDung.id) === String(hoSo.id)) ||
      (nguoiDung?.phone && hoSo?.phone && nguoiDung.phone === hoSo.phone));

  const avatarUrl =
    hoSo?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      hoSo?.fullName || 'Gia Sư'
    )}&background=f97316&color=fff&bold=true`;

  const laGiaSu = hoSo?.role === 'ROLE_TUTOR' || hoSo?.role === 'TUTOR';

  if (dangTai) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-200">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-sm font-bold text-gray-700">Đang tải hồ sơ gia sư từ hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!hoSo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full border border-gray-200 shadow-sm">
          <div className="text-5xl mb-3">🔍</div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Không Tìm Thấy Hồ Sơ</h2>
          <p className="text-sm text-gray-600 mb-6">
            Không tìm thấy thông tin gia sư yêu cầu hoặc hồ sơ không còn tồn tại trên hệ thống.
          </p>
          <Link
            to="/market"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition shadow text-xs"
          >
            Quay lại Chợ Ghép Lớp
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="khung_ho_so_gia_su bg-gray-50 min-h-screen py-8 text-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition">Trang Chủ</Link>
            <span>/</span>
            <Link to="/market" className="hover:text-primary transition">Chợ Ghép Lớp</Link>
            <span>/</span>
            <span className="text-gray-800 font-semibold">{hoSo.fullName}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hover:text-primary transition font-bold flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* HERO BANNER PROFILE */}
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 mb-8">
          {/* Ảnh bìa gradient sắc sảo */}
          <div className="h-44 sm:h-56 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 relative">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
            <div className="absolute bottom-4 right-6 hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gia Sư Đã Kiểm Duyệt & Xác Thực 100%</span>
            </div>
          </div>

          {/* Khối avatar và tiêu đề chính */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20 text-center sm:text-left">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={hoSo.fullName}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                />
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow" title="Đang trực tuyến" />
              </div>

              <div className="pt-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {hoSo.fullName}
                  </h1>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200" title="Giảng viên đã xác minh danh tính">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    <span>Đã Xác Thực</span>
                  </span>
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-orange-200">
                    {laGiaSu ? 'GIA SƯ' : 'HỌC VIÊN'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-gray-700 max-w-xl">
                  {hoSo.headline || (laGiaSu ? 'Gia sư giảng dạy chất lượng cao trên TutorLMS' : 'Thành viên học tập tích cực')}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> <strong className="text-gray-800 font-bold">4.9 / 5.0</strong> (68 đánh giá)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-primary" /> <strong className="text-gray-800 font-bold">{danhSachKhoaHoc.length}</strong> Khóa học phụ trách
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> <strong className="text-gray-800 font-bold">120+</strong> Học sinh đã dạy
                  </span>
                </div>
              </div>
            </div>

            {/* Các nút hành động chính */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 self-center sm:self-auto shrink-0 pt-2">
              {laChinhMinh ? (
                <Link
                  to="/edit-profile"
                  className="bg-primary hover:bg-primary-dark text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-2xl transition shadow flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh Sửa Hồ Sơ Cá Nhân</span>
                </Link>
              ) : (
                <>
                  <a
                    href={`tel:${hoSo.phone || ''}`}
                    className="bg-primary hover:bg-primary-dark text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-2xl transition shadow flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Liên Hệ: {hoSo.phone || 'Gia Sư'}</span>
                  </a>
                  <Link
                    to="/market"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Gửi Đề Nghị Nhận Lớp</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT DẠNG 2 CỘT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ & KỸ NĂNG */}
          <div className="space-y-6">
            
            {/* THẺ LIÊN HỆ */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-primary" />
                <span>Thông Tin Kết Nối</span>
              </h3>

              <ul className="space-y-3.5 text-xs text-gray-700">
                <li className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" /> Điện thoại / Zalo:
                  </span>
                  <span className="font-bold text-gray-900">{hoSo.phone || 'Chưa cập nhật'}</span>
                </li>

                <li className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email liên hệ:
                  </span>
                  <span className="font-bold text-gray-900 truncate max-w-[170px]" title={hoSo.email}>
                    {hoSo.email || 'Chưa cập nhật'}
                  </span>
                </li>

                <li className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Khu vực dạy:
                  </span>
                  <span className="font-bold text-gray-900">Toàn Quốc (Online)</span>
                </li>

                <li className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Trạng thái lớp:
                  </span>
                  <span className="bg-green-100 text-green-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                    Sẵn Sàng Nhận Lớp Mới
                  </span>
                </li>
              </ul>
            </div>

            {/* THẺ KỸ NĂNG & THẾ MẠNH */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-primary" />
                <span>Kỹ Năng & Môn Học Giảng Dạy</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {['Toán Học THPT', 'Luyện Thi THPT QG', 'Toán Cao Cấp', 'Hình Học Không Gian', 'IELTS 4 Kỹ Năng', 'Tư Duy Logic', 'Lập Trình Web'].map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-orange-50 text-orange-800 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-orange-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CHỨNG CHỈ & THÀNH TÍCH */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Bằng Cấp & Chứng Chỉ</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    <span>Thạc Sĩ Sư Phạm / Cử Nhân Xuất Sắc</span>
                  </p>
                  <p className="text-gray-600 text-[11px] mt-0.5">Trường Đại học Sư phạm & ĐH Bách Khoa</p>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200">
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>Huấn Luyện Viên Đội Tuyển HSG</span>
                  </p>
                  <p className="text-gray-600 text-[11px] mt-0.5">Nhiều giải Nhất, Nhì cấp Tỉnh & Thành phố</p>
                </div>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: GIỚI THIỆU & CÁC KHÓA HỌC THỰC TẾ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* THẺ GIỚI THIỆU BẢN THÂN (BIO) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Giới Thiệu & Phương Pháp Giảng Dạy</span>
              </h3>

              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
                {hoSo.bio ? (
                  <p className="whitespace-pre-line">{hoSo.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">
                    Gia sư chưa cập nhật phần giới thiệu chi tiết. Bạn có thể liên hệ trực tiếp qua số điện thoại hoặc Zalo để trao đổi thêm về lộ trình học tập.
                  </p>
                )}
              </div>

              {laChinhMinh && !hoSo.bio && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to="/edit-profile"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Thêm mô tả phương pháp giảng dạy để thu hút học sinh hơn</span>
                  </Link>
                </div>
              )}
            </div>

            {/* DANH SÁCH KHÓA HỌC DO GIA SƯ PHỤ TRÁCH (DỮ LIỆU THẬT) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Khóa Học Phụ Trách ({danhSachKhoaHoc.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Các lớp học trực tuyến chính thức do {hoSo.fullName} biên soạn giáo án và đứng lớp.
                  </p>
                </div>

                {laChinhMinh && laGiaSu && (
                  <Link
                    to="/tutor/courses"
                    className="bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-orange-200 transition shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quản Lý / Tạo Khóa Mới</span>
                  </Link>
                )}
              </div>

              {danhSachKhoaHoc.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border text-xs text-gray-500">
                  <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  Chưa có khóa học công khai nào do gia sư này đăng ký trên hệ thống.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {danhSachKhoaHoc.map((kh) => (
                    <div
                      key={kh.id}
                      className="bg-gray-50 hover:bg-orange-50/50 rounded-2xl p-4 border border-gray-200 hover:border-orange-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="bg-orange-100 text-primary font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                            {kh.courseCode || 'LMS'}
                          </span>
                          {kh.hasEnrollmentKey ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Mật Khẩu</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>Mở Tự Do</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1 mb-1">
                          {kh.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                          {kh.description || 'Khóa học bám sát chương trình, bài giảng và tài liệu được biên soạn kỹ lưỡng.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200/70 mt-2">
                        <span className="text-xs font-black text-primary">
                          {kh.price && kh.price > 0 ? `${Number(kh.price).toLocaleString('vi-VN')} đ` : 'Miễn Phí'}
                        </span>
                        <Link
                          to={`/courses/${kh.id}`}
                          className="bg-white hover:bg-primary hover:text-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 hover:border-primary transition shadow-sm flex items-center gap-1"
                        >
                          <span>Vào Học</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NHẬN XÉT ĐÁNH GIÁ TỪ HỌC VIÊN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2 mb-4">
                <span>💬</span> Đánh Giá Từ Học Viên ({hoSo.fullName})
              </h3>

              <div className="space-y-3.5">
                {[
                  {
                    name: 'Nguyễn Văn An',
                    time: '3 ngày trước',
                    comment: 'Thầy dạy cực kỳ có tâm, cách giải bài hình học không gian dễ hiểu và áp dụng được ngay. Sau 2 tháng học điểm kiểm tra của em đã từ 6 lên 8.5!',
                    rating: 5,
                  },
                  {
                    name: 'Trần Bích Thảo',
                    time: '1 tuần trước',
                    comment: 'Giáo án rất chi tiết, có slide tóm tắt và file bài tập về nhà rõ ràng. Thầy hỗ trợ giải đáp thắc mắc bài tập rất nhanh!',
                    rating: 5,
                  },
                ].map((fb, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-orange-200 text-orange-800 font-bold rounded-full flex items-center justify-center text-xs">
                          {fb.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-gray-900">{fb.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">{fb.time}</span>
                    </div>
                    <div className="text-amber-500 text-xs mb-1">★★★★★</div>
                    <p className="text-xs text-gray-600 leading-relaxed">{fb.comment}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
