import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import MarketFilter from '../features/market/components/MarketFilter';
import CreatePostBox from '../features/market/components/CreatePostBox';
import PostCard from '../features/market/components/PostCard';
import SuggestedTutors from '../features/market/components/SuggestedTutors';
import { marketApi } from '../features/market/api/marketApi';
import { useAuth } from '../context/AuthContext';

/**
 * ====================================================================
 * TRANG CHỢ GHÉP LỚP (Market.jsx)
 * Kết nối dữ liệu thật 100% từ Database Supabase qua Spring Boot:
 *   - Quản lý danh sách bài đăng
 *   - Thích, Bình luận, Nộp đơn ứng tuyển gia sư, Duyệt nhận lớp
 *   - Bộ lọc tìm kiếm theo môn, trạng thái, loại bài đăng
 * ====================================================================
 */
export default function Market() {
  const { nguoiDung, daDangNhap } = useAuth();
  const [posts, setPosts] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loiKetNoi, setLoiKetNoi] = useState(null);
  const [thongBaoMoi, setThongBaoMoi] = useState('');

  // Bộ lọc
  const [tuKhoa, setTuKhoa] = useState('');
  const [loaiTin, setLoaiTin] = useState('ALL');
  const [trangThai, setTrangThai] = useState('ALL');
  const [trangHienTai, setTrangHienTai] = useState(1);
  const KICH_THUOC_TRANG = 5;

  useEffect(() => {
    taiDanhSachBaiDang();
  }, []);

  // Tự động về trang 1 khi lọc
  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoa, loaiTin, trangThai]);

  const taiDanhSachBaiDang = async () => {
    setDangTai(true);
    try {
      const duLieu = await marketApi.layDanhSachBaiDang();
      if (Array.isArray(duLieu)) {
        setPosts(duLieu);
        setLoiKetNoi(null);
      } else {
        setPosts([]);
        setLoiKetNoi('Hiện chưa có bài đăng nào trên Diễn đàn lớp học.');
      }
    } catch (err) {
      console.error('Lỗi tải bài viết:', err);
      setPosts([]);
      setLoiKetNoi('Hiện tại không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setDangTai(false);
    }
  };

  const handleAddNewPost = async (newPostData) => {
    const payload = {
      authorId: nguoiDung?.id || null,
      authorName: nguoiDung?.fullName || 'Người dùng TutorLMS',
      authorAvatar: nguoiDung?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(nguoiDung?.fullName || 'User')}&background=f97316&color=fff`,
      authorRole: nguoiDung?.role || 'ROLE_STUDENT',
      badgeType: newPostData.badgeType || 'TUYEN_GIA_SU',
      content: newPostData.content,
      subject: newPostData.subject || null,
      gradeLevel: newPostData.gradeLevel || null,
      location: newPostData.location || 'Hà Nội',
      schedule: newPostData.schedule || 'Linh hoạt',
      fee: newPostData.fee || 'Thương lượng',
    };

    try {
      const baiDangMoi = await marketApi.taoBaiDangMoi(payload);
      setPosts([baiDangMoi, ...posts]);
      setThongBaoMoi('Bài đăng của bạn đã được xuất bản thành công!');
      setTimeout(() => setThongBaoMoi(''), 4000);
    } catch (err) {
      alert('Đăng bài không thành công: ' + (err.response?.data?.message || 'Vui lòng thử lại sau.'));
    }
  };

  const handleResetFilter = () => {
    setTuKhoa('');
    setLoaiTin('ALL');
    setTrangThai('ALL');
    setTrangHienTai(1);
  };

  // Lọc bài đăng theo tiêu chí
  const postsFiltered = posts.filter((p) => {
    const q = tuKhoa.toLowerCase().trim();
    const content = (p.content || '').toLowerCase();
    const subject = (p.subject || '').toLowerCase();
    const author = (p.authorName || '').toLowerCase();
    const location = (p.location || '').toLowerCase();

    // 1. Từ khóa
    if (q && !content.includes(q) && !subject.includes(q) && !author.includes(q) && !location.includes(q)) {
      return false;
    }

    // 2. Loại bài đăng
    if (loaiTin !== 'ALL' && p.badgeType !== loaiTin) {
      return false;
    }

    // 3. Trạng thái lớp
    if (trangThai !== 'ALL' && (p.status || 'OPEN') !== trangThai) {
      return false;
    }

    return true;
  });

  // PHÂN TRANG (PAGINATION)
  const tongSoTrang = Math.max(1, Math.ceil(postsFiltered.length / KICH_THUOC_TRANG));
  const viTriBatDau = (trangHienTai - 1) * KICH_THUOC_TRANG;
  const postsTrangHienTai = postsFiltered.slice(viTriBatDau, viTriBatDau + KICH_THUOC_TRANG);

  const chuyenTrang = (soTrangMoi) => {
    if (soTrangMoi < 1 || soTrangMoi > tongSoTrang) return;
    setTrangHienTai(soTrangMoi);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-100/70 min-h-screen py-6 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BANNER HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-md border border-orange-500/20">
          <div className="inline-flex items-center gap-1.5 bg-primary/20 text-orange-400 font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-2 border border-orange-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cộng Đồng Kết Nối Học Tập</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
            Chợ Ghép Lớp & Tìm Kiếm Gia Sư
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Nơi Phụ huynh & Học viên đăng tin tìm gia sư phù hợp, và Gia sư trực tiếp gửi hồ sơ ứng tuyển, thảo luận và nhận lớp học tức thì.
          </p>
        </div>

        {/* THÔNG BÁO TOAST */}
        {thongBaoMoi && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span className="font-semibold">{thongBaoMoi}</span>
            </div>
            <button onClick={() => setThongBaoMoi('')} className="text-green-700 font-bold p-1 hover:bg-green-100 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* CỘT TRÁI: BỘ LỌC TÌM KIẾM */}
          <MarketFilter
            tuKhoa={tuKhoa}
            setTuKhoa={setTuKhoa}
            loaiTin={loaiTin}
            setLoaiTin={setLoaiTin}
            trangThai={trangThai}
            setTrangThai={setTrangThai}
            onReset={handleResetFilter}
          />

          {/* CỘT GIỮA: DÒNG THỜI GIAN FEED */}
          <main className="w-full lg:w-2/4 flex-1">
            <CreatePostBox onPostCreated={handleAddNewPost} />

            {dangTai ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-500 shadow-sm border border-gray-200">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                Đang tải bài viết diễn đàn...
              </div>
            ) : loiKetNoi ? (
              <div className="bg-red-50 rounded-3xl p-8 text-center shadow-sm border border-red-200">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-black text-red-700 mb-2">Không thể tải dữ liệu</h3>
                <p className="text-xs text-red-600 mb-4">{loiKetNoi}</p>
                <button
                  type="button"
                  onClick={taiDanhSachBaiDang}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử lại</span>
                </button>
              </div>
            ) : postsFiltered.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-500 shadow-sm border border-gray-200">
                <Search className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-sm mb-1">Không tìm thấy bài đăng phù hợp</h4>
                <p className="text-gray-500 mb-3">Thử thay đổi từ khóa hoặc đặt lại bộ lọc tìm kiếm.</p>
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div>
                <div className="space-y-4">
                  {postsTrangHienTai.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostUpdated={taiDanhSachBaiDang}
                    />
                  ))}
                </div>

                {/* THANH PHÂN TRANG */}
                {tongSoTrang > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <span className="text-xs text-gray-500 font-medium">
                      Trang <strong className="text-gray-800 font-bold">{trangHienTai}</strong> / {tongSoTrang} (Tổng cộng {postsFiltered.length} bài)
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
                          key={'post-page-' + soTrang}
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
              </div>
            )}
          </main>

          {/* CỘT PHẢI: GỢI Ý GIA SƯ */}
          <SuggestedTutors />
        </div>
      </div>
    </div>
  );
}
