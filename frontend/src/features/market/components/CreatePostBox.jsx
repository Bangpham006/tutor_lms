import React, { useState } from 'react';
import { Users, GraduationCap, Lightbulb, SlidersHorizontal, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/**
 * ====================================================================
 * COMPONENT: KHUNG TẠO BÀI ĐĂNG MỚI (CreatePostBox.jsx)
 * Sử dụng icon Lucide, hỗ trợ tạo tin tuyển gia sư chi tiết lưu vào Database thật:
 *   - Môn học, Khối lớp, Khu vực, Lịch học, Học phí
 * ====================================================================
 */
export default function CreatePostBox({ onPostCreated }) {
  const { nguoiDung, daDangNhap } = useAuth();

  // Loại bài đăng: 'TUYEN_GIA_SU' | 'TIM_LOP' | 'CHIA_SE_KIEN_THUC'
  const [postType, setPostType] = useState('TUYEN_GIA_SU');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [location, setLocation] = useState('Hà Nội');
  const [schedule, setSchedule] = useState('Tối Thứ 2, 4, 6 (19h30 - 21h00)');
  const [fee, setFee] = useState('250.000đ / buổi');
  const [hienChiTiet, setHienChiTiet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myAvatar =
    nguoiDung?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nguoiDung?.fullName || 'User'
    )}&background=f97316&color=fff&bold=true`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung bài đăng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        badgeType: postType,
        content: content.trim(),
        subject: postType === 'TUYEN_GIA_SU' || postType === 'TIM_LOP' ? (subject.trim() || 'Toán / Tiếng Anh') : null,
        gradeLevel: postType === 'TUYEN_GIA_SU' || postType === 'TIM_LOP' ? (gradeLevel.trim() || 'Cấp 2 / Cấp 3') : null,
        location: postType === 'TUYEN_GIA_SU' || postType === 'TIM_LOP' ? location.trim() : null,
        schedule: postType === 'TUYEN_GIA_SU' || postType === 'TIM_LOP' ? schedule.trim() : null,
        fee: postType === 'TUYEN_GIA_SU' || postType === 'TIM_LOP' ? fee.trim() : null,
      };

      if (onPostCreated) {
        await onPostCreated(payload);
      }
      setContent('');
      setSubject('');
      setGradeLevel('');
      setHienChiTiet(false);
    } catch (err) {
      console.error('Lỗi tạo bài đăng:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden mb-6 hover-card-elevation">
      {/* TAB CHỌN LOẠI BÀI ĐĂNG */}
      <div className="flex border-b border-slate-100 bg-slate-50/80">
        <button
          type="button"
          onClick={() => {
            setPostType('TUYEN_GIA_SU');
            setHienChiTiet(true);
          }}
          className={`flex-1 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            postType === 'TUYEN_GIA_SU'
              ? 'text-orange-600 border-b-2 border-orange-500 bg-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-orange-500" />
          <span>Tuyển Gia Sư</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPostType('TIM_LOP');
            setHienChiTiet(true);
          }}
          className={`flex-1 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            postType === 'TIM_LOP'
              ? 'text-orange-600 border-b-2 border-orange-500 bg-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-orange-500" />
          <span>Tìm Lớp Học</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPostType('CHIA_SE_KIEN_THUC');
            setHienChiTiet(false);
          }}
          className={`flex-1 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            postType === 'CHIA_SE_KIEN_THUC'
              ? 'text-orange-600 border-b-2 border-orange-500 bg-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-orange-500" />
          <span>Chia Sẻ Tri Thức</span>
        </button>
      </div>

      {/* FORM NHẬP BÀI ĐĂNG */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <div className="flex items-start space-x-3.5 mb-3.5">
          <img
            src={myAvatar}
            alt="Avatar"
            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0 mt-0.5 shadow-sm"
          />
          <textarea
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'TUYEN_GIA_SU'
                ? `Chào các thầy cô, gia đình cần tìm gia sư môn... cho con... Yêu cầu kinh nghiệm, phương pháp...`
                : postType === 'TIM_LOP'
                ? 'Em đang là học viên/sinh viên cần tìm gia sư kèm môn... mục tiêu...'
                : 'Chia sẻ tài liệu, mẹo học tập hoặc đặt câu hỏi thảo luận cùng cộng đồng...'
            }
            className="w-full border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none outline-none text-xs sm:text-sm leading-relaxed"
          />
        </div>

        {/* THÔNG TIN CHI TIẾT LỚP HỌC (NẾU LÀ TUYỂN GIA SƯ HOẶC TÌM LỚP) */}
        {(postType === 'TUYEN_GIA_SU' || postType === 'TIM_LOP') && (
          <div className="mb-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setHienChiTiet(!hienChiTiet)}
              className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1.5 mb-2.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{hienChiTiet ? 'Ẩn thông tin môn & học phí' : '+ Thêm chi tiết Môn học, Khu vực, Học phí'}</span>
            </button>

            {hienChiTiet && (
              <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học cần tìm:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="VD: Toán 12, Tiếng Anh Lớp 9..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp / Trình độ:</label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="VD: Lớp 12 Luyện Thi ĐH, Cấp 2..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khu vực / Hình thức:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="VD: Cầu Giấy, Hà Nội hoặc Online"
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lịch học mong muốn:</label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="VD: Tối Thứ 2, 4, 6 (19h30)"
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Mức học phí đề xuất:</label>
                  <input
                    type="text"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="VD: 250.000đ - 300.000đ / buổi"
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CỤM NÚT DƯỚI CÙNG */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
          <div className="text-xs text-slate-500 font-medium">
            {daDangNhap ? (
              <span>Đăng với tên: <strong className="text-slate-800">{nguoiDung?.fullName}</strong></span>
            ) : (
              <span className="text-slate-400">Bạn chưa đăng nhập, bài đăng sẽ lưu ẩn danh.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black py-2.5 px-6 rounded-2xl transition shadow-md hover:shadow-orange-500/20 text-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Đang đăng...' : 'Đăng Tin Ngay'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
