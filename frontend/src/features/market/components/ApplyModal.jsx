import React, { useState } from 'react';
import { Send, FileText, X, AlertCircle, Coins, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/**
 * ====================================================================
 * COMPONENT: MODAL ỨNG TUYỂN NHẬN LỚP (ApplyModal.jsx)
 * Dành cho Gia sư nộp hồ sơ, đưa mức học phí và lời chào tới phụ huynh.
 * ====================================================================
 */
export default function ApplyModal({ post, isOpen, onClose, onApplySuccess }) {
  const { nguoiDung } = useAuth();

  const [introduction, setIntroduction] = useState(
    `Chào anh/chị, tôi là ${nguoiDung?.fullName || 'Gia sư'}, tốt nghiệp chuyên ngành sư phạm. Tôi có kinh nghiệm giảng dạy môn này nhiều năm và mong muốn đồng hành hỗ trợ em tiến bộ nhanh chóng.`
  );
  const [expectedRate, setExpectedRate] = useState(post?.fee || '250.000đ / buổi');
  const [phoneContact, setPhoneContact] = useState(nguoiDung?.phone || '');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');

  if (!isOpen || !post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!introduction.trim()) {
      setLoi('Vui lòng nhập lời giới thiệu bản thân và phương pháp dạy.');
      return;
    }
    if (!phoneContact.trim()) {
      setLoi('Vui lòng nhập số điện thoại hoặc Zalo liên hệ.');
      return;
    }

    setDangGui(true);
    setLoi('');
    try {
      await onApplySuccess({
        introduction: introduction.trim(),
        expectedRate: expectedRate.trim(),
        phoneContact: phoneContact.trim(),
      });
      onClose();
    } catch (err) {
      setLoi(err.response?.data?.message || 'Có lỗi xảy ra khi gửi hồ sơ ứng tuyển.');
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg">Ứng Tuyển Nhận Lớp</h3>
              <p className="text-xs text-orange-100">Gửi hồ sơ và lời chào trực tiếp tới Phụ Huynh / Học Viên</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THÔNG TIN TÓM TẮT LỚP HỌC */}
        <div className="p-6 pb-2">
          <div className="bg-orange-50/80 rounded-2xl p-4 border border-orange-100 mb-4 text-xs text-gray-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Môn học & Yêu cầu:</span>
              <span className="font-extrabold text-primary text-sm">{post.subject || 'Lớp Gia Sư'}</span>
            </div>
            {post.location && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Khu vực / Hình thức:</span>
                <span className="font-bold text-gray-800">{post.location}</span>
              </div>
            )}
            {post.schedule && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Lịch học yêu cầu:</span>
                <span className="font-bold text-gray-800">{post.schedule}</span>
              </div>
            )}
            {post.fee && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Học phí đề xuất:</span>
                <span className="font-extrabold text-green-700">{post.fee}</span>
              </div>
            )}
          </div>

          {loi && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{loi}</span>
            </div>
          )}

          {/* FORM ỨNG TUYỂN */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Lời nhắn gửi phụ huynh (Kinh nghiệm & Phương pháp giảng dạy)</span> <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                placeholder="Giới thiệu về bản thân, trường tốt nghiệp, bằng cấp/chứng chỉ và phương pháp dạy..."
                className="w-full text-xs sm:text-sm p-3 border border-gray-300 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-orange-100 transition resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>Học phí đề xuất (VNĐ)</span>
                </label>
                <input
                  type="text"
                  value={expectedRate}
                  onChange={(e) => setExpectedRate(e.target.value)}
                  placeholder="VD: 250.000đ / buổi"
                  className="w-full text-xs sm:text-sm p-2.5 border border-gray-300 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SĐT / Zalo liên hệ</span> <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={phoneContact}
                  onChange={(e) => setPhoneContact(e.target.value)}
                  placeholder="VD: 0977112233"
                  className="w-full text-xs sm:text-sm p-2.5 border border-gray-300 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition font-medium"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={dangGui}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Hủy Bỏ
              </button>

              <button
                type="submit"
                disabled={dangGui}
                className="bg-primary hover:bg-primary-dark text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {dangGui ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Xác Nhận Gửi Hồ Sơ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
