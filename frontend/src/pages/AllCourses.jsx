import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Lock,
  Globe,
  Plus,
  Eye,
  GraduationCap,
  BookOpen,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Coins,
  ShieldCheck,
  KeyRound,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowRight,
  School,
  Calculator,
  Atom,
  Languages,
  Code2,
} from 'lucide-react';
import { courseApi } from '../features/courses/api/courseApi';
import { useAuth } from '../context/AuthContext';

/**
 * ====================================================================
 * TRANG DANH MỤC TOÀN BỘ KHÓA HỌC (AllCourses.jsx)
 * Trung tâm tìm kiếm & khám phá khóa học chuẩn EdTech (Coursera / Udemy):
 *   - Cột trái (Sidebar Filter):
 *       + Lọc theo Môn học (Toán, Lý, Tiếng Anh, CNTT...)
 *       + Lọc theo Thầy cô / Gia sư
 *       + Lọc theo Hình thức (🔒 Cần Mật Khẩu / 🌐 Mở Tự Do)
 *       + Lọc theo Mức học phí (Miễn phí, <500k, 500k-1tr, >1tr)
 *   - Cột phải:
 *       + Thanh Search tức thì (Instant Realtime Filter)
 *       + Sắp xếp (Mới nhất, Giá tăng/giảm, Tên A-Z)
 *       + Lưới hiển thị khóa học kèm nút 1-click enroll / nhập mật khẩu
 * ====================================================================
 */
