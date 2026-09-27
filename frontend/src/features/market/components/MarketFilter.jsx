import React from 'react';
import {
  Filter,
  RotateCcw,
  Search,
  Tag,
  Activity,
  Lightbulb,
  Clock,
  CheckCircle2,
  GraduationCap,
  Users,
  BookOpen,
} from 'lucide-react';

/**
 * ====================================================================
 * COMPONENT: BỘ LỌC TÌM KIẾM CHỢ GHÉP LỚP (MarketFilter.jsx)
 * Sử dụng icon Lucide sắc nét, hỗ trợ lọc theo từ khóa môn học,
 * loại bài đăng, trạng thái ghép lớp.
 * ====================================================================
 */
export default function MarketFilter({
  tuKhoa = '',
  setTuKhoa,
  loaiTin = 'ALL',
  setLoaiTin,
  trangThai = 'ALL',
  setTrangThai,
  onReset,
}) {
  return (
    <aside className="w-full lg:w-1/4 flex-shrink-0" aria-label="Bộ lọc tìm kiếm">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 sticky top-24 space-y-5 hover-card-elevation">
        
        {/* TIÊU ĐỀ & RESET */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <span>Bộ Lọc Tìm Lớp</span>
          </h3>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại</span>
          </button>
        </div>

        {/* 1. TÌM KIẾM TỪ KHÓA */}
        <div>
          <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-orange-500" />
            <span>Tìm theo môn / yêu cầu</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="VD: Toán 12, Tiếng Anh, ReactJS..."
              className="w-full border border-slate-200 rounded-2xl pl-3.5 pr-8 py-2.5 text-xs focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition bg-slate-50 focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
            {tuKhoa && (
              <button
                type="button"
                onClick={() => setTuKhoa('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 2. LỌC THEO LOẠI BÀI ĐĂNG */}
        <div>
          <label className="block text-xs font-black text-slate-800 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            <span>Loại bài đăng</span>
          </label>
          <div className="space-y-1 text-xs text-slate-700">
            {[
              { id: 'ALL', ten: 'Tất cả bài đăng', icon: null },
              { id: 'TUYEN_GIA_SU', ten: 'Phụ Huynh Tuyển Gia Sư', icon: Users },
              { id: 'TIM_LOP', ten: 'Học Viên Tìm Lớp', icon: GraduationCap },
              { id: 'CHIA_SE_KIEN_THUC', ten: 'Tài Liệu & Chia Sẻ', icon: BookOpen },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition ${
                    loaiTin === item.id
                      ? 'bg-orange-50/90 font-bold text-orange-600 border border-orange-200/80 shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="market_loaitin"
                    checked={loaiTin === item.id}
                    onChange={() => setLoaiTin(item.id)}
                    className="accent-orange-500 w-3.5 h-3.5"
                  />
                  {IconComponent && <IconComponent className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                  <span className="truncate">{item.ten}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. LỌC THEO TRẠNG THÁI */}
        <div>
          <label className="block text-xs font-black text-slate-800 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            <span>Trạng thái lớp</span>
          </label>
          <div className="space-y-1 text-xs text-slate-700">
            {[
              { id: 'ALL', ten: 'Tất cả trạng thái', icon: null },
              { id: 'OPEN', ten: 'Đang Tìm Gia Sư (Chưa ghép)', icon: Clock, color: 'text-amber-500' },
              { id: 'MATCHED', ten: 'Đã Ghép Lớp Thành Công', icon: CheckCircle2, color: 'text-emerald-500' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition ${
                    trangThai === item.id
                      ? 'bg-orange-50/90 font-bold text-orange-600 border border-orange-200/80 shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="market_trangthai"
                    checked={trangThai === item.id}
                    onChange={() => setTrangThai(item.id)}
                    className="accent-orange-500 w-3.5 h-3.5"
                  />
                  {IconComp && <IconComp className={`w-3.5 h-3.5 ${item.color || 'text-orange-500'} shrink-0`} />}
                  <span className="truncate">{item.ten}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* MẸO DÀNH CHO GIA SƯ */}
        <div className="bg-gradient-to-br from-orange-50/80 to-amber-50/60 p-4 rounded-2xl border border-orange-200/70 text-xs">
          <div className="flex items-center gap-1.5 mb-1.5 text-orange-700">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="font-black text-slate-900">Mẹo nhận lớp nhanh:</h4>
          </div>
          <p className="text-slate-600 leading-relaxed font-normal">
            Gia sư nên chuẩn bị sẵn số điện thoại, kinh nghiệm giảng dạy và bấm nút <strong>"Ứng tuyển nhận lớp"</strong> để phụ huynh dễ dàng liên hệ trao đổi.
          </p>
        </div>

      </div>
    </aside>
  );
}
