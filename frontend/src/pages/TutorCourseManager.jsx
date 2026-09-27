import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Unlock,
  Globe,
  KeyRound,
  Plus,
  FileText,
  ClipboardList,
  Paperclip,
  Video,
  Trash2,
  Clock,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  School,
  Loader2,
  BookOpen,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { courseApi } from '../features/courses/api/courseApi';
import { useAuth } from '../context/AuthContext';

/**
 * ====================================================================
 * TRANG QUẢN LÝ KHÓA HỌC DÀNH CHO GIA SƯ (TutorCourseManager.jsx)
 * Kết nối thật 100% với Spring Boot REST API:
 *   - Quản lý danh sách khóa học của gia sư
 *   - Tạo khóa học mới kèm MẬT KHẨU GHI DANH (Enrollment Key)
 *   - Tải lên tài liệu, bài giảng (POST /api/v1/tutor/courses/{id}/materials)
 *   - Giao bài tập về nhà (POST /api/v1/tutor/courses/{id}/assignments)
 * ====================================================================
 */
export default function TutorCourseManager() {
  const navigate = useNavigate();
  const { nguoiDung, daDangNhap } = useAuth();

  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState([]);
  const [khoaHocDangChon, setKhoaHocDangChon] = useState(null);
  const [taiLieuList, setTaiLieuList] = useState([]);
  const [baiTapList, setBaiTapList] = useState([]);

  const [dangTai, setDangTai] = useState(true);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');

  // Modals
  const [moModalTaoKhoaHoc, setMoModalTaoKhoaHoc] = useState(false);
  const [moModalUpTaiLieu, setMoModalUpTaiLieu] = useState(false);
  const [moModalGiaoBaiTap, setMoModalGiaoBaiTap] = useState(false);

  // Form states
  const [formKhoaHoc, setFormKhoaHoc] = useState({
    title: '',
    description: '',
    price: 0,
    enrollmentKey: '',
  });

  const [formTaiLieu, setFormTaiLieu] = useState({
    title: '',
    fileUrl: '',
    lectureLink: '',
  });

  const [formBaiTap, setFormBaiTap] = useState({
    title: '',
    content: '',
    dueAt: '',
  });

  // Tải danh sách khóa học của gia sư khi vào trang
  useEffect(() => {
    if (daDangNhap) {
      taiDanhSachKhoaHoc();
    } else {
      setDangTai(false);
    }
  }, [daDangNhap]);

  // Khi chọn một khóa học, tự động tải tài liệu & bài tập của khóa đó
  useEffect(() => {
    if (khoaHocDangChon?.id) {
      taiDuLieuChiTietKhoaHoc(khoaHocDangChon.id);
    }
  }, [khoaHocDangChon]);

  const taiDanhSachKhoaHoc = async () => {
    setDangTai(true);
    setThongBaoLoi('');
    try {
      const res = await courseApi.layKhoaHocCuaGiaSu();
      const list = Array.isArray(res) ? res : [];
      setDanhSachKhoaHoc(list);
      if (list.length > 0 && !khoaHocDangChon) {
        setKhoaHocDangChon(list[0]);
      }
    } catch (err) {
      console.error('Lỗi lấy khóa học gia sư:', err);
      setThongBaoLoi(err.response?.data?.message || 'Không thể tải danh sách khóa học từ máy chủ.');
    } finally {
      setDangTai(false);
    }
  };

  const taiDuLieuChiTietKhoaHoc = async (courseId) => {
    try {
      const [materials, assignments] = await Promise.all([
        courseApi.layTaiLieuGiaSu(courseId),
        courseApi.layBaiTapGiaSu(courseId),
      ]);
      setTaiLieuList(Array.isArray(materials) ? materials : []);
      setBaiTapList(Array.isArray(assignments) ? assignments : []);
    } catch (err) {
      console.error('Lỗi tải chi tiết tài liệu/bài tập:', err);
    }
  };

  // 1. Tạo Khóa Học Mới
  const handleTaoKhoaHoc = async (e) => {
    e.preventDefault();
    setDangXuLy(true);
    setThongBaoLoi('');
    try {
      const payload = {
        title: formKhoaHoc.title.trim(),
        description: formKhoaHoc.description.trim(),
        price: Number(formKhoaHoc.price) || 0,
        enrollmentKey: formKhoaHoc.enrollmentKey.trim() || null,
      };

      const res = await courseApi.taoKhoaHocMoi(payload);
      setThongBaoThanhCong(`🎉 Đã tạo khóa học "${res.title}" thành công!`);
      setMoModalTaoKhoaHoc(false);
      setFormKhoaHoc({ title: '', description: '', price: 0, enrollmentKey: '' });
      await taiDanhSachKhoaHoc();
      setKhoaHocDangChon(res);
      setTimeout(() => setThongBaoThanhCong(''), 4000);
    } catch (err) {
      console.error('Lỗi tạo khóa học:', err);
      setThongBaoLoi(err.response?.data?.message || 'Không thể tạo khóa học. Vui lòng kiểm tra lại!');
    } finally {
      setDangXuLy(false);
    }
  };

  // 2. Upload Tài Liệu Mới
  const handleUpTaiLieu = async (e) => {
    e.preventDefault();
    if (!khoaHocDangChon?.id) return;
    setDangXuLy(true);
    setThongBaoLoi('');
    try {
      const payload = {
        title: formTaiLieu.title.trim(),
        fileUrl: formTaiLieu.fileUrl.trim() || 'https://example.com/tai-lieu-chuyen-de.pdf',
        lectureLink: formTaiLieu.lectureLink.trim() || null,
      };

      await courseApi.dangTaiLieuMoi(khoaHocDangChon.id, payload);
      setThongBaoThanhCong('🎉 Đã tải lên tài liệu bài giảng thành công!');
      setMoModalUpTaiLieu(false);
      setFormTaiLieu({ title: '', fileUrl: '', lectureLink: '' });
      await taiDuLieuChiTietKhoaHoc(khoaHocDangChon.id);
      setTimeout(() => setThongBaoThanhCong(''), 4000);
    } catch (err) {
      console.error('Lỗi up tài liệu:', err);
      setThongBaoLoi(err.response?.data?.message || 'Lỗi khi đăng tài liệu.');
    } finally {
      setDangXuLy(false);
    }
  };

  // 3. Giao Bài Tập Mới
  const handleGiaoBaiTap = async (e) => {
    e.preventDefault();
    if (!khoaHocDangChon?.id) return;
    setDangXuLy(true);
    setThongBaoLoi('');
    try {
      const payload = {
        title: formBaiTap.title.trim(),
        content: formBaiTap.content.trim(),
        dueAt: formBaiTap.dueAt ? new Date(formBaiTap.dueAt).toISOString() : null,
      };

      await courseApi.dangBaiTapMoi(khoaHocDangChon.id, payload);
      setThongBaoThanhCong('🎉 Đã giao bài tập mới cho học viên thành công!');
      setMoModalGiaoBaiTap(false);
      setFormBaiTap({ title: '', content: '', dueAt: '' });
      await taiDuLieuChiTietKhoaHoc(khoaHocDangChon.id);
      setTimeout(() => setThongBaoThanhCong(''), 4000);
    } catch (err) {
      console.error('Lỗi giao bài tập:', err);
      setThongBaoLoi(err.response?.data?.message || 'Lỗi khi giao bài tập.');
    } finally {
      setDangXuLy(false);
    }
  };

  // 4. Xóa Tài Liệu
  const handleXoaTaiLieu = async (materialId, tieuDe) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài liệu "${tieuDe}"?`)) return;
    try {
      await courseApi.xoaTaiLieu(materialId);
      await taiDuLieuChiTietKhoaHoc(khoaHocDangChon.id);
      setThongBaoThanhCong('Đã xóa tài liệu.');
      setTimeout(() => setThongBaoThanhCong(''), 3000);
    } catch (err) {
      alert('Không thể xóa tài liệu: ' + (err.response?.data?.message || err.message));
    }
  };

  // 5. Xóa Bài Tập
  const handleXoaBaiTap = async (assignmentId, tieuDe) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài tập "${tieuDe}"?`)) return;
    try {
      await courseApi.xoaBaiTap(assignmentId);
      await taiDuLieuChiTietKhoaHoc(khoaHocDangChon.id);
      setThongBaoThanhCong('Đã xóa bài tập.');
      setTimeout(() => setThongBaoThanhCong(''), 3000);
    } catch (err) {
      alert('Không thể xóa bài tập: ' + (err.response?.data?.message || err.message));
    }
  };

  // Kiểm tra quyền Gia sư
  const laGiaSu =
    nguoiDung?.role === 'ROLE_TUTOR' ||
    nguoiDung?.role === 'TUTOR' ||
    nguoiDung?.role === 'ROLE_ADMIN' ||
    nguoiDung?.role === 'ADMIN';

  if (!daDangNhap) {
    return (
      <div className="khung_chua_dang_nhap min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="hop_thong_bao bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-gray-100">
          <Lock className="w-12 h-12 text-primary/80 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Yêu Cầu Đăng Nhập</h2>
          <p className="text-sm text-gray-600 mb-6">
            Bạn cần đăng nhập bằng tài khoản Gia Sư để truy cập trang quản lý khóa học.
          </p>
          <Link
            to="/login"
            className="nut_dang_nhap_ngay inline-block bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow"
          >
            Đăng Nhập Ngay
          </Link>
        </div>
      </div>
    );
  }

  if (!laGiaSu) {
    return (
      <div className="khung_sai_vai_tro min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="hop_thong_bao bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-gray-100">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chỉ Dành Cho Gia Sư</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tài khoản hiện tại của bạn là <strong>{nguoiDung?.fullName}</strong> (Vai trò: {nguoiDung?.role}).
            Trang này chỉ mở cho tài khoản có vai trò <strong>Gia Sư (TUTOR)</strong>.
          </p>
          <div className="bg-orange-50 p-3 rounded-xl text-xs text-orange-800 text-left mb-6 border border-orange-200">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Đăng nhập tài khoản Gia Sư mẫu:</span>
            </p>
            <p>• SĐT: <strong>0988888888</strong></p>
            <p>• Mật khẩu: <strong>123456</strong></p>
          </div>
          <Link
            to="/login"
            className="nut_chuyen_tai_khoan inline-block bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow"
          >
            Đổi Sang Tài Khoản Gia Sư
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="khung_quan_ly_khoa_hoc_gia_su bg-gray-50 min-h-screen py-8 text-gray-800">
      <div className="khung_chua_noi_dung max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* THANH TIÊU ĐỀ TRANG */}
        <div className="hang_tieu_de_trang flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="the_phan_loai text-xs font-bold text-primary tracking-wider uppercase bg-orange-100 inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Khu Vực Giảng Viên</span>
            </div>
            <h1 className="tieu_de_chinh text-2xl sm:text-3xl font-black text-gray-900">
              Quản Lý Khóa Học & Học Liệu Của Gia Sư
            </h1>
            <p className="phu_de text-xs sm:text-sm text-gray-500 mt-1">
              Gia sư: <span className="font-bold text-gray-800">{nguoiDung?.fullName}</span> • Tạo khóa học, đặt mật khẩu bảo vệ, upload tài liệu & giao bài tập
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMoModalTaoKhoaHoc(true)}
            className="nut_mo_modal_tao_khoa_hoc bg-primary hover:bg-primary-dark text-white font-bold px-5 py-3 rounded-2xl transition shadow flex items-center gap-2 shrink-0 self-start md:self-auto text-sm"
          >
            <Plus className="w-4 h-4 font-black" />
            <span>Tạo Khóa Học Mới</span>
          </button>
        </div>

        {/* THÔNG BÁO THÀNH CÔNG / LỖI */}
        {thongBaoThanhCong && (
          <div className="hop_thong_bao_thanh_cong bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm p-4 rounded-2xl mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{thongBaoThanhCong}</span>
            </div>
            <button onClick={() => setThongBaoThanhCong('')} className="text-green-700 hover:text-green-900 font-bold p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {thongBaoLoi && (
          <div className="hop_thong_bao_loi bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm p-4 rounded-2xl mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{thongBaoLoi}</span>
            </div>
            <button onClick={() => setThongBaoLoi('')} className="text-red-700 hover:text-red-900 font-bold p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* LAYOUT CHÍNH: 2 CỘT */}
        <div className="luoi_hai_cot grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: DANH SÁCH KHÓA HỌC CỦA GIA SƯ */}
          <div className="cot_danh_sach_khoa_hoc lg:col-span-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                Khóa học của bạn ({danhSachKhoaHoc.length})
              </h2>
              <button
                type="button"
                onClick={taiDanhSachKhoaHoc}
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </div>

            {dangTai ? (
              <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Đang tải khóa học...</span>
              </div>
            ) : danhSachKhoaHoc.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-500">
                <BookOpen className="w-10 h-10 mb-2 text-gray-300 mx-auto" />
                <p>Bạn chưa tạo khóa học nào.</p>
                <button
                  type="button"
                  onClick={() => setMoModalTaoKhoaHoc(true)}
                  className="mt-3 text-primary font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Bấm vào đây để tạo khóa đầu tiên</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="danh_sach_the_khoa_hoc space-y-3 max-h-[680px] overflow-y-auto pr-1">
                {danhSachKhoaHoc.map((kh) => {
                  const dangChon = khoaHocDangChon?.id === kh.id;
                  return (
                    <div
                      key={kh.id}
                      onClick={() => setKhoaHocDangChon(kh)}
                      className={`the_khoa_hoc_item p-4 rounded-2xl cursor-pointer transition border text-left ${
                        dangChon
                          ? 'border-primary bg-orange-50/60 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="ma_mon_hoc text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          {kh.courseCode || 'KHÓA HỌC'}
                        </span>
                        {kh.hasEnrollmentKey ? (
                          <span className="the_bao_mat text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>Có Mật Khẩu</span>
                          </span>
                        ) : (
                          <span className="the_cong_khai text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Globe className="w-3 h-3 text-green-700" />
                            <span>Công Khai</span>
                          </span>
                        )}
                      </div>

                      <h3 className="ten_khoa_hoc font-bold text-sm text-gray-900 leading-snug line-clamp-2">
                        {kh.title}
                      </h3>

                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="gia_khoa_hoc font-semibold text-primary">
                          {Number(kh.price) > 0
                            ? `${Number(kh.price).toLocaleString('vi-VN')} đ`
                            : 'Miễn phí'}
                        </span>
                        <span className="ngay_tao text-[11px]">
                          {kh.createdAt ? new Date(kh.createdAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: KHÔNG GIAN QUẢN TRỊ CHI TIẾT CỦA KHÓA HỌC ĐƯỢC CHỌN */}
          <div className="cot_quan_tri_chi_tiet lg:col-span-8 space-y-6">
            {khoaHocDangChon ? (
              <>
                {/* 1. KHỐI THÔNG TIN KHÓA HỌC ĐANG CHỌN */}
                <div className="khoi_thong_tin_khoa_hoc bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="ma_mon bg-orange-100 text-primary font-black text-xs px-2.5 py-1 rounded-md uppercase">
                          {khoaHocDangChon.courseCode || 'KHÓA HỌC'}
                        </span>
                        {khoaHocDangChon.hasEnrollmentKey ? (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-200">
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Khóa học yêu cầu Mật khẩu ghi danh</span>
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-200">
                            <Globe className="w-3.5 h-3.5 text-green-700" />
                            <span>Khóa học Công khai</span>
                          </span>
                        )}
                      </div>
                      <h2 className="tieu_de_khoa_hoc_dang_chon text-xl sm:text-2xl font-black text-gray-900">
                        {khoaHocDangChon.title}
                      </h2>
                      <p className="mo_ta text-xs sm:text-sm text-gray-600 mt-1">
                        {khoaHocDangChon.description || 'Chưa có mô tả chi tiết.'}
                      </p>
                    </div>

                    <div className="cum_nut_xem_khoa shrink-0 flex sm:flex-col gap-2">
                      <Link
                        to={`/courses/${khoaHocDangChon.id}`}
                        className="nut_vao_khoa_hoc_lms text-center bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <School className="w-4 h-4" />
                        <span>Vào Giao Diện Khóa Học (LMS)</span>
                      </Link>
                    </div>
                  </div>

                  <div className="luoi_chi_tiet_phu grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
                    <div className="o_thong_tin bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-gray-500 font-medium">Học phí</div>
                      <div className="font-extrabold text-sm text-primary mt-0.5">
                        {Number(khoaHocDangChon.price) > 0
                          ? `${Number(khoaHocDangChon.price).toLocaleString('vi-VN')} đ`
                          : 'Miễn phí'}
                      </div>
                    </div>
                    <div className="o_thong_tin bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-gray-500 font-medium">Bảo vệ ghi danh</div>
                      <div className="font-extrabold text-sm mt-0.5">
                        {khoaHocDangChon.hasEnrollmentKey ? (
                          <span className="flex items-center gap-1 text-amber-700">
                            <KeyRound className="w-3.5 h-3.5" /> Đã bật mật khẩu
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Unlock className="w-3.5 h-3.5" /> Không đặt mật khẩu
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="o_thong_tin bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                      <div className="text-gray-500 font-medium">ID Khóa học</div>
                      <div className="font-mono text-[11px] text-gray-700 truncate mt-0.5">
                        {khoaHocDangChon.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. KHỐI TÀI LIỆU & BÀI GIẢNG */}
                <div className="khoi_quan_ly_tai_lieu bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200">
                  <div className="hang_tieu_de_tai_lieu flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Tài Liệu & Bài Giảng ({taiLieuList.length})</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Học viên chỉ tải được file sau khi đã nhập đúng mật khẩu ghi danh.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMoModalUpTaiLieu(true)}
                      className="nut_them_tai_lieu_moi bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tải Lên Tài Liệu</span>
                    </button>
                  </div>

                  {taiLieuList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-500 italic bg-gray-50 rounded-2xl">
                      Chưa có tài liệu nào trong khóa học này. Hãy bấm "Tải Lên Tài Liệu" để thêm mới!
                    </div>
                  ) : (
                    <div className="danh_sach_tai_lieu space-y-3">
                      {taiLieuList.map((tl) => (
                        <div
                          key={tl.id}
                          className="item_tai_lieu flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white transition"
                        >
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 truncate">{tl.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                              {tl.fileUrl && (
                                <a
                                  href={tl.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                  <span>Tải file học liệu</span>
                                </a>
                              )}
                              {tl.lectureLink && (
                                <a
                                  href={tl.lectureLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-purple-600 hover:underline flex items-center gap-1 font-medium"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Video bài giảng</span>
                                </a>
                              )}
                              <span className="text-[11px] text-gray-400">
                                {tl.createdAt ? new Date(tl.createdAt).toLocaleDateString('vi-VN') : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleXoaTaiLieu(tl.id, tl.title)}
                              className="nut_xoa_tai_lieu text-xs text-red-600 hover:bg-red-50 p-2 rounded-lg font-semibold transition flex items-center gap-1"
                              title="Xóa tài liệu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. KHỐI BÀI TẬP VỀ NHÀ */}
                <div className="khoi_quan_ly_bai_tap bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200">
                  <div className="hang_tieu_de_bai_tap flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-emerald-600" />
                        <span>Bài Tập Về Nhà ({baiTapList.length})</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Giao bài tập thực chiến, đặt hạn nộp và theo dõi bài làm của học viên.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMoModalGiaoBaiTap(true)}
                      className="nut_them_bai_tap_moi bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Giao Bài Tập Mới</span>
                    </button>
                  </div>

                  {baiTapList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-500 italic bg-gray-50 rounded-2xl">
                      Chưa có bài tập nào trong khóa học này. Hãy bấm "Giao Bài Tập Mới" để thêm!
                    </div>
                  ) : (
                    <div className="danh_sach_bai_tap space-y-3">
                      {baiTapList.map((bt) => (
                        <div
                          key={bt.id}
                          className="item_bai_tap flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white transition"
                        >
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-gray-900">{bt.title}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{bt.content}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                              {bt.dueAt ? (
                                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200 text-[11px] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Hạn nộp: {new Date(bt.dueAt).toLocaleString('vi-VN')}</span>
                                </span>
                              ) : (
                                <span className="text-gray-500 text-[11px]">Không giới hạn thời gian</span>
                              )}
                              <span className="text-[11px] text-gray-400">
                                Tạo ngày: {bt.createdAt ? new Date(bt.createdAt).toLocaleDateString('vi-VN') : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleXoaBaiTap(bt.id, bt.title)}
                              className="nut_xoa_bai_tap text-xs text-red-600 hover:bg-red-50 p-2 rounded-lg font-semibold transition flex items-center gap-1"
                              title="Xóa bài tập"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-200">
                <School className="w-12 h-12 mb-3 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">Chọn một khóa học từ danh sách</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Hoặc tạo khóa học mới để bắt đầu tải lên tài liệu và giao bài tập.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: TẠO KHÓA HỌC MỚI (CÓ MẬT KHẨU GHI DANH) */}
      {/* ========================================================= */}
      {moModalTaoKhoaHoc && (
        <div className="modal_nen_den_bao_ve fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hop_modal_tao_khoa_hoc bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">Tạo Khóa Học Mới</h3>
                <p className="text-xs text-gray-500">Khóa học sẽ được kích hoạt ngay sau khi tạo thành công</p>
              </div>
              <button
                type="button"
                onClick={() => setMoModalTaoKhoaHoc(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTaoKhoaHoc} className="khoi_cac_o_nhap space-y-4">
              <div className="o_nhap_ten_khoa_hoc">
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Tên Khóa Học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: [TOAN-VIP] Khóa Luyện Thi Chuyên Toán 2026"
                  value={formKhoaHoc.title}
                  onChange={(e) => setFormKhoaHoc({ ...formKhoaHoc, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="o_nhap_mo_ta_khoa_hoc">
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Mô Tả Chi Tiết Khóa Học
                </label>
                <textarea
                  rows="3"
                  placeholder="Mô tả lộ trình học, mục tiêu đạt được, đối tượng học sinh..."
                  value={formKhoaHoc.description}
                  onChange={(e) => setFormKhoaHoc({ ...formKhoaHoc, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="o_nhap_gia_khoa_hoc">
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Học Phí (VNĐ) <span className="text-gray-400 font-normal">(Nhập 0 nếu miễn phí)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="0"
                  value={formKhoaHoc.price}
                  onChange={(e) => setFormKhoaHoc({ ...formKhoaHoc, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              {/* Ô NHẬP MẬT KHẨU GHI DANH - ĐIỂM NHẤN QUAN TRỌNG THEO YÊU CẦU */}
              <div className="o_nhap_mat_khau_ghi_danh bg-orange-50/70 p-4 rounded-2xl border border-orange-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <label className="text-xs font-black text-orange-950">
                    Mật Khẩu Khóa Học (Enrollment Key)
                  </label>
                </div>
                <p className="text-[11px] text-orange-800 mb-2 leading-relaxed">
                  Nếu bạn nhập mật khẩu ở đây, <strong>chỉ học sinh biết đúng mật khẩu mới có thể tham gia</strong> và xem tài liệu & bài tập của khóa học này! Để trống nếu muốn mở công khai.
                </p>
                <input
                  type="text"
                  placeholder="VD: VIP2026 hoặc MATH123 (để trống nếu công khai)"
                  value={formKhoaHoc.enrollmentKey}
                  onChange={(e) => setFormKhoaHoc({ ...formKhoaHoc, enrollmentKey: e.target.value })}
                  className="w-full border border-orange-300 bg-white rounded-xl p-2.5 text-xs font-mono font-bold text-orange-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMoModalTaoKhoaHoc(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangXuLy}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition shadow disabled:opacity-50"
                >
                  {dangXuLy ? 'Đang Tạo Khóa Học...' : 'Hoàn Tất Tạo Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: TẢI LÊN TÀI LIỆU / BÀI GIẢNG */}
      {/* ========================================================= */}
      {moModalUpTaiLieu && (
        <div className="modal_nen_den_bao_ve fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hop_modal_up_tai_lieu bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">Tải Lên Tài Liệu Bài Giảng</h3>
                <p className="text-xs text-gray-500">Khóa học: {khoaHocDangChon?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setMoModalUpTaiLieu(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpTaiLieu} className="khoi_cac_o_nhap space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Tiêu Đề Tài Liệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chuyên đề 01: Đại số & Hàm số nâng cao (PDF)"
                  value={formTaiLieu.title}
                  onChange={(e) => setFormTaiLieu({ ...formTaiLieu, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Đường Dẫn File Tài Liệu (PDF / Docs / Drive)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/tai-lieu-chuyen-de-01.pdf"
                  value={formTaiLieu.fileUrl}
                  onChange={(e) => setFormTaiLieu({ ...formTaiLieu, fileUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Link Video Bài Giảng Trực Tuyến (Youtube / Zoom / Drive)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... (tùy chọn)"
                  value={formTaiLieu.lectureLink}
                  onChange={(e) => setFormTaiLieu({ ...formTaiLieu, lectureLink: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMoModalUpTaiLieu(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangXuLy}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow disabled:opacity-50"
                >
                  {dangXuLy ? 'Đang Đăng Tài Liệu...' : 'Lưu Tài Liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: GIAO BÀI TẬP VỀ NHÀ MỚI */}
      {/* ========================================================= */}
      {moModalGiaoBaiTap && (
        <div className="modal_nen_den_bao_ve fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hop_modal_giao_bai_tap bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">Giao Bài Tập Về Nhà Mới</h3>
                <p className="text-xs text-gray-500">Khóa học: {khoaHocDangChon?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setMoModalGiaoBaiTap(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGiaoBaiTap} className="khoi_cac_o_nhap space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Tiêu Đề Bài Tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bài tập tự luyện buổi 1 - Phương trình vô tỷ"
                  value={formBaiTap.title}
                  onChange={(e) => setFormBaiTap({ ...formBaiTap, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Yêu Cầu / Nội Dung Bài Tập
                </label>
                <textarea
                  rows="3"
                  placeholder="Yêu cầu học sinh làm các bài 1 đến bài 5 trong tài liệu đính kèm..."
                  value={formBaiTap.content}
                  onChange={(e) => setFormBaiTap({ ...formBaiTap, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Hạn Chót Nộp Bài
                </label>
                <input
                  type="datetime-local"
                  value={formBaiTap.dueAt}
                  onChange={(e) => setFormBaiTap({ ...formBaiTap, dueAt: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMoModalGiaoBaiTap(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangXuLy}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow disabled:opacity-50"
                >
                  {dangXuLy ? 'Đang Giao Bài Tập...' : 'Giao Bài Tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