export default function AllCourses() {
  const navigate = useNavigate();
  const { daDangNhap } = useAuth();

  const [toanBoKhoaHoc, setToanBoKhoaHoc] = useState([]);
  const [khoaHocDaGhiDanh, setKhoaHocDaGhiDanh] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loiKetNoi, setLoiKetNoi] = useState(null);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');
  const [dangGhiDanhId, setDangGhiDanhId] = useState(null);

  // BỘ LỌC VÀ SẮP XẾP
  const [tuKhoa, setTuKhoa] = useState('');
  const [monHocChon, setMonHocChon] = useState('ALL'); // 'ALL' | 'TOAN' | 'LY' | 'ANH' | 'CNTT'
  const [giaSuChon, setGiaSuChon] = useState('ALL'); // 'ALL' | <tutorName>
  const [hinhThucChon, setHinhThucChon] = useState('ALL'); // 'ALL' | 'MAT_KHAU' | 'TU_DO'
  const [mucGiaChon, setMucGiaChon] = useState('ALL'); // 'ALL' | 'MIEN_PHI' | 'DUOI_500K' | '500K_1TR' | 'TREN_1TR'
  const [sapXep, setSapXep] = useState('MOI_NHAT'); // 'MOI_NHAT' | 'GIA_TANG' | 'GIA_GIAM' | 'TEN_AZ'
  const [trangHienTai, setTrangHienTai] = useState(1);
  const KICH_THUOC_TRANG = 6;

  // Mobile Filter Drawer toggle
  const [moDrawerBoLoc, setMoDrawerBoLoc] = useState(false);

  useEffect(() => {
    taiDuLieu();
  }, [daDangNhap]);

  // Tự động về trang 1 khi thay đổi bất kỳ tiêu chí lọc hoặc tìm kiếm
  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoa, monHocChon, giaSuChon, hinhThucChon, mucGiaChon, sapXep]);

  const taiDuLieu = async () => {
    setDangTai(true);
    setLoiKetNoi(null);
    try {
      const catalog = await courseApi.layDanhSachKhoaHocChung();
      const list = Array.isArray(catalog) ? catalog : [];
      setToanBoKhoaHoc(list);

      if (daDangNhap) {
        try {
          const myCourses = await courseApi.layKhoaHocCuaToi();
          setKhoaHocDaGhiDanh(Array.isArray(myCourses) ? myCourses : []);
        } catch (e) {
          console.warn('Lỗi lấy khóa học đã ghi danh:', e);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh mục khóa học:', err);
      setLoiKetNoi('Hiện tại không thể tải danh sách khóa học. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setDangTai(false);
    }
  };

  // Danh sách Gia sư duy nhất để tạo filter
  const danhSachGiaSuDuyNhat = Array.from(
    new Set(toanBoKhoaHoc.map((k) => k.tutorName).filter(Boolean))
  );

  // Thêm nhanh vào "Khóa học của tôi"
  const handleThemVaoKhoaHocCuaToi = async (e, course) => {
    e.stopPropagation();
    if (!daDangNhap) {
      alert('Vui lòng đăng nhập tài khoản Học Viên để thêm khóa học vào danh sách của bạn!');
      navigate('/login');
      return;
    }

    if (course.hasEnrollmentKey) {
      navigate(`/courses/${course.id}`);
      return;
    }

    setDangGhiDanhId(course.id);
    try {
      await courseApi.dangKyKhoaHoc(course.id, {});
      setThongBaoThanhCong(`🎉 Đã thêm khóa học "${course.title}" vào Khóa học của tôi!`);
      await taiDuLieu();
      setTimeout(() => setThongBaoThanhCong(''), 4000);
    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || 'Không thể thêm khóa học lúc này.'));
    } finally {
      setDangGhiDanhId(null);
    }
  };

  // Đặt lại toàn bộ bộ lọc
  const datLaiBoLoc = () => {
    setTuKhoa('');
    setMonHocChon('ALL');
    setGiaSuChon('ALL');
    setHinhThucChon('ALL');
    setMucGiaChon('ALL');
    setSapXep('MOI_NHAT');
    setTrangHienTai(1);
  };

  // Kiểm tra khóa học đã ghi danh chưa
  const daGhiDanhRoi = (courseId) => {
    return khoaHocDaGhiDanh.some(
      (item) => String(item.id || item.courseId) === String(courseId)
    );
  };

  // LOGIC LỌC TỔNG HỢP
  const khoaHocSauLoc = toanBoKhoaHoc.filter((k) => {
    const title = (k.title || '').toLowerCase();
    const tutor = (k.tutorName || '').toLowerCase();
    const code = (k.courseCode || '').toLowerCase();
    const desc = (k.description || '').toLowerCase();
    const q = tuKhoa.toLowerCase().trim();

    // 1. Lọc theo từ khóa
    if (q && !title.includes(q) && !tutor.includes(q) && !code.includes(q) && !desc.includes(q)) {
      return false;
    }

    // 2. Lọc theo môn học
    if (monHocChon === 'TOAN') {
      const isToan = title.includes('toán') || title.includes('hàm số') || title.includes('tích phân') || title.includes('oxyz');
      if (!isToan) return false;
    } else if (monHocChon === 'LY') {
      const isLy = title.includes('vật lý') || title.includes('lý') || title.includes('quang');
      if (!isLy) return false;
    } else if (monHocChon === 'ANH') {
      const isAnh = title.includes('ielts') || title.includes('tiếng anh') || title.includes('eng');
      if (!isAnh) return false;
    } else if (monHocChon === 'CNTT') {
      const isCntt = title.includes('cntt') || title.includes('web') || title.includes('lập trình') || title.includes('ai') || title.includes('learning');
      if (!isCntt) return false;
    }

    // 3. Lọc theo Gia sư
    if (giaSuChon !== 'ALL' && k.tutorName !== giaSuChon) {
      return false;
    }

    // 4. Lọc theo hình thức lớp
    if (hinhThucChon === 'MAT_KHAU' && !k.hasEnrollmentKey) return false;
    if (hinhThucChon === 'TU_DO' && k.hasEnrollmentKey) return false;

    // 5. Lọc theo mức giá
    const gia = Number(k.price) || 0;
    if (mucGiaChon === 'MIEN_PHI' && gia > 0) return false;
    if (mucGiaChon === 'DUOI_500K' && (gia === 0 || gia >= 500000)) return false;
    if (mucGiaChon === '500K_1TR' && (gia < 500000 || gia > 1000000)) return false;
    if (mucGiaChon === 'TREN_1TR' && gia <= 1000000) return false;

    return true;
  });

  // LOGIC SẮP XẾP
  const khoaHocSauSapXep = [...khoaHocSauLoc].sort((a, b) => {
    if (sapXep === 'GIA_TANG') {
      return (Number(a.price) || 0) - (Number(b.price) || 0);
    }
    if (sapXep === 'GIA_GIAM') {
      return (Number(b.price) || 0) - (Number(a.price) || 0);
    }
    if (sapXep === 'TEN_AZ') {
      return (a.title || '').localeCompare(b.title || '');
    }
    // Mặc định: Mới nhất
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // TÍNH TOÁN PHÂN TRANG (PAGINATION)
  const tongSoTrang = Math.max(1, Math.ceil(khoaHocSauSapXep.length / KICH_THUOC_TRANG));
  const viTriBatDau = (trangHienTai - 1) * KICH_THUOC_TRANG;
  const khoaHocTrangHienTai = khoaHocSauSapXep.slice(viTriBatDau, viTriBatDau + KICH_THUOC_TRANG);

  const chuyenTrang = (soTrangMoi) => {
    if (soTrangMoi < 1 || soTrangMoi > tongSoTrang) return;
    setTrangHienTai(soTrangMoi);
    const element = document.getElementById('khu_vuc_danh_sach_khoa_hoc');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const anhKhoaHocList = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  ];

  const coBoLocDangApDung =
    tuKhoa ||
    monHocChon !== 'ALL' ||
    giaSuChon !== 'ALL' ||
    hinhThucChon !== 'ALL' ||
    mucGiaChon !== 'ALL' ||
    sapXep !== 'MOI_NHAT';

  return (
    <div className="khung_danh_muc_toan_bo_khoa_hoc bg-gray-50 py-8 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB */}
        <div className="thanh_dieu_huong_breadcrumb text-xs text-gray-500 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-primary transition">Trang Chủ</Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold">Tất Cả Khóa Học</span>
        </div>

        {/* THÔNG BÁO TOAST */}
        {thongBaoThanhCong && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span className="font-semibold">{thongBaoThanhCong}</span>
            </div>
            <button onClick={() => setThongBaoThanhCong('')} className="text-green-700 font-bold p-1 hover:bg-green-100 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* BANNER TIÊU ĐỀ TRANG */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-md border border-orange-500/20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 bg-primary/20 text-orange-400 text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 tracking-wider border border-orange-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khám Phá Tri Thức</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2">
              Khám Phá Toàn Bộ Khóa Học Trên TutorLMS
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Dễ dàng tìm kiếm và tham gia lớp học phù hợp với bộ lọc theo môn học, gia sư phụ trách, mức học phí và mã lớp bảo mật.
            </p>
          </div>
        </div>

        {/* BỐ CỤC 2 CỘT: SIDEBAR FILTER (TRÁI) + COURSE GRID (PHẢI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* CỘT TRÁI: SIDEBAR BỘ LỌC (FILTER SIDEBAR) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Nút mở bộ lọc trên Mobile */}
            <button
              type="button"
              onClick={() => setMoDrawerBoLoc(!moDrawerBoLoc)}
              className="lg:hidden w-full bg-white border border-gray-300 hover:border-primary text-gray-800 font-bold p-3.5 rounded-2xl text-xs flex items-center justify-between shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Bộ Lọc Khóa Học {coBoLocDangApDung && '• Đang áp dụng'}</span>
              </span>
              <span>{moDrawerBoLoc ? 'Đóng ▲' : 'Mở ▼'}</span>
            </button>

            <div
              className={`bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6 ${
                moDrawerBoLoc ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-primary" />
                  <span>Bộ Lọc Nâng Cao</span>
                </h3>
                {coBoLocDangApDung && (
                  <button
                    type="button"
                    onClick={datLaiBoLoc}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>

              {/* 1. LỌC THEO MÔN HỌC */}
              <div>
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>Môn Học</span>
                </label>
                <div className="space-y-1.5 text-xs text-gray-700">
                  {[
                    { id: 'ALL', ten: 'Tất cả môn học', icon: BookOpen },
                    { id: 'TOAN', ten: 'Toán Học', icon: Calculator },
                    { id: 'LY', ten: 'Vật Lý', icon: Atom },
                    { id: 'ANH', ten: 'Tiếng Anh / IELTS', icon: Languages },
                    { id: 'CNTT', ten: 'Công Nghệ Thông Tin', icon: Code2 },
                  ].map((m) => {
                    const IconComp = m.icon;
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${
                          monHocChon === m.id
                            ? 'bg-orange-50 font-bold text-primary'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="filter_mon"
                          checked={monHocChon === m.id}
                          onChange={() => setMonHocChon(m.id)}
                          className="accent-primary"
                        />
                        <IconComp className="w-3.5 h-3.5 text-slate-500" />
                        <span>{m.ten}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. LỌC THEO THẦY CÔ / GIA SƯ */}
              <div>
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  <span>Gia Sư Giảng Dạy</span>
                </label>
                <select
                  value={giaSuChon}
                  onChange={(e) => setGiaSuChon(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 font-medium"
                >
                  <option value="ALL">Tất cả thầy cô</option>
                  {danhSachGiaSuDuyNhat.map((tutor) => (
                    <option key={tutor} value={tutor}>
                      {tutor}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. LỌC THEO HÌNH THỨC VÀO LỚP */}
              <div>
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>Hình Thức Vào Lớp</span>
                </label>
                <div className="space-y-1.5 text-xs text-gray-700">
                  {[
                    { id: 'ALL', ten: 'Tất cả hình thức', icon: Sparkles },
                    { id: 'MAT_KHAU', ten: 'Lớp Cần Mật Khẩu (Kín)', icon: Lock },
                    { id: 'TU_DO', ten: 'Lớp Mở Tự Do (Công Khai)', icon: Globe },
                  ].map((h) => {
                    const IconComp = h.icon;
                    return (
                      <label
                        key={h.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${
                          hinhThucChon === h.id
                            ? 'bg-orange-50 font-bold text-primary'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="filter_hinhthuc"
                          checked={hinhThucChon === h.id}
                          onChange={() => setHinhThucChon(h.id)}
                          className="accent-primary"
                        />
                        <IconComp className="w-3.5 h-3.5 text-slate-500" />
                        <span>{h.ten}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. LỌC THEO MỨC HỌC PHÍ */}
              <div>
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mức Học Phí</span>
                </label>
                <div className="space-y-1.5 text-xs text-gray-700">
                  {[
                    { id: 'ALL', ten: 'Tất cả mức giá' },
                    { id: 'MIEN_PHI', ten: 'Miễn phí (0 đ)' },
                    { id: 'DUOI_500K', ten: 'Dưới 500.000 đ' },
                    { id: '500K_1TR', ten: '500.000 đ – 1.000.000 đ' },
                    { id: 'TREN_1TR', ten: 'Trên 1.000.000 đ' },
                  ].map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${
                        mucGiaChon === p.id
                          ? 'bg-orange-50 font-bold text-primary'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="filter_gia"
                        checked={mucGiaChon === p.id}
                        onChange={() => setMucGiaChon(p.id)}
                        className="accent-primary"
                      />
                      <span>{p.ten}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* NÚT XÓA BỘ LỌC */}
              {coBoLocDangApDung && (
                <button
                  type="button"
                  onClick={datLaiBoLoc}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đặt Lại Tất Cả Bộ Lọc</span>
                </button>
              )}
            </div>

            {/* CARD QUẢNG BÁ KHÓA HỌC CỦA TÔI */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-5 rounded-3xl border border-orange-200 text-xs">
              <GraduationCap className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-black text-gray-900 mb-1">Góc Học Tập Cá Nhân</h4>
              <p className="text-gray-600 mb-3">
                Xem lại các lớp học bạn đã ghi danh và bài tập cần hoàn thành.
              </p>
              <Link
                to="/my-courses"
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
              >
                <span>Vào Khóa Học Của Tôi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CỘT PHẢI: THANH TÌM KIẾM + SẮP XẾP + COURSE GRID */}
          {/* ========================================================= */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* THANH TÌM KIẾM TRUNG TÂM VÀ DROP-DOWN SẮP XẾP */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* Ô TÌM KIẾM TỨC THÌ */}
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                  placeholder="Tìm theo tên khóa học, tên giáo viên (VD: Hoàng Nam, Toán 12, CRS-938)..."
                  className="w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm rounded-2xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-orange-100 outline-none bg-gray-50 focus:bg-white transition"
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

              {/* DROP-DOWN SẮP XẾP */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <span>Sắp xếp:</span>
                </span>
                <select
                  value={sapXep}
                  onChange={(e) => setSapXep(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary bg-gray-50 cursor-pointer"
                >
                  <option value="MOI_NHAT">Mới Nhất</option>
                  <option value="GIA_TANG">Giá: Thấp → Cao</option>
                  <option value="GIA_GIAM">Giá: Cao → Thấp</option>
                  <option value="TEN_AZ">Tên: A → Z</option>
                </select>
              </div>
            </div>

            {/* THỐNG KÊ KẾT QUẢ TÌM KIẾM */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <div>
                Tìm thấy{' '}
                <strong className="text-primary font-black text-sm">{khoaHocSauSapXep.length}</strong> khóa học
                phù hợp.
              </div>
              {coBoLocDangApDung && (
                <button
                  type="button"
                  onClick={datLaiBoLoc}
                  className="text-primary hover:underline font-bold"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>

            {/* LƯỚI KHÓA HỌC */}
            <div id="khu_vuc_danh_sach_khoa_hoc" className="scroll-mt-6">
              {dangTai ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 text-sm text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                Đang tìm kiếm khóa học...
              </div>
            ) : loiKetNoi ? (
              <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-200 p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-xl font-extrabold text-red-700 mb-2">Chưa thể tải dữ liệu</h3>
                <p className="text-sm text-red-600 mb-4">{loiKetNoi}</p>
                <button
                  onClick={taiDuLieu}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử Lại</span>
                </button>
              </div>
            ) : khoaHocSauSapXep.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-black text-gray-900 mb-1">Không tìm thấy khóa học phù hợp</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
                  Không có khóa học nào khớp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
                </p>
                <button
                  type="button"
                  onClick={datLaiBoLoc}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đặt Lại Tất Cả Bộ Lọc</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {khoaHocTrangHienTai.map((khoa, idx) => {
                  const idKhoa = khoa.id || khoa.courseId;
                  const tieuDe = khoa.title || '[MÔN HỌC]';
                  const giangVien = khoa.tutorName || 'Gia Sư';
                  const daThamGia = daGhiDanhRoi(idKhoa);
                  const dangXuLy = dangGhiDanhId === idKhoa;

                  return (
                    <div
                      key={'all-' + idKhoa + '-' + idx}
                      onClick={() => navigate(`/courses/${idKhoa}`)}
                      className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
                    >
                      {/* ẢNH BÌA & HUY HIỆU */}
                      <div className="relative h-44 overflow-hidden bg-slate-800">
                        <img
                          src={anhKhoaHocList[idx % anhKhoaHocList.length]}
                          alt={tieuDe}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
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

                      {/* THÔNG TIN CHI TIẾT */}
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

                          <h3 className="font-black text-base text-gray-900 mt-1 line-clamp-2 group-hover:text-primary transition leading-snug">
                            {tieuDe}
                          </h3>

                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            <span>Gia sư:</span>
                            <span className="font-bold text-gray-800">{giangVien}</span>
                          </p>

                          <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                            {khoa.description || 'Chưa có mô tả chi tiết.'}
                          </p>
                        </div>

                        {/* NÚT THAO TÁC */}
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
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
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
            )}

            {/* THANH PHÂN TRANG (PAGINATION CONTROLS) */}
            {!dangTai && !loiKetNoi && khoaHocSauSapXep.length > 0 && tongSoTrang > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 font-medium">
                  Hiển thị <span className="font-bold text-gray-800">{viTriBatDau + 1}</span> -{' '}
                  <span className="font-bold text-gray-800">
                    {Math.min(viTriBatDau + KICH_THUOC_TRANG, khoaHocSauSapXep.length)}
                  </span>{' '}
                  trên tổng số <span className="font-bold text-primary">{khoaHocSauSapXep.length}</span> khóa học
                </div>

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
                      key={'page-' + soTrang}
                      type="button"
                      onClick={() => chuyenTrang(soTrang)}
                      className={`w-9 h-9 text-xs font-bold rounded-xl transition ${
                        trangHienTai === soTrang
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
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
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
