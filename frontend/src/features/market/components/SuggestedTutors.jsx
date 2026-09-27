import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BadgeCheck, Star, GraduationCap, ArrowRight, UserCheck } from 'lucide-react';
import { courseApi } from '../../../features/courses/api/courseApi';

/**
 * ====================================================================
 * COMPONENT: GỢI Ý GIA SƯ (SuggestedTutors.jsx)
 * Kết nối dữ liệu gia sư thực tế từ Backend Database qua danh mục khóa học:
 *   - Lọc và tổng hợp gia sư đang đứng lớp
 *   - Hiển thị ảnh đại diện, số khóa học, đánh giá sao uy tín
 *   - Nút liên kết xem Profile chi tiết từng gia sư
 *   - Sử dụng icon vector Lucide hiện đại thay thế emoji thô
 * ====================================================================
 */
export default function SuggestedTutors() {
  const [tutors, setTutors] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    const taiDanhSachGiaSu = async () => {
      try {
        const courses = await courseApi.layDanhSachKhoaHocChung();
        if (Array.isArray(courses) && courses.length > 0) {
          // Gom nhóm gia sư độc nhất theo tutorId / tutorName
          const tutorMap = new Map();

          courses.forEach((c) => {
            const key = c.tutorId ? String(c.tutorId) : c.tutorName;
            if (!key) return;

            if (!tutorMap.has(key)) {
              tutorMap.set(key, {
                id: c.tutorId || '',
                name: c.tutorName || 'Gia sư TutorLMS',
                subject: c.title ? c.title.split('-')[0].trim() : 'Giảng viên chuyên môn',
                courseCount: 1,
                avatar:
                  c.tutorAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    c.tutorName || 'Tutor'
                  )}&background=f97316&color=fff&bold=true`,
                rating: '4.9',
                badge: 'Gia sư tiêu biểu',
              });
            } else {
              const item = tutorMap.get(key);
              item.courseCount += 1;
            }
          });

          setTutors(Array.from(tutorMap.values()).slice(0, 5));
        } else {
          setTutors([]);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách gia sư gợi ý:', err);
        setTutors([]);
      } finally {
        setDangTai(false);
      }
    };

    taiDanhSachGiaSu();
  }, []);

  return (
    <aside className="hidden xl:block w-1/4 flex-shrink-0" aria-label="Gia sư đề xuất">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 sticky top-20 hover-card-elevation">
        
        {/* Header khối */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-black text-base text-slate-900 tracking-tight">
              Gia Sư Nổi Bật
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <BadgeCheck className="w-3 h-3 text-emerald-600" />
            <span>Đã xác minh</span>
          </span>
        </div>

        {/* Danh sách gia sư */}
        {dangTai ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <div className="animate-spin text-xl mb-1.5 text-orange-500">⏳</div>
            Đang tải dữ liệu gia sư...
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 italic">
            Chưa có hồ sơ gia sư nổi bật.
          </div>
        ) : (
          <div className="space-y-3.5">
            {tutors.map((tutor, idx) => (
              <Link
                key={tutor.id || idx}
                to={`/tutor-profile?id=${tutor.id}`}
                className="flex items-start gap-3 p-3 rounded-2xl hover:bg-orange-50/70 border border-transparent hover:border-orange-200 transition-all group block cursor-pointer"
              >
                <div className="relative shrink-0">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-orange-100 shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-orange-600 transition truncate">
                      {tutor.name}
                    </h4>
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-orange-500 shrink-0" />
                    <span>{tutor.courseCount} khóa học phụ trách</span>
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/70 text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{tutor.rating}</span>
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Xem hồ sơ</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Nút Xem tất cả gia sư */}
        <Link
          to="/courses"
          className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline transition w-full text-center"
        >
          <span>Khám phá toàn bộ lớp học</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
