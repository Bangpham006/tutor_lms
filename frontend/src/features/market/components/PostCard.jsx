import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookOpen,
  GraduationCap,
  MapPin,
  Clock,
  Coins,
  Send,
  CheckCircle2,
  ClipboardList,
  Inbox,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { marketApi } from '../api/marketApi';
import ApplyModal from './ApplyModal';
import ApplicantsModal from './ApplicantsModal';

/**
 * ====================================================================
 * COMPONENT: THẺ BÀI ĐĂNG CHỢ GHÉP LỚP (PostCard.jsx)
 * Tích hợp toàn diện:
 *   1. Thích bài viết lưu vào Database.
 *   2. Bình luận realtime: Gõ nội dung, nhấn Enter / Gửi, render ngay lập tức.
 *   3. Ứng tuyển nhận lớp: Dành cho Gia sư, lưu hồ sơ ứng tuyển vào Database.
 *   4. Quản lý ứng viên: Dành cho Chủ bài đăng xem và duyệt chọn gia sư.
 * ====================================================================
 */
export default function PostCard({ post, onPostUpdated }) {
  const navigate = useNavigate();
  const { nguoiDung, daDangNhap } = useAuth();

  // Trạng thái Like
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(Boolean(post.hasLiked));
  const [likedUserNames, setLikedUserNames] = useState(post.likedUserNames || []);

  // Trạng thái Bình luận
  const [moBinhLuan, setMoBinhLuan] = useState(false);
  const [danhSachBinhLuan, setDanhSachBinhLuan] = useState([]);
  const [dangTaiBinhLuan, setDangTaiBinhLuan] = useState(false);
  const [noiDungBinhLuan, setNoiDungBinhLuan] = useState('');
  const [dangGuiBinhLuan, setDangGuiBinhLuan] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  // Trạng thái Ứng tuyển
  const [moModalUngTuyen, setMoModalUngTuyen] = useState(false);
  const [moModalDanhSachUngTuyen, setMoModalDanhSachUngTuyen] = useState(false);
  const [daUngTuyen, setDaUngTuyen] = useState(false);
  const [applicationsCount, setApplicationsCount] = useState(post.applicationsCount || 0);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');

  // Đồng bộ khi post prop thay đổi (load lại trang hoặc refetch)
  useEffect(() => {
    setLikes(post.likesCount || 0);
    setHasLiked(Boolean(post.hasLiked));
    setLikedUserNames(post.likedUserNames || []);
    setCommentsCount(post.commentsCount || 0);
    setApplicationsCount(post.applicationsCount || 0);
  }, [post]);

  const laGiaSu = nguoiDung?.role === 'ROLE_TUTOR' || nguoiDung?.role === 'TUTOR';
  const laChuBaiViet =
    daDangNhap &&
    ((post.authorId && String(post.authorId) === String(nguoiDung?.id)) ||
      (post.authorName && post.authorName.toLowerCase() === (nguoiDung?.fullName || '').toLowerCase()));

  // Avatar tác giả bài viết
  const authorAvatar =
    post.authorAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'User')}&background=f97316&color=fff&bold=true`;

  // Avatar người đang đăng nhập
  const myAvatar =
    nguoiDung?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(nguoiDung?.fullName || 'User')}&background=0284c7&color=fff&bold=true`;

  // =========================================================
  // XỬ LÝ THÍCH BÀI VIẾT
  // =========================================================
  const handleLike = async () => {
    if (!daDangNhap) {
      alert('Vui lòng đăng nhập để tương tác thích bài viết!');
      navigate('/login');
      return;
    }

    const nextHasLiked = !hasLiked;
    const nextLikes = nextHasLiked ? likes + 1 : Math.max(0, likes - 1);
    setHasLiked(nextHasLiked);
    setLikes(nextLikes);

    try {
      const res = await marketApi.thichBaiDang(post.id);
      if (res) {
        if (res.likesCount !== undefined) setLikes(res.likesCount);
        if (res.hasLiked !== undefined) setHasLiked(Boolean(res.hasLiked));
        if (res.likedUserNames) setLikedUserNames(res.likedUserNames);
      }
    } catch (err) {
      console.warn('Lỗi lưu like bài viết:', err);
      setHasLiked(hasLiked);
      setLikes(likes);
    }
  };

  // =========================================================
  // XỬ LÝ MỞ / ĐÓNG BÌNH LUẬN & TẢI BÌNH LUẬN TỪ DATABASE
  // =========================================================
  const toggleBinhLuan = async () => {
    const trangThaiMoi = !moBinhLuan;
    setMoBinhLuan(trangThaiMoi);

    if (trangThaiMoi && danhSachBinhLuan.length === 0) {
      setDangTaiBinhLuan(true);
      try {
        const res = await marketApi.layBinhLuan(post.id);
        setDanhSachBinhLuan(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Lỗi lấy bình luận:', err);
      } finally {
        setDangTaiBinhLuan(false);
      }
    }
  };

  // Gửi bình luận mới
  const handleGuiBinhLuan = async (e) => {
    e.preventDefault();
    if (!noiDungBinhLuan.trim()) return;

    if (!daDangNhap) {
      alert('Vui lòng đăng nhập để tham gia bình luận trên Chợ ghép lớp!');
      navigate('/login');
      return;
    }

    setDangGuiBinhLuan(true);
    try {
      const payload = {
        content: noiDungBinhLuan.trim(),
        authorName: nguoiDung?.fullName || 'Người dùng',
        authorAvatar: myAvatar,
        authorRole: nguoiDung?.role || 'ROLE_STUDENT',
      };

      const cmtMoi = await marketApi.guiBinhLuan(post.id, payload);

      setDanhSachBinhLuan((prev) => [...prev, cmtMoi]);
      setCommentsCount((prev) => prev + 1);
      setNoiDungBinhLuan('');
    } catch (err) {
      alert('❌ Lỗi gửi bình luận: ' + (err.response?.data?.message || 'Không thể gửi bình luận lúc này.'));
    } finally {
      setDangGuiBinhLuan(false);
    }
  };

  // =========================================================
  // XỬ LÝ ỨNG TUYỂN NHẬN LỚP
  // =========================================================
  const handleClickUngTuyen = () => {
    if (!daDangNhap) {
      alert('Chức năng này dành cho tài khoản Gia Sư. Vui lòng đăng nhập để gửi hồ sơ nhận lớp!');
      navigate('/login');
      return;
    }

    if (!laGiaSu) {
      alert('⚠️ Bạn đang đăng nhập bằng tài khoản Học Viên / Phụ Huynh. Vui lòng sử dụng tài khoản Gia Sư (VD: Thầy Hoàng Nam) để ứng tuyển nhận lớp!');
      return;
    }

    setMoModalUngTuyen(true);
  };

  const handleApplySuccess = async (appData) => {
    await marketApi.ungTuyenNhanLop(post.id, appData);
    setDaUngTuyen(true);
    setApplicationsCount((prev) => prev + 1);
    setThongBaoThanhCong('🎉 Hồ sơ ứng tuyển của bạn đã được gửi tới phụ huynh thành công!');
    setTimeout(() => setThongBaoThanhCong(''), 5000);
    if (onPostUpdated) onPostUpdated();
  };

  const handleApplicationAccepted = () => {
    if (onPostUpdated) onPostUpdated();
  };

  const daGhepLop = post.status === 'MATCHED';

  return (
    <article className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all duration-300 hover:shadow-md">
      {/* THÔNG BÁO TOAST THÀNH CÔNG */}
      {thongBaoThanhCong && (
        <div className="bg-green-50 border-b border-green-200 text-green-800 text-xs px-5 py-3 font-semibold flex items-center justify-between animate-fade-in">
          <span>{thongBaoThanhCong}</span>
          <button onClick={() => setThongBaoThanhCong('')} className="text-green-700 font-bold">✕</button>
        </div>
      )}

      {/* --- PHẦN HEADER BÀI VIẾT: Tác giả, Thời gian, Huy hiệu --- */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <img
            src={authorAvatar}
            alt={post.authorName}
            className="w-12 h-12 rounded-full border border-gray-200 object-cover shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-gray-900 text-sm hover:text-primary transition cursor-pointer">
                {post.authorName}
              </h4>
              {laChuBaiViet && (
                <span className="bg-orange-100 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                  Bạn
                </span>
              )}
            </div>

            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-1.5 mt-0.5">
              <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Mới đăng'}</span>
              <span>•</span>

              {post.badgeType === 'TUYEN_GIA_SU' && (
                <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3" /> TUYỂN GIA SƯ
                </span>
              )}
              {post.badgeType === 'TIM_LOP' && (
                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> TÌM LỚP HỌC
                </span>
              )}
              {post.badgeType === 'CHIA_SE_KIEN_THUC' && (
                <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> CHIA SẺ TRI THỨC
                </span>
              )}

              {/* Huy hiệu trạng thái Ghép lớp */}
              {daGhepLop ? (
                <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3" /> ĐÃ GHÉP LỚP
                </span>
              ) : post.badgeType === 'TUYEN_GIA_SU' && (
                <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Đang tìm gia sư
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nút chia sẻ */}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(`${window.location.origin}/market#post-${post.id}`);
            alert(`Đã sao chép liên kết bài đăng!`);
          }}
          className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          title="Chia sẻ liên kết bài đăng"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* --- PHẦN THÂN BÀI VIẾT: Nội dung, Yêu cầu, Media --- */}
      <div className="p-5 pt-1">
        <p className="text-gray-800 text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-line">
          {post.content}
        </p>

        {/* BẢNG CHI TIẾT YÊU CẦU NẾU LÀ TIN TUYỂN GIA SƯ */}
        {(post.subject || post.location || post.fee || post.schedule) && (
          <div className="bg-gradient-to-br from-orange-50/70 to-amber-50/50 rounded-2xl p-4 border border-orange-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs text-gray-700">
            {post.subject && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <span className="text-gray-500 font-medium">Môn học: </span>
                  <span className="font-extrabold text-gray-900">{post.subject}</span>
                </div>
              </div>
            )}

            {post.gradeLevel && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-gray-500 font-medium">Khối lớp: </span>
                  <span className="font-extrabold text-gray-900">{post.gradeLevel}</span>
                </div>
              </div>
            )}

            {post.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-gray-500 font-medium">Khu vực: </span>
                  <span className="font-bold text-gray-800">{post.location}</span>
                </div>
              </div>
            )}

            {post.schedule && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-gray-500 font-medium">Lịch học: </span>
                  <span className="font-bold text-gray-800">{post.schedule}</span>
                </div>
              </div>
            )}

            {post.fee && (
              <div className="flex items-center gap-2 sm:col-span-2 pt-1 border-t border-orange-100">
                <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-gray-500 font-medium">Học phí: </span>
                  <span className="font-black text-primary text-sm">{post.fee}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Media (Ảnh minh họa nếu có) */}
        {post.mediaUrl && (
          <div className="rounded-2xl overflow-hidden relative bg-gray-900 my-4 max-h-[360px] flex items-center justify-center shadow-inner">
            <img
              src={post.mediaUrl}
              alt="Hình ảnh bài đăng"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* --- CỤM NÚT ỨNG TUYỂN DÀNH CHO GIA SƯ HOẶC CHỦ BÀI ĐĂNG --- */}
        {(post.badgeType === 'TUYEN_GIA_SU' || post.badgeType === 'TIM_LOP') && (
          <div className="mt-4 pt-2 flex flex-col sm:flex-row gap-2.5">
            {laChuBaiViet ? (
              // Nút dành cho Chủ bài viết: Quản lý danh sách ứng viên
              <button
                type="button"
                onClick={() => setMoModalDanhSachUngTuyen(true)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-4 rounded-2xl transition shadow flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-orange-400" />
                <span>Xem Danh Sách Gia Sư Ứng Tuyển ({applicationsCount})</span>
              </button>
            ) : daGhepLop ? (
              // Lớp đã được ghép xong
              <div className="flex-1 bg-emerald-100 text-emerald-800 font-bold py-2.5 px-4 rounded-2xl text-xs text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lớp học này đã tìm được gia sư thành công!</span>
              </div>
            ) : daUngTuyen ? (
              // Đã gửi đơn ứng tuyển
              <button
                type="button"
                disabled
                className="flex-1 bg-amber-100 text-amber-800 font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs cursor-not-allowed"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Đã Gửi Hồ Sơ Ứng Tuyển (Đang Chờ Duyệt)</span>
              </button>
            ) : (
              // Nút ứng tuyển cho Gia sư
              <button
                type="button"
                onClick={handleClickUngTuyen}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-black py-2.5 px-4 rounded-2xl transition-all shadow flex items-center justify-center gap-2 text-xs hover:-translate-y-0.5 cursor-pointer"
              >
                <Inbox className="w-4 h-4" />
                <span>Ứng Tuyển Nhận Lớp Này</span>
                {applicationsCount > 0 && (
                  <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {applicationsCount} đã nộp
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                alert('⭐ Đã lưu bài viết vào danh sách quan tâm!');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-2xl transition font-bold text-xs flex items-center justify-center gap-1.5 shrink-0"
              title="Lưu tin để xem lại"
            >
              <span>⭐</span>
              <span>Lưu tin</span>
            </button>
          </div>
        )}
      </div>

      {/* HIỂN THỊ DANH SÁCH NGƯỜI ĐÃ THÍCH (TỪ TÀI KHOẢN THẬT TRONG DATABASE) */}
      {likes > 0 && (
        <div className="px-5 py-2 text-[11px] text-gray-500 border-t border-gray-100/60 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-xs">
              ❤️
            </span>
            <span>
              {likedUserNames && likedUserNames.length > 0 ? (
                <>
                  <strong className="text-gray-700 font-semibold">{likedUserNames[0]}</strong>
                  {likedUserNames.length > 1 && (
                    <>
                      {', '}
                      <strong className="text-gray-700 font-semibold">{likedUserNames[1]}</strong>
                    </>
                  )}
                  {likes > (likedUserNames.length > 1 ? 2 : 1) && (
                    <span> và {likes - (likedUserNames.length > 1 ? 2 : 1)} người khác</span>
                  )}
                </>
              ) : (
                <span>{likes} lượt thích</span>
              )}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            {commentsCount} bình luận
          </span>
        </div>
      )}

      {/* --- FOOTER BÀI VIẾT: Like, Bình luận, Chia sẻ --- */}
      <div className="border-t border-gray-100 px-5 py-3 flex justify-between text-xs text-gray-600 bg-gray-50/50">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 font-bold transition ${
            hasLiked ? 'text-rose-500' : 'hover:text-primary'
          }`}
        >
          <Heart className={`w-4 h-4 transition ${hasLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          <span>Thích ({likes})</span>
        </button>

        <button
          type="button"
          onClick={toggleBinhLuan}
          className={`flex items-center gap-1.5 font-bold transition ${
            moBinhLuan ? 'text-primary' : 'hover:text-primary'
          }`}
        >
          <MessageCircle className={`w-4 h-4 transition ${moBinhLuan ? 'text-primary' : 'text-slate-400'}`} />
          <span>Bình luận ({commentsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Đã sao chép đường link bài đăng!');
          }}
          className="flex items-center gap-1.5 font-bold hover:text-primary transition"
        >
          <Share2 className="w-4 h-4 text-slate-400" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* KHU VỰC BÌNH LUẬN COLLAPSIBLE (BÌNH LUẬN THẬT TỪ DATABASE) */}
      {/* ========================================================= */}
      {moBinhLuan && (
        <div className="bg-gray-50/80 border-t border-gray-100 p-5 space-y-4 animate-fade-in">
          {/* DANH SÁCH BÌNH LUẬN HIỆN TẠI */}
          {dangTaiBinhLuan ? (
            <div className="text-center py-4 text-xs text-gray-500 flex items-center justify-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Đang tải bình luận...</span>
            </div>
          ) : danhSachBinhLuan.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-400">
              Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi hoặc trao đổi!
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {danhSachBinhLuan.map((cmt, idx) => {
                const isAuthor =
                  (cmt.userName || '').toLowerCase() === (post.authorName || '').toLowerCase() ||
                  cmt.userRole === 'ROLE_PARENT';
                const isTutor = cmt.userRole === 'ROLE_TUTOR' || cmt.userRole === 'TUTOR';

                const avatar =
                  cmt.userAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(cmt.userName || 'User')}&background=random&size=100`;

                return (
                  <div key={cmt.id || idx} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={avatar}
                      alt={cmt.userName}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0 mt-0.5"
                    />
                    <div className="bg-white rounded-2xl p-3 border border-gray-200/80 flex-1 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-gray-900">{cmt.userName}</span>
                          {isAuthor && (
                            <span className="bg-orange-100 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Tác Giả
                            </span>
                          )}
                          {isTutor && !isAuthor && (
                            <span className="bg-blue-100 text-blue-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <GraduationCap className="w-2.5 h-2.5" /> Gia Sư
                            </span>
                          )}
                          {!isTutor && !isAuthor && (
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <BookOpen className="w-2.5 h-2.5" /> Học Viên
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {cmt.createdAt ? new Date(cmt.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                        </span>
                      </div>

                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{cmt.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ô NHẬP BÌNH LUẬN MỚI */}
          <form onSubmit={handleGuiBinhLuan} className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
            <img
              src={myAvatar}
              alt="My Avatar"
              className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={noiDungBinhLuan}
                onChange={(e) => setNoiDungBinhLuan(e.target.value)}
                placeholder="Viết bình luận hoặc trao đổi về lớp học (nhấn Enter để gửi)..."
                className="w-full bg-white text-xs pl-3.5 pr-10 py-2.5 rounded-2xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-orange-100 outline-none transition"
              />
              <button
                type="submit"
                disabled={dangGuiBinhLuan || !noiDungBinhLuan.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-white rounded-xl w-7 h-7 flex items-center justify-center text-xs transition disabled:opacity-30"
                title="Gửi bình luận"
              >
                {dangGuiBinhLuan ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL ỨNG TUYỂN DÀNH CHO GIA SƯ */}
      <ApplyModal
        post={post}
        isOpen={moModalUngTuyen}
        onClose={() => setMoModalUngTuyen(false)}
        onApplySuccess={handleApplySuccess}
      />

      {/* MODAL XEM DANH SÁCH GIA SƯ ỨNG TUYỂN DÀNH CHO CHỦ BÀI VIẾT */}
      <ApplicantsModal
        post={post}
        isOpen={moModalDanhSachUngTuyen}
        onClose={() => setMoModalDanhSachUngTuyen(false)}
        onApplicationAccepted={handleApplicationAccepted}
      />
    </article>
  );
}
