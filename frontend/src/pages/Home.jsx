import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  Globe,
  KeyRound,
  Plus,
  Eye,
  BookOpen,
  Users,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Zap,
  Video,
  BrainCircuit,
  FileCheck,
  Star,
  Clock,
  Search,
  Award,
} from 'lucide-react';
import { courseApi } from '../features/courses/api/courseApi';
import { useAuth } from '../context/AuthContext';

/**
 * ====================================================================
 * TRANG CHỦ HIỆN ĐẠI (Home.jsx)
 * Giữ nguyên 100% cấu trúc logic và kết nối dữ liệu thật từ Backend:
 *   - Hero Banner Slider với hiệu ứng chuyển cảnh mượt mà
 *   - Thống kê nổi bật (Stats Bar)
 *   - Danh sách khóa học tiêu biểu trực tiếp từ Database
 *   - Trụ cột tính năng LMS (Lớp học ảo, Ghép lớp, Tóm tắt AI, Nộp bài)
 *   - Biểu tượng vector sắc nét từ thư viện Lucide React
 * ====================================================================
 */
export default function Home() {
  const navigate = useNavigate();
  const { daDangNhap } = useAuth();
  const [slideHienTai, setSlideHienTai] = useState(0);
  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState([]);
  const [dangTaiKhoaHoc, setDangTaiKhoaHoc] = useState(true);
  const [loiKetNoi, setLoiKetNoi] = useState(null);
  const [dangThemId, setDangThemId] = useState(null);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');

  // Tải danh sách khóa học thật từ Backend Database khi vào trang
  useEffect(() => {
    const taiKhoaHoc = async () => {
      try {
        const res = await courseApi.layDanhSachKhoaHocChung();
        if (Array.isArray(res) && res.length > 0) {
          setDanhSachKhoaHoc(res);
          setLoiKetNoi(null);
        } else {
          setDanhSachKhoaHoc([]);
          setLoiKetNoi('Hiện chưa có khóa học nào khả dụng.');
        }
      } catch (err) {
        console.error('Lỗi tải khóa học:', err);
        setDanhSachKhoaHoc([]);
        setLoiKetNoi('Không thể tải danh sách khóa học lúc này. Vui lòng tải lại trang sau.');
      } finally {
        setDangTaiKhoaHoc(false);
      }
    };
    taiKhoaHoc();
  }, []);

  const danhSachSlide = [
    {
      id: 1,
      badge: 'NỀN TẢNG LMS HÀNG ĐẦU',
      tieuDe: 'Chinh Phục Tri Thức Cùng TutorLMS',
      moTa: 'Nền tảng học tập trực tuyến hiện đại, kết nối gia sư chất lượng cao và lớp học ảo tương tác thời gian thực.',
      nutBam: 'Khám Phá Khóa Học',
      duongDan: '/courses',
      nutPhu: 'Tìm Gia Sư Dạy Kèm',
      duongDanPhu: '/market',
      anhNen: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80',
    },
    {
      id: 2,
      badge: 'CÔNG NGHỆ KẾT NỐI 4.0',
      tieuDe: 'Chợ Ghép Lớp Thông Minh & Nhanh Chóng',
      moTa: 'Phụ huynh dễ dàng đăng tin tìm gia sư theo môn học, khu vực, mức học phí và lịch học linh hoạt theo tuần.',
      nutBam: 'Vào Chợ Ghép Lớp',
      duongDan: '/market',
      nutPhu: 'Xem Danh Sách Lớp',
      duongDanPhu: '/my-courses',
      anhNen: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80',
    },
    {
      id: 3,
      badge: 'CHẤT LƯỢNG GIẢNG DẠY UY TÍN',
      tieuDe: 'Đội Ngũ Gia Sư Đã Xác Minh Bằng Cấp',
      moTa: '100% hồ sơ giáo viên được kiểm duyệt CCCD, bằng cử nhân sư phạm và chứng chỉ ngoại ngữ quốc tế.',
      nutBam: 'Xem Hồ Sơ Gia Sư',
      duongDan: '/tutor-profile',
      nutPhu: 'Đăng Ký Dạy Học',
      duongDanPhu: '/edit-profile',
      anhNen: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80',
    },
  ];

  useEffect(() => {
    const henGio = setInterval(() => {
      setSlideHienTai((prev) => (prev + 1) % danhSachSlide.length);
    }, 6000);
    return () => clearInterval(henGio);
  }, [danhSachSlide.length]);

  const anhKhoaHocMau = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
  ];

  // Thêm nhanh khóa học vào "Khóa học của tôi"
  const handleThemNhanhKhoaHoc = async (e, khoa) => {
    e.stopPropagation();
    if (!daDangNhap) {
      alert('Vui lòng đăng nhập tài khoản Học Viên để thêm khóa học vào danh sách của bạn!');
      navigate('/login');
      return;
    }
    if (khoa.hasEnrollmentKey) {
      navigate(`/courses/${khoa.id}`);
      return;
    }
    setDangThemId(khoa.id);
    try {
      await courseApi.dangKyKhoaHoc(khoa.id, {});
      setThongBaoThanhCong(`🎉 Đã thêm khóa học "${khoa.title}" vào "Khóa Học Của Tôi" thành công!`);
      setTimeout(() => setThongBaoThanhCong(''), 4500);
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      alert('❌ Lỗi: ' + (err.response?.data?.message || 'Không thể thêm khóa học lúc này.'));
    } finally {
      setDangThemId(null);
    }
  };

  return (
    <div className="khung_trang_chu bg-slate-50 text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* THÔNG BÁO THÀNH CÔNG NỔI TRÊN MÀN HÌNH */}
      {thongBaoThanhCong && (
        <div className="fixed top-20 right-6 z-50 bg-white/95 backdrop-blur-md border-2 border-green-500 text-green-900 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{thongBaoThanhCong}</span>
          <button onClick={() => setThongBaoThanhCong('')} className="text-gray-400 hover:text-gray-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* 1. HERO BANNER SLIDER */}
      <section className="khoi_banner_slider relative w-full h-[520px] sm:h-[580px] lg:h-[620px] overflow-hidden bg-slate-950">
        {/* Glow hiệu ứng nền */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-600/30 rounded-full blur-3xl pointer-events-none z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none z-10" />

        {danhSachSlide.map((slide, index) => (
          <div
            key={slide.id}
            className={`the_slide_item absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === slideHienTai ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
          >
            {/* Lớp gradient kép sang trọng */}
            <div className="lop_phu_gradient absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 to-slate-900/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40 z-10" />
            
            <img
              src={slide.anhNen}
              alt={slide.tieuDe}
              className="anh_nen_slide w-full h-full object-cover object-center transform transition-transform duration-[8000ms] scale-105"
            />

            {/* Nội dung Banner */}
            <div className="khung_noi_dung_banner absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-12 md:px-20 max-w-5xl">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-orange-400 font-extrabold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-4 w-fit border border-orange-400/30 shadow-sm animate-pulse-subtle">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{slide.badge}</span>
              </div>

              <h1 className="tieu_de_banner text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-[1.15] tracking-tight">
                {slide.tieuDe}
              </h1>

              <p className="mo_ta_banner text-sm sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed font-normal">
                {slide.moTa}
              </p>

              <div className="khung_nut_banner flex flex-wrap items-center gap-3.5">
                <Link
                  to={slide.duongDan}
                  className="nut_hanh_dong_chinh group bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <span>{slide.nutBam}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <Link
                  to={slide.duongDanPhu}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-3.5 px-6 rounded-2xl transition border border-white/20 text-sm sm:text-base flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-orange-300" />
                  <span>{slide.nutPhu}</span>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Nút Prev / Next slider */}
        <button
          type="button"
          onClick={() => setSlideHienTai((prev) => (prev - 1 + danhSachSlide.length) % danhSachSlide.length)}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-orange-500 text-white p-3 rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-110 shadow-lg"
          aria-label="Slide trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setSlideHienTai((prev) => (prev + 1) % danhSachSlide.length)}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-orange-500 text-white p-3 rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-110 shadow-lg"
          aria-label="Slide kế tiếp"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots chỉ số slide */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          {danhSachSlide.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlideHienTai(i)}
              className={`transition-all duration-300 rounded-full ${
                i === slideHienTai ? 'w-8 h-2.5 bg-orange-500 shadow-sm' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Đi tới slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. DÃY THỐNG KÊ NHANH (STATS BAR - ẤN TƯỢNG & TIN CẬY) */}
      <section className="relative z-30 -mt-10 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/60 border border-slate-200/80">
          
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">18+</div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Khóa học chuẩn LMS</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">100%</div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Gia sư đã xác thực</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">&lt; 24h</div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Ghép lớp thành công</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-inner">
              <Star className="w-6 h-6 fill-purple-600 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">4.9 / 5.0</div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Học viên hài lòng</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. KHÓA HỌC TỪ DATABASE — KHÔNG CÓ DỮ LIỆU GIẢ */}
      <section className="khoi_khoa_hoc_noi_bat max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="tieu_de_khu_vuc flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>Khám Phá Tri Thức</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Khóa Học Tiêu Biểu &amp; Nổi Bật
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Các khóa học trực tuyến chính thức có đầy đủ giáo án slide, video và bài tập rèn luyện.
            </p>
          </div>

          <Link
            to="/courses"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2.5 rounded-xl border border-orange-200 transition shrink-0"
          >
            <span>Xem tất cả khóa học</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {dangTaiKhoaHoc ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="animate-spin text-4xl mb-3 text-orange-500">⏳</div>
            <p className="text-sm font-bold text-slate-600">Đang cập nhật danh sách khóa học nổi bật...</p>
          </div>
        ) : loiKetNoi ? (
          <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-200 p-8 shadow-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Đang cập nhật khóa học</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">{loiKetNoi}</p>
          </div>
        ) : (
          <div className="luoi_khoa_hoc grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {danhSachKhoaHoc.slice(0, 6).map((khoa, idx) => (
              <div
                key={khoa.id || idx}
                className="the_khoa_hoc hover-card-elevation bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail khóa học */}
                  <div className="khung_anh_khoa_hoc relative h-52 overflow-hidden bg-slate-900">
                    <img
                      src={anhKhoaHocMau[idx % anhKhoaHocMau.length]}
                      alt={khoa.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Huy hiệu bảo mật / công khai */}
                    <div className="absolute top-3.5 right-3.5">
                      {khoa.hasEnrollmentKey ? (
                        <div className="bg-amber-500/95 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md border border-amber-300/30">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Cần Mật Khẩu</span>
                        </div>
                      ) : (
                        <div className="bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md border border-emerald-300/30">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Mở Tự Do</span>
                        </div>
                      )}
                    </div>

                    {/* Mã khóa học overlay */}
                    <div className="absolute bottom-3 left-3.5">
                      <span className="bg-white/20 backdrop-blur-md text-white font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border border-white/20">
                        {khoa.courseCode || 'LMS'}
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết nội dung khóa học */}
                  <div className="thong_tin_khoa_hoc p-6">
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-orange-600 transition line-clamp-2 leading-snug">
                      {khoa.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>Giảng viên:</span>
                      <span className="font-bold text-slate-800 truncate">{khoa.tutorName || 'Gia sư TutorLMS'}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed font-normal">
                      {khoa.description || 'Chương trình giảng dạy chuẩn kiến thức, tài liệu bài học và bài kiểm tra bám sát thực tế.'}
                    </p>
                  </div>
                </div>

                {/* Footer thẻ khóa học: Giá & Nút hành động */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="flex justify-between items-center pb-3.5 border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500 font-medium">Học phí:</span>
                    <span className="text-lg font-black text-orange-600">
                      {khoa.price && Number(khoa.price) > 0
                        ? `${Number(khoa.price).toLocaleString('vi-VN')} đ`
                        : 'Miễn Phí'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {khoa.hasEnrollmentKey ? (
                      <Link
                        to={`/courses/${khoa.id}`}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs py-3 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Vào Lớp (Nhập Mật Khẩu)</span>
                      </Link>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleThemNhanhKhoaHoc(e, khoa)}
                          disabled={dangThemId === khoa.id}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs py-3 px-3.5 rounded-xl transition shadow-md hover:shadow-orange-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 shrink-0" />
                          <span>{dangThemId === khoa.id ? 'Đang thêm...' : 'Thêm Vào Khóa Học'}</span>
                        </button>
                        <Link
                          to={`/courses/${khoa.id}`}
                          className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center shrink-0"
                          title="Xem Chi Tiết Khóa Học"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. TRỤ CỘT TÍNH NĂNG VƯỢT TRỘI CỦA TUTORLMS (FEATURE PILLARS) */}
      <section className="bg-white py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="bg-orange-100 text-orange-800 text-xs font-black uppercase px-3 py-1 rounded-full border border-orange-200">
              Hệ Sinh Thái LMS Đột Phá
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Mọi Thứ Bạn Cần Để Dạy &amp; Học Hiệu Quả
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Tích hợp đầy đủ từ khâu tìm gia sư, mở phòng học ảo, lưu trữ tài liệu đến chấm điểm tự động.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-orange-50/40 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover-card-elevation">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center mb-4 shadow-md shadow-orange-500/30">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-1.5">Lớp Học Ảo &amp; Video</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Tích hợp video bài giảng trực tuyến, bảng trắng tương tác và tài liệu bài học có thể tải về trực tiếp.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-orange-50/40 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover-card-elevation">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md shadow-blue-600/30">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-1.5">Chợ Ghép Lớp Thông Minh</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Đăng tin tìm gia sư theo nhu cầu học tập, so sánh học phí và duyệt chọn hồ sơ giáo viên ứng tuyển minh bạch.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-orange-50/40 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover-card-elevation">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-md shadow-purple-600/30">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-1.5">Trợ Lý AI Tóm Tắt</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Công nghệ AI phân tích và tóm lược nội dung bài giảng thành các ý chính ngắn gọn giúp học sinh ôn tập siêu tốc.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-orange-50/40 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover-card-elevation">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-600/30">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-1.5">Nộp &amp; Chấm Bài Số Hóa</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Gia sư giao bài tập theo hạn nộp, học viên tải file làm bài và nhận điểm số cùng nhận xét chi tiết tức thì.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER (CTA CUỐI TRANG) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950 text-white p-8 sm:p-14 border border-orange-500/20 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-orange-500/20 text-orange-400 font-black px-3.5 py-1 rounded-full text-xs uppercase tracking-wider mb-4 border border-orange-400/30">
              Bắt Đầu Ngay Hôm Nay
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
              Sẵn Sàng Nâng Tầm Kết Quả Học Tập Cùng TutorLMS?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
              Tham gia cộng đồng hơn hàng nghìn học viên và gia sư uy tín. Bắt đầu khóa học chất lượng đầu tiên của bạn ngay bây giờ!
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/courses"
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-orange-500/30 hover:scale-105"
              >
                Khám Phá Toàn Bộ Khóa Học →
              </Link>
              <Link
                to="/market"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition border border-white/20"
              >
                Đăng Tin Tìm Gia Sư
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
