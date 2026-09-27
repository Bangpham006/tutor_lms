import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  X,
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  Lock,
  Globe,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Loader2,
  AlertCircle,
  KeyRound,
  Eye,
  ArrowRight,
  School,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { courseApi } from '../features/courses/api/courseApi';
import { useAuth } from '../context/AuthContext';

/**
 * ====================================================================
 * TRANG KHÓA HỌC CỦA TÔI & KHÁM PHÁ KHÓA HỌC (MyCourses.jsx)
 * Chuẩn mô hình LMS cá nhân hóa:
 *   1. Nếu Học viên ĐÃ GHI DANH:
 *      - CHỈ hiển thị danh sách các lớp học viên đã tham gia / đã nhập pass.
 *   2. Nếu Học viên MỚI / CHƯA GHI DANH:
 *      - Hiển thị mục: "🔥 Các Khóa Học Phổ Biến" kèm nút "➕ Thêm Vào Khóa Học Của Tôi".
 *   3. Bộ tìm kiếm thông minh đa trường (Tên môn, Tên Gia sư, Mã lớp) + Quick Tags.
 * ====================================================================
 */
export default function MyCourses() {
  const navigate = useNavigate();
  const { daDangNhap, nguoiDung } = useAuth();

  // Danh sách khóa học
  const [danhSachDaGhiDanh, setDanhSachDaGhiDanh] = useState([]);
  const [danhSachPhoBien, setDanhSachPhoBien] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loiKetNoi, setLoiKetNoi] = useState(null);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');

  // Bộ lọc & Tìm kiếm
  const [tuKhoa, setTuKhoa] = useState('');
  const [tabLoc, setTabLoc] = useState('TAT_CA'); // 'TAT_CA' | 'CO_MAT_KHAU' | 'MO_TU_DO'
  const [dangGhiDanhId, setDangGhiDanhId] = useState(null);

  const laGiaSu = nguoiDung?.role === 'ROLE_TUTOR' || nguoiDung?.role === 'TUTOR';

  useEffect(() => {
    taiDuLieuKhoaHoc();
  }, [daDangNhap, nguoiDung]);

  const taiDuLieuKhoaHoc = async () => {
    setDangTai(true);
    setLoiKetNoi(null);
    try {
      // 1. Tải catalog toàn bộ khóa học phổ biến trong hệ thống
      const catalog = await courseApi.layDanhSachKhoaHocChung();
      const danhSachCatalog = Array.isArray(catalog) ? catalog : [];
      setDanhSachPhoBien(danhSachCatalog);

      // 2. Nếu đã đăng nhập, tải các khóa học đã ghi danh (hoặc do gia sư phụ trách)
      if (daDangNhap) {
        if (laGiaSu) {
          // Gia sư: Lấy khóa học do mình tạo
          const tutorCourses = await courseApi.layKhoaHocCuaGiaSu();
          setDanhSachDaGhiDanh(Array.isArray(tutorCourses) ? tutorCourses : []);
        } else {
          // Học viên: Lấy khóa học đã thực sự enroll vào database
          const myEnrollments = await courseApi.layKhoaHocCuaToi();
          setDanhSachDaGhiDanh(Array.isArray(myEnrollments) ? myEnrollments : []);
        }
      } else {
        setDanhSachDaGhiDanh([]);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu khóa học:', err);
      setLoiKetNoi('Hiện không thể tải danh sách khóa học của bạn. Vui lòng thử lại sau.');
    } finally {
      setDangTai(false);
    }
  };

  // Hàm thêm nhanh khóa học miễn phí/mở vào "Khóa học của tôi"
  const handleThemVaoKhoaHocCuaToi = async (e, course) => {
    e.stopPropagation();
    if (!daDangNhap) {
      alert('Vui lòng đăng nhập tài khoản Học Viên để thêm khóa học vào danh sách của bạn!');
      navigate('/login');
      return;
    }

    if (course.hasEnrollmentKey) {
      // Có mật khẩu -> Chuyển đến màn hình nhập mật khẩu
      navigate(`/courses/${course.id}`);
      return;
    }

    setDangGhiDanhId(course.id);
    try {
      await courseApi.dangKyKhoaHoc(course.id, {});
      setThongBaoThanhCong(`🎉 Đã thêm khóa học "${course.title}" vào "Khóa Học Của Tôi" thành công!`);
      await taiDuLieuKhoaHoc();
      setTimeout(() => setThongBaoThanhCong(''), 4000);
    } catch (err) {
      console.error('Lỗi thêm khóa học:', err);
      alert('❌ Lỗi: ' + (err.response?.data?.message || 'Không thể thêm khóa học lúc này.'));
    } finally {
      setDangGhiDanhId(null);
    }
  };

  // Lọc tìm kiếm thông minh đa trường
  const locKhoaHoc = (danhSach) => {
    return danhSach.filter((k) => {
      const title = (k.title || k.courseTitle || '').toLowerCase();
      const tutor = (k.tutorName || '').toLowerCase();
      const code = (k.courseCode || '').toLowerCase();
      const desc = (k.description || k.courseDescription || '').toLowerCase();
      const q = tuKhoa.toLowerCase().trim();

      const khopTuKhoa = !q || title.includes(q) || tutor.includes(q) || code.includes(q) || desc.includes(q);

      if (!khopTuKhoa) return false;

      if (tabLoc === 'CO_MAT_KHAU') return k.hasEnrollmentKey;
      if (tabLoc === 'MO_TU_DO') return !k.hasEnrollmentKey;

      return true;
    });
  };

  const anhKhoaHocList = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  ];

  // Kiểm tra khóa học đã nằm trong danh sách đã ghi danh chưa
  const daGhiDanhRoi = (courseId) => {
    return danhSachDaGhiDanh.some(
      (item) => String(item.id || item.courseId) === String(courseId)
    );
  };

  const [trangHienTai, setTrangHienTai] = useState(1);
  const KICH_THUOC_TRANG = 6;

  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoa, tabLoc]);

  const danhSachDaGhiDanhLoc = locKhoaHoc(danhSachDaGhiDanh);
  const danhSachPhoBienLoc = locKhoaHoc(danhSachPhoBien);

  const tongSoTrang = Math.max(1, Math.ceil(danhSachDaGhiDanhLoc.length / KICH_THUOC_TRANG));
  const viTriBatDau = (trangHienTai - 1) * KICH_THUOC_TRANG;
  const danhSachDaGhiDanhTrangHienTai = danhSachDaGhiDanhLoc.slice(viTriBatDau, viTriBatDau + KICH_THUOC_TRANG);

  const chuyenTrang = (soTrangMoi) => {
    if (soTrangMoi < 1 || soTrangMoi > tongSoTrang) return;
    setTrangHienTai(soTrangMoi);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  return (
    <div className="khung_khoa_hoc_cua_toi bg-gray-50 py-8 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB */}
        <div className="thanh_dieu_huong_breadcrumb text-xs text-gray-500 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-primary transition">Trang Chủ</Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold">Khóa học</span>
        </div>

        {/* THÔNG BÁO TOAST THÀNH CÔNG */}
        {thongBaoThanhCong && (
          <div className="hop_thong_bao_thanh_cong bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span className="font-semibold">{thongBaoThanhCong}</span>
            </div>
            <button onClick={() => setThongBaoThanhCong('')} className="text-green-700 font-bold p-1 hover:bg-green-100 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* HEADER TRANG */}
        <div className="khung_tieu_de mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-orange-100 text-primary text-xs font-black px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{laGiaSu ? 'Khu Vực Giảng Viên' : 'Không Gian Học Tập Của Tôi'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-primary" />
                <span>{laGiaSu ? 'Khóa Học Do Tôi Giảng Dạy' : 'Khóa Học Của Tôi'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {daDangNhap
                  ? `Xin chào, ${nguoiDung?.fullName || 'Học viên'}! Quản lý các lớp học bạn đã ghi danh và khám phá khóa học mới.`
                  : 'Đăng nhập để theo dõi lộ trình học tập và các lớp học bạn đã ghi danh.'}
              </p>
            </div>

            {laGiaSu && (
              <Link
                to="/tutor/courses"
                className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition shadow flex items-center gap-2 self-start md:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Khóa Học Mới</span>
              </Link>
            )}
          </div>
        </div>

        {/* THANH TÌM KIẾM THÔNG MINH & BỘ LỌC TỨC THÌ */}
        <div className="thanh_cong_cu_tim_kiem bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Ô TÌM KIẾM CÓ ICON & NÚT XÓA */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                placeholder="Tìm kiếm theo tên môn học, tên gia sư (VD: Thầy Hoàng Nam, Toán 12, CRS-938)..."
                className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm rounded-2xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-orange-100 outline-none transition bg-gray-50 focus:bg-white"
              />
              {tuKhoa && (
                <button
                  type="button"
                  onClick={() => setTuKhoa('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* TAB LỌC NHANH */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setTabLoc('TAT_CA')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  tabLoc === 'TAT_CA'
                    ? 'bg-primary text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất Cả
              </button>
              <button
                type="button"
                onClick={() => setTabLoc('CO_MAT_KHAU')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  tabLoc === 'CO_MAT_KHAU'
                    ? 'bg-amber-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Có Mật Khẩu</span>
              </button>
              <button
                type="button"
                onClick={() => setTabLoc('MO_TU_DO')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  tabLoc === 'MO_TU_DO'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Mở Tự Do</span>
              </button>
              <button
                type="button"
                onClick={taiDuLieuKhoaHoc}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center justify-center"
                title="Tải lại dữ liệu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CÁC THẺ GỢI Ý TỪ KHÓA BẤM NHANH (QUICK TAGS) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span className="font-semibold text-gray-600 mr-1 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý tìm kiếm:</span>
            </span>
            {[
              { nhan: '#Thầy Hoàng Nam', tu: 'Hoàng Nam' },
              { nhan: '#Toán 12', tu: 'Toán 12' },
              { nhan: '#Khóa VIP Có Pass', tu: 'LUYEN-THI' },
              { nhan: '#Lập Trình Web', tu: 'CNTT101' },
              { nhan: '#IELTS 7.5+', tu: 'IELTS' },
            ].map((tag) => (
              <button
                key={tag.nhan}
                type="button"
                onClick={() => setTuKhoa(tag.tu)}
                className="bg-orange-50 hover:bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer border border-orange-200/50"
              >
                {tag.nhan}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* NỘI DUNG CHÍNH */}
        {/* ========================================================= */}
        {dangTai ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 text-sm text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
            Đang tải dữ liệu khóa học...
          </div>
        ) : loiKetNoi ? (
          <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-200 p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-xl font-extrabold text-red-700 mb-2">Chưa thể tải dữ liệu</h3>
            <p className="text-sm text-red-600 mb-4">{loiKetNoi}</p>
            <button
              onClick={taiDuLieuKhoaHoc}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử Lại</span>
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* ========================================================= */}
            {/* PHẦN 1: CÁC KHÓA HỌC ĐÃ GHI DANH CỦA TÔI */}
            {/* (Chỉ hiển thị các lớp mà học viên đã ghi danh thật) */}
            {/* ========================================================= */}
            {daDangNhap && danhSachDaGhiDanh.length > 0 && (
              <section className="khu_vuc_da_ghi_danh">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-black text-gray-900">
                      Khóa Học Đã Ghi Danh Của Tôi ({danhSachDaGhiDanhLoc.length}/{danhSachDaGhiDanh.length})
                    </h2>
                  </div>
                  <span className="text-xs text-green-700 font-extrabold bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-700" />
                    <span>Đang Theo Học</span>
                  </span>
                </div>

                {danhSachDaGhiDanhLoc.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center text-xs text-gray-500">
                    Không tìm thấy khóa học đã ghi danh nào khớp với từ khóa "{tuKhoa}".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {danhSachDaGhiDanhTrangHienTai.map((khoa, idx) => {
                      const idKhoa = khoa.id || khoa.courseId;
                      const tieuDe = khoa.title || khoa.courseTitle || '[MÔN HỌC]';
                      const giangVien = khoa.tutorName || 'Gia Sư';

                      return (
                        <div
                          key={'my-' + idKhoa + '-' + idx}
                          onClick={() => navigate(`/courses/${idKhoa}`)}
                          className="bg-white rounded-3xl shadow-sm border-2 border-green-200/80 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
                        >
                          <div className="relative h-44 overflow-hidden bg-slate-800">
                            <img
                              src={anhKhoaHocList[idx % anhKhoaHocList.length]}
                              alt={tieuDe}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                              <Check className="w-3 h-3" /> Đã Ghi Danh
                            </div>
                            {khoa.hasEnrollmentKey && (
                              <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                                <Lock className="w-3 h-3" /> Khóa Kín
                              </div>
                            )}
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mb-1">
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase">
                                  {khoa.courseCode || 'KHÓA HỌC'}
                                </span>
                                {khoa.enrolledAt && (
                                  <span>Ngày vào: {new Date(khoa.enrolledAt).toLocaleDateString('vi-VN')}</span>
                                )}
                              </div>
                              <h3 className="font-black text-base text-gray-900 mt-1 line-clamp-2 group-hover:text-primary transition">
                                {tieuDe}
                              </h3>
                              <p className="text-xs text-gray-500 mt-2">
                                Gia sư: <span className="font-bold text-gray-800">{giangVien}</span>
                              </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-gray-100">
                              <Link
                                to={`/courses/${idKhoa}`}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                              >
                                <School className="w-4 h-4" />
                                <span>Vào Lớp Học Ngay</span>
                                <ArrowRight className="w-4 h-4 ml-0.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* THANH PHÂN TRANG KHÓA HỌC CỦA TÔI */}
                {tongSoTrang > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <span className="text-xs text-gray-500 font-medium">
                      Trang <strong className="text-gray-800 font-bold">{trangHienTai}</strong> / {tongSoTrang} (Tổng cộng {danhSachDaGhiDanhLoc.length} khóa học)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => chuyenTrang(trangHienTai - 1)}
                        disabled={trangHienTai === 1}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
                        title="Trang trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: tongSoTrang }, (_, i) => i + 1).map((soTrang) => (
                        <button
                          key={'my-page-' + soTrang}
                          type="button"
                          onClick={() => chuyenTrang(soTrang)}
                          className={`w-8 h-8 text-xs font-bold rounded-xl transition ${
                            trangHienTai === soTrang
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {soTrang}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => chuyenTrang(trangHienTai + 1)}
                        disabled={trangHienTai === tongSoTrang}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
                        title="Trang kế tiếp"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ========================================================= */}
            {/* THÔNG BÁO CHO TÀI KHOẢN MỚI CHƯA CÓ KHÓA HỌC NÀO */}
            {/* ========================================================= */}
            {daDangNhap && !laGiaSu && danhSachDaGhiDanh.length === 0 && (
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-orange-100 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1">
                  Chào bạn! Bạn chưa ghi danh khóa học nào.
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto mb-5 leading-relaxed">
                  Góc học tập của bạn đang trống. Bạn có thể xem nhanh 3 khóa học gợi ý bên dưới hoặc bấm nút bên dưới để mở toàn bộ danh mục khóa học với bộ lọc theo môn học, thầy cô và mức học phí!
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-black px-6 py-3 rounded-2xl text-xs sm:text-sm transition shadow-md"
                >
                  <Search className="w-4 h-4" />
                  <span>Khám Phá Toàn Bộ Khóa Học & Bộ Lọc Nâng Cao</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* ========================================================= */}
            {/* PHẦN 2: CÁC KHÓA HỌC NỔI BẬT ĐƯỢC ĐỀ XUẤT (TỐI ĐA 3 KHÓA) */}
            {/* ========================================================= */}
            <section className="khu_vuc_khoa_hoc_pho_bien">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-black text-gray-900">
                      {daDangNhap && danhSachDaGhiDanh.length > 0
                        ? 'Khóa Học Nổi Bật Được Đề Xuất'
                        : 'Các Khóa Học Tiêu Biểu Dành Cho Bạn'}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Hiển thị một số khóa học nổi bật. Để tìm kiếm chi tiết và lọc theo môn học, thầy cô, hãy bấm <strong>"Xem thêm tất cả"</strong>.
                  </p>
                </div>

                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-primary hover:bg-primary-dark text-white font-black px-4 py-2.5 rounded-2xl text-xs transition shadow shrink-0"
                >
                  <span>Xem thêm tất cả</span>
                  <span>({danhSachPhoBien.length} khóa)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {danhSachPhoBienLoc.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 text-xs text-gray-500">
                  <Search className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  Không tìm thấy khóa học nào phù hợp với từ khóa "{tuKhoa}".
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTuKhoa('');
                        setTabLoc('TAT_CA');
                      }}
                      className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                    >
                      Xóa Bộ Lọc Để Xem Tất Cả
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {danhSachPhoBienLoc.slice(0, 3).map((khoa, idx) => {
                      const idKhoa = khoa.id || khoa.courseId;
                      const tieuDe = khoa.title || khoa.courseTitle || '[MÔN HỌC]';
                      const giangVien = khoa.tutorName || 'Gia Sư';
                      const daThamGia = daGhiDanhRoi(idKhoa);
                      const dangXuLy = dangGhiDanhId === idKhoa;

                      return (
                        <div
                          key={'pub-' + idKhoa + '-' + idx}
                          onClick={() => navigate(`/courses/${idKhoa}`)}
                          className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
                        >
                          <div className="relative h-44 overflow-hidden bg-slate-800">
                            <img
                              src={anhKhoaHocList[idx % anhKhoaHocList.length]}
                              alt={tieuDe}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            {khoa.hasEnrollmentKey ? (
                              <div className="absolute top-3 right-3 bg-amber-500/95 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Cần Mật Khẩu</span>
                              </div>
                            ) : (
                              <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                                <Globe className="w-3.5 h-3.5" />
                                <span>Mở Tự Do</span>
                              </div>
                            )}

                            {daThamGia && (
                              <div className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Đã Ghi Danh</span>
                              </div>
                            )}
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                                  {khoa.courseCode || 'KHÓA HỌC'}
                                </span>
                                <span className="text-xs font-black text-primary">
                                  {Number(khoa.price) > 0
                                    ? `${Number(khoa.price).toLocaleString('vi-VN')} đ`
                                    : 'Miễn phí'}
                                </span>
                              </div>

                              <h3 className="font-bold text-base text-gray-900 mt-1 line-clamp-2 group-hover:text-primary transition">
                                {tieuDe}
                              </h3>

                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                                <span>Gia sư:</span>
                                <span className="font-bold text-gray-800">{giangVien}</span>
                              </p>

                              <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                                {khoa.description || 'Chưa có mô tả chi tiết.'}
                              </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-gray-100 flex flex-col gap-2">
                              {daThamGia ? (
                                <Link
                                  to={`/courses/${idKhoa}`}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Vào Lớp Học Ngay</span>
                                  <ArrowRight className="w-4 h-4 ml-0.5" />
                                </Link>
                              ) : khoa.hasEnrollmentKey ? (
                                <Link
                                  to={`/courses/${idKhoa}`}
                                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                                >
                                  <KeyRound className="w-4 h-4" />
                                  <span>Nhập Mật Khẩu Vào Lớp</span>
                                  <ArrowRight className="w-4 h-4 ml-0.5" />
                                </Link>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => handleThemVaoKhoaHocCuaToi(e, khoa)}
                                    disabled={dangXuLy}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-black py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                                  >
                                    {dangXuLy ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Đang Thêm...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Thêm Vào Khóa Của Tôi</span>
                                      </>
                                    )}
                                  </button>
                                  <Link
                                    to={`/courses/${idKhoa}`}
                                    className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center"
                                    title="Xem chi tiết"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BANNER XEM THÊM TẤT CẢ KHÓA HỌC KÈM BỘ LỌC CHUYÊN SÂU */}
                  <div className="mt-8 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg border border-orange-500/20">
                    <div className="max-w-xl text-center sm:text-left">
                      <div className="inline-block bg-primary/20 text-orange-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2 tracking-wider border border-orange-400/30">
                        Khám Phá Toàn Diện
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        Bạn muốn tìm thêm nhiều môn học & lọc theo thầy cô?
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                        Hệ thống đang có <strong>{danhSachPhoBien.length} khóa học</strong> với bộ lọc đa dạng theo <em>Toán, Lý, Tiếng Anh, CNTT</em>, gia sư yêu thích, mức học phí và mã bảo mật.
                      </p>
                    </div>

                    <Link
                      to="/courses"
                      className="bg-primary hover:bg-primary-dark text-white font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition shadow-lg shrink-0 flex items-center gap-2 group"
                    >
                      <Search className="w-4 h-4" />
                      <span>Xem Thêm Tất Cả Khóa Học</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </>
              )}
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
