import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Sparkles,
  Eye,
  X,
  Info,
  Loader2,
  Inbox,
  CheckCircle2,
  Clock,
  Phone,
  Coins,
  Check,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { marketApi } from '../api/marketApi';
import { useAuth } from '../../../context/AuthContext';

/**
 * ====================================================================
 * COMPONENT: MODAL DANH SÁCH GIA SƯ ỨNG TUYỂN (ApplicantsModal.jsx)
 * CHỈ TÁC GIẢ BÀI ĐĂNG (hoặc ADMIN) MỚI CÓ QUYỀN DUYỆT GIA SƯ NHẬN LỚP.
 * ====================================================================
 */
export default function ApplicantsModal({ post, isOpen, onClose, onApplicationAccepted }) {
  const { nguoiDung, daDangNhap } = useAuth();
  const [danhSachUngTuyen, setDanhSachUngTuyen] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangXuLyId, setDangXuLyId] = useState(null);
  const [thongBao, setThongBao] = useState('');

  // Xác định người dùng có phải là CHỦ BÀI ĐĂNG (Tác giả) hay không
  const laChuBaiViet =
    daDangNhap &&
    ((post?.authorId && nguoiDung?.id && String(post.authorId).toLowerCase() === String(nguoiDung.id).toLowerCase()) ||
      (post?.authorName && nguoiDung?.fullName && post.authorName.trim().toLowerCase() === nguoiDung.fullName.trim().toLowerCase()) ||
      nguoiDung?.role === 'ROLE_ADMIN' ||
      nguoiDung?.role === 'ADMIN');

  useEffect(() => {
    if (isOpen && post?.id) {
      taiDanhSach();
    }
  }, [isOpen, post?.id]);

  const taiDanhSach = async () => {
    setDangTai(true);
    try {
      const res = await marketApi.layDanhSachUngTuyen(post.id);
      setDanhSachUngTuyen(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách ứng tuyển:', err);
      setDanhSachUngTuyen([]);
    } finally {
      setDangTai(false);
    }
  };

  const handleChonGiaSu = async (appId, tutorName) => {
    if (!laChuBaiViet) {
      alert('Bạn không phải là người đăng bài viết này nên không có quyền duyệt gia sư!');
      return;
    }

    if (!window.confirm(`Xác nhận đồng ý chọn Gia sư ${tutorName} nhận lớp này? Trạng thái bài đăng sẽ chuyển sang "Đã Ghép Lớp".`)) {
      return;
    }

    setDangXuLyId(appId);
    try {
      await marketApi.capNhatTrangThaiDon(appId, 'ACCEPTED');
      setThongBao(`Đã chọn Gia sư ${tutorName} thành công! Lớp học đã được ghép.`);
      await taiDanhSach();
      if (onApplicationAccepted) {
        onApplicationAccepted();
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể cập nhật trạng thái lúc này.'));
    } finally {
      setDangXuLyId(null);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-black text-lg">Danh Sách Gia Sư Ứng Tuyển</h3>
              <div className="text-xs text-gray-300 flex items-center gap-2 flex-wrap mt-0.5">
                <span>Lớp: <strong className="text-orange-400">{post.subject || 'Lớp Gia Sư'}</strong> ({danhSachUngTuyen.length} hồ sơ)</span>
                {laChuBaiViet ? (
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Bạn là chủ bài đăng
                  </span>
                ) : (
                  <span className="bg-slate-700 text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Chế độ xem thông tin
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THÔNG BÁO THÀNH CÔNG */}
        {thongBao && (
          <div className="bg-green-50 border-b border-green-200 text-green-800 text-xs px-6 py-3 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{thongBao}</span>
            </div>
            <button onClick={() => setThongBao('')} className="text-green-700 font-bold p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* THÔNG BÁO QUYỀN DUYỆT DÀNH CHO NGƯỜI KHÔNG PHẢI CHỦ BÀI */}
        {!laChuBaiViet && (
          <div className="bg-blue-50/80 border-b border-blue-100 text-blue-800 text-[11px] px-6 py-2.5 font-medium flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-600" />
            <span>Chỉ tài khoản đăng bài tuyển gia sư này mới có thẩm quyền bấm <strong>Duyệt & Chọn Gia Sư</strong>.</span>
          </div>
        )}

        {/* NỘI DUNG DANH SÁCH */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {dangTai ? (
            <div className="text-center py-12 text-xs text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              Đang tải danh sách hồ sơ gia sư...
            </div>
          ) : danhSachUngTuyen.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border text-xs text-gray-500">
              <Inbox className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              Chưa có gia sư nào nộp hồ sơ ứng tuyển vào lớp này.
              <p className="mt-1 text-gray-400">Các gia sư sẽ sớm nhìn thấy bài đăng và gửi thông tin liên hệ cho bạn.</p>
            </div>
          ) : (
            danhSachUngTuyen.map((app) => {
              const laDuocChon = app.status === 'ACCEPTED';
              const avatar =
                app.tutorAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(app.tutorName)}&background=f97316&color=fff&bold=true`;

              return (
                <div
                  key={app.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    laDuocChon
                      ? 'bg-green-50/80 border-green-300 ring-2 ring-green-200'
                      : 'bg-white border-gray-200 hover:border-orange-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={avatar}
                        alt={app.tutorName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-gray-900">{app.tutorName}</h4>
                          {laDuocChon ? (
                            <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> ĐÃ ĐƯỢC CHỌN NHẬN LỚP
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" /> Đang Chờ Duyệt
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" /> SĐT/Zalo: <strong className="text-gray-800">{app.phoneContact}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-500" /> Mức phí đề xuất: <strong className="text-primary font-bold">{app.expectedRate}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CÁC NÚT THAO TÁC */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {/* Xem profile chi tiết của gia sư */}
                      <Link
                        to={`/tutor-profile?id=${app.tutorId || app.tutor?.id || ''}`}
                        state={{ tutorInfo: app }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                        title="Xem toàn bộ hồ sơ kinh nghiệm và bằng cấp của gia sư này"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Profile</span>
                      </Link>

                      {/* Nút Duyệt / Chọn Gia Sư: CHỈ HIỆN KHI NGƯỜI ĐĂNG NHẬP LÀ CHỦ BÀI ĐĂNG */}
                      {laChuBaiViet ? (
                        !laDuocChon && post.status !== 'MATCHED' && (
                          <button
                            type="button"
                            onClick={() => handleChonGiaSu(app.id, app.tutorName)}
                            disabled={dangXuLyId === app.id}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {dangXuLyId === app.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Chọn Gia Sư Này</span>
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium italic bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Quyền duyệt của tác giả
                        </span>
                      )}
                    </div>
                  </div>

                  {/* LỜI NHẮN */}
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-700 leading-relaxed bg-gray-50/70 p-3 rounded-xl">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5 mb-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      <span>Thư giới thiệu / Phương pháp giảng dạy:</span>
                    </span>
                    <p className="whitespace-pre-line">{app.introduction}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-5 py-2 rounded-xl text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
