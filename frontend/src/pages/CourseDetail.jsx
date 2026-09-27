import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  GraduationCap,
  Crown,
  CheckCircle2,
  Lock,
  Globe,
  KeyRound,
  Zap,
  Video,
  FileText,
  Paperclip,
  Sparkles,
  Bot,
  Edit3,
  Trash2,
  Plus,
  BookOpen,
  ClipboardList,
  Clock,
  Users,
  Eye,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Star,
  User,
  HelpCircle,
  Send,
  Copy,
  Check,
  RotateCw,
  ListChecks,
} from 'lucide-react';
import { courseApi } from '../features/courses/api/courseApi';
import { useAuth } from '../context/AuthContext';

/**
 * ====================================================================
 * TRANG CHI TIẾT KHÓA HỌC & QUẢN TRỊ NỘI DUNG (CourseDetail.jsx)
 * Chuẩn mô hình LMS chuyên nghiệp:
 *   - Với Học Viên: Xem bài giảng, tải file PDF/docs, nộp bài tập,
 *     nhập mật khẩu ghi danh nếu khóa học yêu cầu.
 *   - Với Gia Sư sở hữu khóa học: Giao diện tương tự học viên nhưng
 *     có đầy đủ quyền biên tập trực tiếp:
 *       + Thêm / Sửa / Xóa Bài giảng & Tài liệu.
 *       + Tải file trực tiếp từ máy tính lên máy chủ LMS (/api/v1/files/upload).
 *       + Thêm / Sửa / Xóa Bài tập về nhà.
 *       + Xem danh sách bài làm của học viên và chấm điểm trực tiếp.
 * ====================================================================
 */
export default function CourseDetail() {
  const { courseId } = useParams();
  const { nguoiDung, daDangNhap } = useAuth();

  const [khoaHoc, setKhoaHoc] = useState(null);
  const [taiLieuList, setTaiLieuList] = useState([]);
  const [baiTapList, setBaiTapList] = useState([]);
  const [daThamGia, setDaThamGia] = useState(false);

  const [dangTai, setDangTai] = useState(true);
  const [loiKetNoi, setLoiKetNoi] = useState(null);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  // Chế độ chỉnh sửa của Giảng viên (Tutor Edit Mode)
  const [cheDoChinhSua, setCheDoChinhSua] = useState(true);

  // Modal Nhập Mật Khẩu Khóa Học (Học viên)
  const [moModalNhapMatKhau, setMoModalNhapMatKhau] = useState(false);
  const [matKhauGhiDanh, setMatKhauGhiDanh] = useState('');
  const [dangGhiDanh, setDangGhiDanh] = useState(false);
  const [loiGhiDanh, setLoiGhiDanh] = useState('');

  // Form / Modal Thêm & Sửa Tài liệu Bài giảng (Gia sư)
  const [moFormUpTaiLieu, setMoFormUpTaiLieu] = useState(false);
  const [taiLieuDangSua, setTaiLieuDangSua] = useState(null);
  const [formTaiLieu, setFormTaiLieu] = useState({
    title: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    lectureLink: '',
  });
  const [dangUpFile, setDangUpFile] = useState(false);

  // Form / Modal Thêm & Sửa Bài tập (Gia sư)
  const [moFormGiaoBaiTap, setMoFormGiaoBaiTap] = useState(false);
  const [baiTapDangSua, setBaiTapDangSua] = useState(null);
  const [formBaiTap, setFormBaiTap] = useState({
    title: '',
    content: '',
    dueAt: '',
  });

  // Modal Xem bài nộp & Chấm điểm (Gia sư)
  const [modalChamDiem, setModalChamDiem] = useState({
    hienThi: false,
    baiTap: null,
    danhSachBaiNop: [],
    dangTai: false,
    submissionDangCham: null,
    score: '',
    feedback: '',
    dangLuuDiem: false,
  });

  // Modal Tóm tắt AI
  const [modalTomTat, setModalTomTat] = useState({
    hienThi: false,
    materialId: null,
    tieuDe: '',
    dangTai: false,
    loi: '',
    noiDung: '',
    tab: 'auto', // 'auto' | 'custom'
    customText: '',
    daSaoChep: false,
    aiConfig: null,
    apiKeyInput: '',
    dangLuuKey: false,
  });

  // Modal Tạo & Làm bài trắc nghiệm AI
  const [modalTracNghiem, setModalTracNghiem] = useState({
    hienThi: false,
    materialId: null,
    tieuDe: '',
    dangTai: false,
    loi: '',
    soLuongCauHoi: 5,
    customContent: '',
    questions: [],
    // Chế độ tương tác: 'preview' (xem trước / biên soạn) | 'test' (làm bài thử) | 'result' (kết quả chấm)
    cheDo: 'preview',
    cauTraLoiUser: {}, // { [index]: 'A' | 'B' | 'C' | 'D' }
    diemSo: null,
    soCauDung: 0,
    dangLuuVaoKhoaHoc: false,
    daLuuThanhCong: false,
  });

  // Modal Nộp bài tập (Học viên)
  const [modalNopBai, setModalNopBai] = useState({
    hienThi: false,
    tieuDe: '',
    baiTapId: null,
    fileUrl: '',
    fileName: '',
    ghiChu: '',
    dangUpFile: false,
    dangNop: false,
  });

  // Tải dữ liệu từ Backend khi vào trang
  useEffect(() => {
    taiDuLieuKhoaHoc();
  }, [courseId, daDangNhap]);

  const taiDuLieuKhoaHoc = async () => {
    setDangTai(true);
    setLoiKetNoi(null);
    try {
      if (!courseId || courseId === 'undefined') {
        throw new Error('Không có ID khóa học hợp lệ.');
      }

      // 1. Lấy chi tiết khóa học từ Database
      const thongTin = await courseApi.layChiTietKhoaHoc(courseId);
      setKhoaHoc(thongTin);

      // Kiểm tra xem người dùng hiện tại có phải Gia sư của khóa học không
      const laGiaSu =
        nguoiDung?.role === 'ROLE_TUTOR' ||
        nguoiDung?.role === 'TUTOR' ||
        nguoiDung?.role === 'ROLE_ADMIN' ||
        nguoiDung?.role === 'ADMIN';

      const laChu =
        laGiaSu &&
        ((thongTin?.tutorId && nguoiDung?.id && String(thongTin.tutorId) === String(nguoiDung.id)) ||
          (thongTin?.tutorName && nguoiDung?.fullName && thongTin.tutorName === nguoiDung.fullName) ||
          nguoiDung?.role === 'ROLE_ADMIN' ||
          nguoiDung?.role === 'ADMIN');

      // 2. Nếu đã đăng nhập, tải tài liệu & bài tập
      if (daDangNhap) {
        try {
          // Gia sư chủ khóa học hoặc học viên đã ghi danh đều lấy được dữ liệu chi tiết
          const [materials, assignments] = await Promise.all([
            laChu ? courseApi.layTaiLieuGiaSu(courseId) : courseApi.layTaiLieuKhoaHoc(courseId),
            laChu ? courseApi.layBaiTapGiaSu(courseId) : courseApi.layBaiTapKhoaHoc(courseId),
          ]);
          setTaiLieuList(Array.isArray(materials) ? materials : []);
          setBaiTapList(Array.isArray(assignments) ? assignments : []);
          setDaThamGia(true);
        } catch (enrollErr) {
          // Chưa ghi danh -> Dùng dữ liệu xem trước công khai
          setDaThamGia(laChu);
          setTaiLieuList(thongTin.materials || []);
          setBaiTapList(thongTin.assignments || []);
        }
      } else {
        setDaThamGia(false);
        setTaiLieuList(thongTin.materials || []);
        setBaiTapList(thongTin.assignments || []);
      }
    } catch (err) {
      console.error('Lỗi tải khóa học:', err);
      setLoiKetNoi('Không thể tải thông tin khóa học. Vui lòng tải lại trang sau.');
      setKhoaHoc(null);
    } finally {
      setDangTai(false);
    }
  };

  // Xác định người dùng có phải là Chủ khóa học (Gia sư phụ trách) không
  const laChuKhoaHoc =
    (nguoiDung?.role === 'ROLE_TUTOR' ||
      nguoiDung?.role === 'TUTOR' ||
      nguoiDung?.role === 'ROLE_ADMIN' ||
      nguoiDung?.role === 'ADMIN') &&
    ((khoaHoc?.tutorId && nguoiDung?.id && String(khoaHoc.tutorId) === String(nguoiDung.id)) ||
      (khoaHoc?.tutorName && nguoiDung?.fullName && khoaHoc.tutorName === nguoiDung.fullName) ||
      nguoiDung?.role === 'ROLE_ADMIN' ||
      nguoiDung?.role === 'ADMIN');

  // =========================================================
  // XỬ LÝ UPLOAD FILE TRỰC TIẾP (DÀNH CHO GIA SƯ & HỌC VIÊN)
  // =========================================================
  const handleUploadFileTrucTiep = async (e, type = 'material') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    if (type === 'material') {
      setDangUpFile(true);
    } else {
      setModalNopBai((prev) => ({ ...prev, dangUpFile: true }));
    }

    try {
      const res = await courseApi.taiLenTepTin(formData);
      if (type === 'material') {
        setFormTaiLieu((prev) => ({
          ...prev,
          fileUrl: res.fileUrl,
          fileName: res.originalName || file.name,
          fileSize: res.size || file.size,
        }));
        setThongBaoThanhCong(`📁 Đã tải tệp "${file.name}" lên máy chủ LMS thành công!`);
        setTimeout(() => setThongBaoThanhCong(''), 4000);
      } else {
        setModalNopBai((prev) => ({
          ...prev,
          fileUrl: res.fileUrl,
          fileName: res.originalName || file.name,
        }));
      }
    } catch (err) {
      console.error('Lỗi tải file:', err);
      alert('❌ Lỗi khi tải file lên máy chủ: ' + (err.response?.data?.message || err.message));
    } finally {
      if (type === 'material') {
        setDangUpFile(false);
      } else {
        setModalNopBai((prev) => ({ ...prev, dangUpFile: false }));
      }
    }
  };

  // =========================================================
  // GIA SƯ: THÊM & SỬA BÀI GIẢNG / TÀI LIỆU
  // =========================================================
  const handleLuuTaiLieu = async (e) => {
    e.preventDefault();
    if (!formTaiLieu.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài giảng / tài liệu!');
      return;
    }

    try {
      const payload = {
        title: formTaiLieu.title.trim(),
        fileUrl: formTaiLieu.fileUrl || null,
        lectureLink: formTaiLieu.lectureLink.trim() || null,
      };

      if (taiLieuDangSua) {
        // Cập nhật tài liệu
        await courseApi.capNhatTaiLieu(taiLieuDangSua.id, payload);
        setThongBaoThanhCong(`🎉 Đã cập nhật bài giảng "${payload.title}" thành công!`);
      } else {
        // Tạo mới tài liệu
        await courseApi.dangTaiLieuMoi(courseId, payload);
        setThongBaoThanhCong(`🎉 Đã đăng bài giảng "${payload.title}" lên khóa học thành công!`);
      }

      setMoFormUpTaiLieu(false);
      setTaiLieuDangSua(null);
      setFormTaiLieu({ title: '', fileUrl: '', fileName: '', fileSize: 0, lectureLink: '' });
      await taiDuLieuKhoaHoc();
      setTimeout(() => setThongBaoThanhCong(''), 4000);
    } catch (err) {
      console.error('Lỗi lưu tài liệu:', err);
      alert('❌ Lỗi khi lưu bài giảng: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMoSuaTaiLieu = (tl) => {
    setTaiLieuDangSua(tl);
    setFormTaiLieu({
      title: tl.title || '',
      fileUrl: tl.fileUrl || '',
      fileName: tl.fileUrl ? tl.fileUrl.split('/').pop() : '',
      fileSize: 0,
      lectureLink: tl.lectureLink || '',
    });
    setMoFormUpTaiLieu(true);
  };

  const handleXoaTaiLieu = async (materialId, tieuDe) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài giảng "${tieuDe}"?`)) return;
    try {
      await courseApi.xoaTaiLieu(materialId);
      setThongBaoThanhCong(`Đã xóa bài giảng "${tieuDe}".`);
      await taiDuLieuKhoaHoc();
      setTimeout(() => setThongBaoThanhCong(''), 3000);
    } catch (err) {
      alert('❌ Lỗi khi xóa bài giảng: ' + (err.response?.data?.message || err.message));
    }
  };

  // =========================================================
  // GIA SƯ: THÊM & SỬA BÀI TẬP VỀ NHÀ
  // =========================================================
  const handleLuuBaiTap = async (e) => {
    e.preventDefault();
    if (!formBaiTap.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài tập!');
      return;
    }

    try {
      const payload = {
        title: formBaiTap.title.trim(),
        content: formBaiTap.content.trim(),
        dueAt: formBaiTap.dueAt ? new Date(formBaiTap.dueAt).toISOString() : null,
      };

      if (baiTapDangSua) {
        await courseApi.capNhatBaiTap(baiTapDangSua.id, payload);
        setThongBaoThanhCong(`🎉 Đã cập nhật bài tập "${payload.title}" thành công!`);
      } else {
        await courseApi.dangBaiTapMoi(courseId, payload);
        setThongBaoThanhCong(`🎉 Đã giao bài tập mới "${payload.title}" cho học viên!`);
      }

      setMoFormGiaoBaiTap(false);
      setBaiTapDangSua(null);
      setFormBaiTap({ title: '', content: '', dueAt: '' });
      await taiDuLieuKhoaHoc();
      setTimeout(() => setThongBaoThanhCong(''), 4000);
    } catch (err) {
      console.error('Lỗi lưu bài tập:', err);
      alert('❌ Lỗi khi lưu bài tập: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMoSuaBaiTap = (bt) => {
    setBaiTapDangSua(bt);
    setFormBaiTap({
      title: bt.title || '',
      content: bt.content || '',
      dueAt: bt.dueAt ? bt.dueAt.substring(0, 16) : '',
    });
    setMoFormGiaoBaiTap(true);
  };

  const handleXoaBaiTap = async (assignmentId, tieuDe) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${tieuDe}"?`)) return;
    try {
      await courseApi.xoaBaiTap(assignmentId);
      setThongBaoThanhCong(`Đã xóa bài tập "${tieuDe}".`);
      await taiDuLieuKhoaHoc();
      setTimeout(() => setThongBaoThanhCong(''), 3000);
    } catch (err) {
      alert('❌ Lỗi khi xóa bài tập: ' + (err.response?.data?.message || err.message));
    }
  };

  // =========================================================
  // GIA SƯ: XEM BÀI NỘP & CHẤM ĐIỂM HỌC VIÊN
  // =========================================================
  const handleMoXemBaiNop = async (bt) => {
    setModalChamDiem({
      hienThi: true,
      baiTap: bt,
      danhSachBaiNop: [],
      dangTai: true,
      submissionDangCham: null,
      score: '',
      feedback: '',
      dangLuuDiem: false,
    });

    try {
      const res = await courseApi.layDanhSachBaiNop(bt.id);
      setModalChamDiem((prev) => ({
        ...prev,
        danhSachBaiNop: Array.isArray(res) ? res : [],
        dangTai: false,
      }));
    } catch (err) {
      console.error('Lỗi lấy bài nộp:', err);
      setModalChamDiem((prev) => ({ ...prev, dangTai: false }));
    }
  };

  const handleLuuDiem = async (submissionId) => {
    if (modalChamDiem.score === '') {
      alert('Vui lòng nhập điểm số (0 - 10)!');
      return;
    }
    const diemSo = parseFloat(modalChamDiem.score);
    if (isNaN(diemSo) || diemSo < 0 || diemSo > 10) {
      alert('Điểm số phải từ 0 đến 10!');
      return;
    }

    setModalChamDiem((prev) => ({ ...prev, dangLuuDiem: true }));
    try {
      await courseApi.chamDiemBaiNop(submissionId, {
        score: diemSo,
        feedback: modalChamDiem.feedback.trim() || 'Giáo viên đã chấm bài.',
      });
      alert('🎉 Đã chấm điểm bài làm thành công!');
      // Tải lại danh sách bài nộp
      const res = await courseApi.layDanhSachBaiNop(modalChamDiem.baiTap.id);
      setModalChamDiem((prev) => ({
        ...prev,
        danhSachBaiNop: Array.isArray(res) ? res : [],
        submissionDangCham: null,
        score: '',
        feedback: '',
        dangLuuDiem: false,
      }));
    } catch (err) {
      alert('❌ Lỗi khi lưu điểm: ' + (err.response?.data?.message || err.message));
      setModalChamDiem((prev) => ({ ...prev, dangLuuDiem: false }));
    }
  };

  // =========================================================
  // HỌC VIÊN: NHẬP MẬT KHẨU GHI DANH
  // =========================================================
  const handleXacNhanGhiDanh = async (e) => {
    if (e) e.preventDefault();
    if (!daDangNhap) {
      alert('Vui lòng đăng nhập tài khoản học viên để tham gia khóa học!');
      return;
    }

    setDangGhiDanh(true);
    setLoiGhiDanh('');

    try {
      const payload = khoaHoc?.hasEnrollmentKey
        ? { enrollmentKey: matKhauGhiDanh.trim() }
        : {};

      await courseApi.dangKyKhoaHoc(courseId, payload);
      alert('🎉 Chúc mừng! Bạn đã nhập đúng mật khẩu và ghi danh thành công vào khóa học!');
      setMoModalNhapMatKhau(false);
      setMatKhauGhiDanh('');
      await taiDuLieuKhoaHoc();
    } catch (err) {
      console.error('Lỗi ghi danh khóa học:', err);
      const tinNhan =
        err.response?.data?.message ||
        'Mật khẩu vào khóa học không chính xác. Vui lòng hỏi lại Gia sư!';
      setLoiGhiDanh(tinNhan);
    } finally {
      setDangGhiDanh(false);
    }
  };

  // =========================================================
  // HỌC VIÊN: NỘP BÀI TẬP VỀ NHÀ
  // =========================================================
  const handleXacNhanNopBai = async (e) => {
    e.preventDefault();
    if (!modalNopBai.fileUrl && !modalNopBai.ghiChu) {
      alert('Vui lòng chọn tệp bài làm hoặc nhập nội dung làm bài trước khi nộp!');
      return;
    }
    setModalNopBai((prev) => ({ ...prev, dangNop: true }));

    try {
      if (daDangNhap) {
        await courseApi.nopBaiTap(modalNopBai.baiTapId, {
          fileUrl: modalNopBai.fileUrl || null,
          content: modalNopBai.ghiChu,
        });
        alert(`🎉 Đã nộp bài tập "${modalNopBai.tieuDe}" thành công!`);
      } else {
        alert('Vui lòng đăng nhập để nộp bài!');
      }
    } catch (err) {
      console.warn('Lỗi gửi bài tập:', err);
      alert('❌ Lỗi khi nộp bài: ' + (err.response?.data?.message || err.message));
    } finally {
      setModalNopBai({
        hienThi: false,
        tieuDe: '',
        baiTapId: null,
        fileUrl: '',
        fileName: '',
        ghiChu: '',
        dangUpFile: false,
        dangNop: false,
      });
    }
  };

  // =========================================================
  // TÍNH NĂNG AI THẬT: TÓM TẮT SLIDE & TẠO TRẮC NGHIỆM TỰ ĐỘNG
  // =========================================================
  const handleMoTomTatAi = async (tl) => {
    setModalTomTat({
      hienThi: true,
      materialId: tl.id,
      tieuDe: tl.title,
      dangTai: true,
      loi: '',
      noiDung: '',
      tab: 'auto',
      customText: '',
      daSaoChep: false,
      aiConfig: null,
      apiKeyInput: '',
      dangLuuKey: false,
    });

    try {
      // 1. Kiểm tra cấu hình AI Backend
      try {
        const configRes = await courseApi.kiemTraTrangThaiAi();
        setModalTomTat((prev) => ({ ...prev, aiConfig: configRes }));
      } catch (e) {
        console.warn('Không kiểm tra được cấu hình AI:', e);
      }

      // 2. Gọi API Tóm tắt AI thật từ Spring Boot & LLM
      const res = await courseApi.tomTatTaiLieuAi(tl.id);
      setModalTomTat((prev) => ({
        ...prev,
        dangTai: false,
        noiDung: res.summary || 'Không có nội dung tóm tắt trả về từ AI.',
      }));
    } catch (err) {
      console.error('Lỗi tóm tắt AI:', err);
      let msg = err.response?.data?.message || err.message || 'Lỗi khi gọi API AI của hệ thống.';
      if (err.code === 'ECONNABORTED' || (typeof msg === 'string' && msg.toLowerCase().includes('timeout'))) {
        msg = 'Thời gian xử lý của AI kéo dài hơn dự kiến do tài liệu dung lượng lớn hoặc máy chủ AI đang tải cao. Vui lòng bấm "Thử lại"!';
      }
      setModalTomTat((prev) => ({
        ...prev,
        dangTai: false,
        loi: msg,
      }));
    }
  };

  const handleChayLaiTomTat = async (dungCustom = false) => {
    setModalTomTat((prev) => ({ ...prev, dangTai: true, loi: '' }));
    try {
      const payload = dungCustom && modalTomTat.customText.trim()
        ? { lectureContent: modalTomTat.customText.trim() }
        : {};
      const res = await courseApi.tomTatTaiLieuAi(modalTomTat.materialId, payload);
      setModalTomTat((prev) => ({
        ...prev,
        dangTai: false,
        noiDung: res.summary || 'Không có nội dung tóm tắt.',
      }));
    } catch (err) {
      console.error('Lỗi khi tóm tắt lại:', err);
      let msg = err.response?.data?.message || err.message || 'Lỗi khi gọi AI.';
      if (err.code === 'ECONNABORTED' || (typeof msg === 'string' && msg.toLowerCase().includes('timeout'))) {
        msg = 'Thời gian xử lý của AI kéo dài hơn dự kiến do tài liệu dung lượng lớn hoặc máy chủ AI đang tải cao. Vui lòng bấm "Thử lại"!';
      }
      setModalTomTat((prev) => ({ ...prev, dangTai: false, loi: msg }));
    }
  };

  const handleLuuKeyAi = async (e) => {
    if (e) e.preventDefault();
    if (!modalTomTat.apiKeyInput.trim()) {
      alert('Vui lòng nhập API Key!');
      return;
    }
    setModalTomTat((prev) => ({ ...prev, dangLuuKey: true }));
    try {
      const configRes = await courseApi.cauHinhKeyAi({ apiKey: modalTomTat.apiKeyInput.trim() });
      alert('🎉 Đã cập nhật API Key cho LLM thành công!');
      setModalTomTat((prev) => ({
        ...prev,
        aiConfig: configRes,
        apiKeyInput: '',
        dangLuuKey: false,
        loi: '',
      }));
      // Tự động chạy lại tóm tắt
      handleChayLaiTomTat(modalTomTat.tab === 'custom');
    } catch (err) {
      alert('Lỗi cập nhật Key: ' + (err.response?.data?.message || err.message));
      setModalTomTat((prev) => ({ ...prev, dangLuuKey: false }));
    }
  };

  const handleMoTaoTracNghiemAi = (tl, contentGoiY = '') => {
    setModalTracNghiem({
      hienThi: true,
      materialId: tl.id,
      tieuDe: tl.title,
      dangTai: false,
      loi: '',
      soLuongCauHoi: 5,
      customContent: contentGoiY || '',
      questions: [],
      cheDo: 'preview',
      cauTraLoiUser: {},
      diemSo: null,
      soCauDung: 0,
      dangLuuVaoKhoaHoc: false,
      daLuuThanhCong: false,
    });
  };

  const handleChayTaoTracNghiem = async () => {
    setModalTracNghiem((prev) => ({
      ...prev,
      dangTai: true,
      loi: '',
      questions: [],
      cheDo: 'preview',
      cauTraLoiUser: {},
      daLuuThanhCong: false,
    }));

    try {
      const payload = {
        questionCount: modalTracNghiem.soLuongCauHoi,
        ...(modalTracNghiem.customContent.trim() ? { lectureContent: modalTracNghiem.customContent.trim() } : {}),
      };

      const res = await courseApi.taoTracNghiemAi(modalTracNghiem.materialId, payload);
      setModalTracNghiem((prev) => ({
        ...prev,
        dangTai: false,
        questions: res.questions || [],
      }));
    } catch (err) {
      console.error('Lỗi tạo trắc nghiệm AI:', err);
      let msg = err.response?.data?.message || err.message || 'Lỗi khi tạo câu hỏi trắc nghiệm từ AI.';
      if (err.code === 'ECONNABORTED' || (typeof msg === 'string' && msg.toLowerCase().includes('timeout'))) {
        msg = 'Thời gian tạo trắc nghiệm kéo dài hơn dự kiến do tài liệu dung lượng lớn hoặc máy chủ AI đang tải cao. Vui lòng bấm "Thử lại"!';
      }
      setModalTracNghiem((prev) => ({
        ...prev,
        dangTai: false,
        loi: msg,
      }));
    }
  };

  const handleLuuTracNghiemVaoKhoaHoc = async () => {
    if (!modalTracNghiem.questions || modalTracNghiem.questions.length === 0) return;
    setModalTracNghiem((prev) => ({ ...prev, dangLuuVaoKhoaHoc: true }));
    try {
      await courseApi.luuBaiTapTracNghiemAi(courseId, {
        title: `[Trắc nghiệm] ${modalTracNghiem.tieuDe}`,
        description: `Bài tập trắc nghiệm củng cố kiến thức (${modalTracNghiem.questions.length} câu) do AI tổng hợp tự động từ bài giảng.`,
        questions: modalTracNghiem.questions,
      });
      alert('🎉 Đã lưu bộ câu hỏi trắc nghiệm thành bài tập mới trong khóa học!');
      setModalTracNghiem((prev) => ({ ...prev, dangLuuVaoKhoaHoc: false, daLuuThanhCong: true }));
      await taiDuLieuKhoaHoc();
    } catch (err) {
      alert('Lỗi khi lưu bài tập: ' + (err.response?.data?.message || err.message));
      setModalTracNghiem((prev) => ({ ...prev, dangLuuVaoKhoaHoc: false }));
    }
  };

  const handleNopBaiTracNghiemThu = () => {
    const list = modalTracNghiem.questions || [];
    if (list.length === 0) return;

    let dung = 0;
    list.forEach((q, idx) => {
      const userChoice = (modalTracNghiem.cauTraLoiUser[idx] || '').trim().toUpperCase();
      const answer = (q.correctAnswer || '').trim().toUpperCase();
      // So khớp A, B, C, D
      if (userChoice && answer.startsWith(userChoice)) {
        dung++;
      }
    });

    const diem = Math.round((dung / list.length) * 100) / 10;
    setModalTracNghiem((prev) => ({
      ...prev,
      cheDo: 'result',
      diemSo: diem,
      soCauDung: dung,
    }));
  };

  if (dangTai) {
    return (
      <div className="khung_dang_tai min-h-screen flex justify-center items-center bg-gray-50 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
        <span className="font-semibold text-sm">Đang tải thông tin khóa học...</span>
      </div>
    );
  }

  if (loiKetNoi || !khoaHoc) {
    return (
      <div className="khung_loi_khoa_hoc min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-extrabold text-red-700 mb-2">Chưa có dữ liệu khóa học</h3>
        <p className="text-sm text-red-600 mb-4">{loiKetNoi || 'Không tìm thấy thông tin khóa học này.'}</p>
        <Link to="/my-courses" className="text-primary font-bold hover:underline flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách khóa học</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="khung_chi_tiet_khoa_hoc bg-gray-50 min-h-screen py-8 text-gray-800">
      <div className="khung_gioi_han_chieu_rong max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB */}
        <div className="thanh_dieu_huong_breadcrumb text-xs text-gray-500 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-primary transition">Trang Chủ</Link>
          <span>/</span>
          <Link to="/my-courses" className="hover:text-primary transition">Khóa Học</Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold truncate">{khoaHoc.title}</span>
        </div>

        {/* ========================================================= */}
        {/* BANNER DÀNH RIÊNG CHO GIA SƯ SỞ HỮU KHÓA HỌC */}
        {/* ========================================================= */}
        {laChuKhoaHoc && (
          <div className="khung_che_do_giang_vien bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-3xl p-5 sm:p-6 shadow-md mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl shrink-0">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                    Gia Sư Phụ Trách
                  </span>
                  <span className="text-xs text-orange-100">
                    Bạn có toàn quyền thêm, sửa, xóa bài giảng & chấm bài tập
                  </span>
                </div>
                <h2 className="text-lg font-black tracking-tight mt-0.5">
                  Bảng Điều Khiển Khóa Học Của Bạn (LMS Tutor Mode)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCheDoChinhSua(!cheDoChinhSua)}
                className="bg-white text-orange-700 hover:bg-orange-50 font-black px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
              >
                {cheDoChinhSua ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem Góc Độ Học Viên</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Bật Chế Độ Chỉnh Sửa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* BANNER THÔNG BÁO CHO GIA SƯ KHÁC TRUY CẬP (KHÔNG PHẢI CHỦ SỞ HỮU) */}
        {!laChuKhoaHoc && (nguoiDung?.role === 'ROLE_TUTOR' || nguoiDung?.role === 'TUTOR') && (
          <div className="khung_thong_bao_khong_phai_chu bg-blue-50 border border-blue-200 text-blue-900 rounded-3xl p-4 sm:p-5 shadow-sm mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-2xl shrink-0">
                <GraduationCap className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mb-1">
                  Chế Độ Người Học / Quan Sát
                </span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Khóa học này do Gia sư <strong>{khoaHoc.tutorName}</strong> phụ trách. Bạn đang truy cập với tư cách <strong>Người học</strong> (chỉ có quyền xem bài giảng, tải học liệu và làm bài tập sau khi ghi danh, không thể thêm/sửa/xóa bài giảng của đồng nghiệp).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* THÔNG BÁO THÀNH CÔNG / LỖI NỔI BẬT */}
        {thongBaoThanhCong && (
          <div className="hop_thong_bao_thanh_cong bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{thongBaoThanhCong}</span>
            </div>
            <button onClick={() => setThongBaoThanhCong('')} className="text-green-700 font-bold">✕</button>
          </div>
        )}

        {/* HEADER KHÓA HỌC */}
        <div className="khung_header_khoa_hoc bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="ma_hoc_phan bg-orange-100 text-primary font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {khoaHoc.courseCode || 'KHÓA HỌC'}
              </span>
              
              {laChuKhoaHoc ? (
                <span className="the_chu_khoa_hoc bg-purple-100 text-purple-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-purple-700" />
                  <span>Khóa Học Của Bạn</span>
                </span>
              ) : daThamGia ? (
                <span className="the_da_tham_gia bg-green-100 text-green-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                  <span>Đã Ghi Danh Thành Công</span>
                </span>
              ) : khoaHoc.hasEnrollmentKey ? (
                <span className="the_co_mat_khau bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-200">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Yêu Cầu Mật Khẩu</span>
                </span>
              ) : (
                <span className="the_cong_khai bg-blue-100 text-blue-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-700" />
                  <span>Mở Tự Do</span>
                </span>
              )}
            </div>

            <h1 className="tieu_de_mon_hoc text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              {khoaHoc.title}
            </h1>
            <p className="mo_ta text-sm text-gray-600 mt-2 leading-relaxed">
              {khoaHoc.description || 'Chưa có mô tả chi tiết.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
              <p>
                Giảng viên: <span className="font-bold text-gray-800">{khoaHoc.tutorName || 'Gia sư TutorLMS'}</span>
              </p>
              <p>
                Học phí:{' '}
                <span className="font-extrabold text-primary">
                  {Number(khoaHoc.price) > 0
                    ? `${Number(khoaHoc.price).toLocaleString('vi-VN')} đ`
                    : 'Miễn phí'}
                </span>
              </p>
            </div>
          </div>

          {/* CỤM NÚT THAO TÁC HEADER */}
          <div className="cum_nut_header shrink-0 flex flex-col gap-2 w-full sm:w-auto">
            {!daThamGia && !laChuKhoaHoc ? (
              khoaHoc.hasEnrollmentKey ? (
                <button
                  type="button"
                  onClick={() => {
                    setLoiGhiDanh('');
                    setMoModalNhapMatKhau(true);
                  }}
                  className="nut_mo_modal_mat_khau bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow flex items-center justify-center gap-2 text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Nhập Mật Khẩu Khóa Học</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleXacNhanGhiDanh}
                  disabled={dangGhiDanh}
                  className="nut_tham_gia_tu_do bg-primary hover:bg-primary-dark text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {dangGhiDanh ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>{dangGhiDanh ? 'Đang Ghi Danh...' : 'Tham Gia Khóa Học'}</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => alert('Phòng học trực tuyến đang kết nối video WebRTC...')}
                className="nut_vao_phong_hoc bg-primary hover:bg-primary-dark text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow text-sm flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Vào Phòng Học Ảo</span>
              </button>
            )}
          </div>
        </div>

        {/* NỘI DUNG KHÓA HỌC: BÀI GIẢNG & BÀI TẬP */}
        <div className="hop_noi_dung_khoa_hoc bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
          
          {/* BANNER 1: NẾU CHƯA ĐĂNG NHẬP */}
          {!daDangNhap ? (
            <div className="banner_chua_dang_nhap text-center py-8 px-4 bg-orange-50 border border-orange-200 rounded-3xl text-xs sm:text-sm text-orange-900 mb-4">
              <Lock className="w-10 h-10 text-primary mx-auto mb-2" />
              <h3 className="text-base font-black text-gray-900 mb-1">Yêu Cầu Đăng Nhập</h3>
              <p className="text-gray-600 mb-4">
                Bạn cần đăng nhập bằng tài khoản Học Viên để nhập mật khẩu vào lớp và xem bài giảng.
              </p>
              <Link to="/login" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl transition text-xs shadow">
                Đăng Nhập Ngay
              </Link>
            </div>
          ) : !daThamGia && !laChuKhoaHoc && khoaHoc.hasEnrollmentKey ? (
            /* BANNER 2: NẾU ĐÃ ĐĂNG NHẬP NHƯNG CHƯA NHẬP MẬT KHẨU -> MÀN HÌNH KHÓA BẢO VỆ BẮT BUỘC */
            <div className="khung_khoa_lop_hoc bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-3xl p-8 sm:p-12 text-center my-4 shadow-sm">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Lock className="w-10 h-10" />
              </div>
              <div className="inline-block bg-amber-100 text-amber-800 text-xs font-black uppercase px-3.5 py-1 rounded-full mb-3 border border-amber-200">
                Lớp Học Được Bảo Mật Bằng Mật Khẩu Ghi Danh
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                Khóa Học Yêu Cầu Mật Khẩu Để Vào Lớp
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mb-6 leading-relaxed">
                Khóa học do Gia sư <strong>{khoaHoc.tutorName}</strong> phụ trách. 
                Để đảm bảo chất lượng học tập, bạn cần nhập đúng <strong>Mật khẩu vào lớp (Enrollment Key)</strong> để mở khóa xem bài giảng, tải tài liệu đính kèm và làm bài tập.
              </p>

              {/* Form nhập mật khẩu trực tiếp tại đây */}
              <form onSubmit={handleXacNhanGhiDanh} className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={matKhauGhiDanh}
                    onChange={(e) => setMatKhauGhiDanh(e.target.value)}
                    placeholder="Nhập mật khẩu vào lớp (ví dụ: NAMTOAN2026)..."
                    className="w-full text-center font-black tracking-widest text-base sm:text-lg border-2 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 outline-none px-4 py-3.5 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal transition shadow-sm"
                    autoFocus
                  />
                </div>

                {loiGhiDanh && (
                  <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{loiGhiDanh}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={dangGhiDanh || !matKhauGhiDanh.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {dangGhiDanh ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang Xác Thực...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Xác Nhận Mật Khẩu & Mở Khóa Vào Lớp</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Chưa có mật khẩu? Hãy liên hệ với Gia sư <strong>{khoaHoc.tutorName}</strong> để nhận mật khẩu vào lớp.</span>
                </p>
              </form>
            </div>
          ) : (
            <div className="khong_gian_tai_lieu_va_bai_tap space-y-10">
            
            {/* ========================================================= */}
            {/* 1. PHẦN BÀI GIẢNG & TÀI LIỆU */}
            {/* ========================================================= */}
            <div className="khu_vuc_tai_lieu_bai_giang">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Bài Giảng & Học Liệu ({taiLieuList.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tài liệu bài học, slide bài giảng, video ghi hình và file đính kèm.
                  </p>
                </div>

                {/* NÚT DÀNH CHO GIA SƯ: THÊM BÀI GIẢNG / TÀI LIỆU MỚI */}
                {laChuKhoaHoc && cheDoChinhSua && (
                  <button
                    type="button"
                    onClick={() => {
                      setTaiLieuDangSua(null);
                      setFormTaiLieu({ title: '', fileUrl: '', fileName: '', fileSize: 0, lectureLink: '' });
                      setMoFormUpTaiLieu(true);
                    }}
                    className="nut_dang_bai_giang_moi bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Bài Giảng / Tải File Lên</span>
                  </button>
                )}
              </div>

              {taiLieuList.length === 0 ? (
                <div className="text-xs text-gray-500 italic py-8 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                  <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="mt-1">Hiện chưa có bài giảng nào trong khóa học này.</p>
                  {laChuKhoaHoc && (
                    <div className="mt-2 font-semibold text-blue-600 flex items-center justify-center gap-1">
                      <span>Hãy bấm nút "Thêm Bài Giảng / Tải File Lên" ở trên để up tài liệu cho học sinh!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="danh_sach_bai_giang space-y-3">
                  {taiLieuList.map((tl) => (
                    <div
                      key={tl.id}
                      className="item_bai_giang flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <p className="font-bold text-sm text-gray-900 truncate">{tl.title}</p>
                        </div>

                        {daThamGia || laChuKhoaHoc ? (
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                            {tl.fileUrl ? (
                              <a
                                href={tl.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>Tải File Học Liệu</span>
                              </a>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Không có file đính kèm</span>
                            )}

                            {tl.lectureLink && (
                              <a
                                href={tl.lectureLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1.5 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Xem Video Bài Giảng</span>
                              </a>
                            )}
                            <span className="text-[11px] text-gray-400">
                              {tl.createdAt ? new Date(tl.createdAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-700 mt-1 flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            <span>Nhập mật khẩu khóa học để tải tài liệu này</span>
                          </p>
                        )}
                      </div>

                      {/* NÚT THAO TÁC (TUTOR SỬA/XÓA HOẶC HỌC VIÊN TÓM TẮT AI & TRẮC NGHIỆM) */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
                        {(daThamGia || laChuKhoaHoc) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMoTomTatAi(tl)}
                              className="nut_tom_tat_ai bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 border border-purple-200 shadow-sm"
                              title="Tóm tắt nội dung slide / tài liệu bằng AI"
                            >
                              <Bot className="w-3.5 h-3.5 text-purple-600" />
                              <span>Tóm tắt AI</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoTaoTracNghiemAi(tl)}
                              className="nut_trac_nghiem_ai bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 border border-amber-200 shadow-sm"
                              title="Tạo bài trắc nghiệm tự động từ slide / bài giảng"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Tạo Trắc Nghiệm AI</span>
                            </button>
                          </>
                        )}

                        {laChuKhoaHoc && cheDoChinhSua && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMoSuaTaiLieu(tl)}
                              className="nut_sua_tai_lieu bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-xl text-xs transition border border-amber-200 flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleXoaTaiLieu(tl.id, tl.title)}
                              className="nut_xoa_tai_lieu bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-xl text-xs transition border border-red-200 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* 2. PHẦN BÀI TẬP VỀ NHÀ */}
            {/* ========================================================= */}
            <div className="khu_vuc_bai_tap_lms">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-emerald-600" />
                    <span>Bài Tập Về Nhà & Kiểm Tra ({baiTapList.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Học viên nộp bài làm, giáo viên theo dõi và chấm điểm trực tiếp.
                  </p>
                </div>

                {/* NÚT DÀNH CHO GIA SƯ: GIAO BÀI TẬP MỚI */}
                {laChuKhoaHoc && cheDoChinhSua && (
                  <button
                    type="button"
                    onClick={() => {
                      setBaiTapDangSua(null);
                      setFormBaiTap({ title: '', content: '', dueAt: '' });
                      setMoFormGiaoBaiTap(true);
                    }}
                    className="nut_giao_bai_tap_moi bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Giao Bài Tập Mới</span>
                  </button>
                )}
              </div>

              {baiTapList.length === 0 ? (
                <div className="text-xs text-gray-500 italic py-8 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                  <ClipboardList className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="mt-1">Hiện chưa có bài tập nào cho khóa học này.</p>
                </div>
              ) : (
                <div className="danh_sach_bai_tap space-y-3">
                  {baiTapList.map((bt) => (
                    <div
                      key={bt.id}
                      className="item_bai_tap flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-emerald-600 shrink-0" />
                          <p className="font-bold text-sm text-gray-900">{bt.title}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{bt.content}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                          {bt.dueAt ? (
                            <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md font-semibold border border-amber-200 text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Hạn nộp: {new Date(bt.dueAt).toLocaleString('vi-VN')}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Không giới hạn hạn nộp</span>
                          )}
                          <span className="text-[11px] text-gray-400">
                            Ngày tạo: {bt.createdAt ? new Date(bt.createdAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>
                      </div>

                      {/* CỤM NÚT THAO TÁC BÀI TẬP */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {laChuKhoaHoc ? (
                          <>
                            {cheDoChinhSua && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleMoSuaBaiTap(bt)}
                                  className="nut_sua_bai_tap bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-xl text-xs transition border border-amber-200 flex items-center gap-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Sửa</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleXoaBaiTap(bt.id, bt.title)}
                                  className="nut_xoa_bai_tap bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-xl text-xs transition border border-red-200 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa</span>
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleMoXemBaiNop(bt)}
                              className="nut_xem_bai_nop bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow flex items-center gap-1.5"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Bài Nộp & Chấm Điểm</span>
                            </button>
                          </>
                        ) : daThamGia ? (
                          <button
                            type="button"
                            onClick={() =>
                              setModalNopBai({
                                hienThi: true,
                                tieuDe: bt.title,
                                baiTapId: bt.id,
                                fileUrl: '',
                                fileName: '',
                                ghiChu: '',
                                dangUpFile: false,
                                dangNop: false,
                              })
                            }
                            className="nut_nop_bai bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shrink-0 shadow flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Nộp Bài Làm</span>
                          </button>
                        ) : (
                          <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Khóa Nộp Bài</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
          )}

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: GIA SƯ THÊM / SỬA BÀI GIẢNG & UPLOAD FILE TRỰC TIẾP */}
      {/* ========================================================= */}
      {moFormUpTaiLieu && (
        <div className="modal_nen_den fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hop_modal_up_tai_lieu bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {taiLieuDangSua ? 'Chỉnh Sửa Bài Giảng / Học Liệu' : 'Đăng Bài Giảng Mới Lên Khóa Học'}
                </h3>
                <p className="text-xs text-gray-500">Tải tệp trực tiếp từ máy tính lên máy chủ LMS</p>
              </div>
              <button
                type="button"
                onClick={() => setMoFormUpTaiLieu(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLuuTaiLieu} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Tiêu Đề Bài Giảng / Học Liệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bài giảng 01: Đại số & Giải tích nâng cao"
                  value={formTaiLieu.title}
                  onChange={(e) => setFormTaiLieu({ ...formTaiLieu, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              {/* Ô UPLOAD FILE TRỰC TIẾP TỪ MÁY TÍNH */}
              <div className="hop_chon_file bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Tải File Trực Tiếp Từ Máy Tính</span>
                  </label>
                  {dangUpFile && <span className="text-[11px] text-blue-600 animate-pulse font-bold">Đang tải lên...</span>}
                </div>
                <p className="text-[11px] text-blue-800 mb-2">
                  Hỗ trợ tài liệu PDF, Slide PowerPoint, Word (.docx), file ZIP bài tập, ảnh hoặc video.
                </p>
                <input
                  type="file"
                  onChange={(e) => handleUploadFileTrucTiep(e, 'material')}
                  disabled={dangUpFile}
                  className="w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />

                {formTaiLieu.fileName && (
                  <div className="mt-2.5 p-2 bg-white rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                    <span className="truncate font-semibold text-gray-800">
                      ✓ Đã tải: {formTaiLieu.fileName}
                    </span>
                    <a
                      href={formTaiLieu.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold hover:underline shrink-0 ml-2"
                    >
                      Xem file
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Đường Dẫn Video Trực Tuyến (Youtube / Zoom / Drive) <span className="text-gray-400 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formTaiLieu.lectureLink}
                  onChange={(e) => setFormTaiLieu({ ...formTaiLieu, lectureLink: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMoFormUpTaiLieu(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangUpFile}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow disabled:opacity-50"
                >
                  {taiLieuDangSua ? 'Lưu Thay Đổi' : 'Đăng Bài Giảng Lên Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: GIA SƯ THÊM / SỬA BÀI TẬP VỀ NHÀ */}
      {/* ========================================================= */}
      {moFormGiaoBaiTap && (
        <div className="modal_nen_den fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hop_modal_giao_bai_tap bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {baiTapDangSua ? 'Chỉnh Sửa Bài Tập' : 'Giao Bài Tập Về Nhà Mới'}
                </h3>
                <p className="text-xs text-gray-500">Khóa học: {khoaHoc.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setMoFormGiaoBaiTap(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLuuBaiTap} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Tiêu Đề Bài Tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bài tập rèn luyện Số học buổi 1"
                  value={formBaiTap.title}
                  onChange={(e) => setFormBaiTap({ ...formBaiTap, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Yêu Cầu / Nội Dung Chi Tiết
                </label>
                <textarea
                  rows="3"
                  placeholder="Yêu cầu học sinh làm các bài 1 đến 5 và nộp tệp PDF bài làm..."
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
                  onClick={() => setMoFormGiaoBaiTap(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow"
                >
                  {baiTapDangSua ? 'Lưu Thay Đổi' : 'Giao Bài Tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: GIA SƯ XEM BÀI NỘP VÀ CHẤM ĐIỂM TRỰC TIẾP */}
      {/* ========================================================= */}
      {modalChamDiem.hienThi && (
        <div className="modal_nen_den fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hop_modal_cham_diem bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Danh Sách Bài Nộp Của Học Viên</h3>
                <p className="text-xs text-primary font-bold">{modalChamDiem.baiTap?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalChamDiem({ ...modalChamDiem, hienThi: false })}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {modalChamDiem.dangTai ? (
              <div className="py-12 text-center text-xs text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-primary inline mr-2" />
                <span>Đang tải bài làm của học sinh...</span>
              </div>
            ) : modalChamDiem.danhSachBaiNop.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl">
                Chưa có học viên nào nộp bài tập này.
              </div>
            ) : (
              <div className="space-y-4">
                {modalChamDiem.danhSachBaiNop.map((sub) => {
                  const dangMoCham = modalChamDiem.submissionDangCham?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                        <div>
                          <p className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-500" />
                            <span>{sub.studentName || 'Học viên'}</span>
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Nộp lúc: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('vi-VN') : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.score !== null && sub.score !== undefined ? (
                            <span className="bg-green-100 text-green-800 font-extrabold px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>Điểm: {sub.score} / 10</span>
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-xl text-xs">
                              Chưa chấm
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setModalChamDiem((prev) => ({
                                ...prev,
                                submissionDangCham: sub,
                                score: sub.score !== null ? sub.score : '',
                                feedback: sub.feedback || '',
                              }))
                            }
                            className="bg-primary hover:bg-primary-dark text-white font-bold px-3 py-1 rounded-lg text-xs transition shadow"
                          >
                            {sub.score !== null ? 'Chấm Lại' : 'Chấm Điểm'}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 text-xs text-gray-700">
                        {sub.content && <p className="mb-2"><strong>Ghi chú:</strong> {sub.content}</p>}
                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1.5 bg-white p-2 rounded-lg border border-blue-200"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                            <span>Tải bài làm của học sinh</span>
                          </a>
                        )}
                        {sub.feedback && (
                          <div className="mt-2 text-purple-700 bg-purple-50 p-2 rounded-lg text-[11px]">
                            <strong>Nhận xét của giáo viên:</strong> {sub.feedback}
                          </div>
                        )}
                      </div>

                      {/* KHỐI NHẬP ĐIỂM SỐ NẾU ĐANG CHỌN BÀI NÀY */}
                      {dangMoCham && (
                        <div className="mt-3 pt-3 border-t border-gray-200 bg-orange-50/60 p-3 rounded-xl border border-orange-200">
                          <h4 className="text-xs font-black text-orange-950 mb-2">
                            Nhập Điểm & Nhận Xét Cho {sub.studentName}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                            <div>
                              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                                Điểm số (0 - 10)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.25"
                                required
                                placeholder="VD: 9.5"
                                value={modalChamDiem.score}
                                onChange={(e) =>
                                  setModalChamDiem((prev) => ({ ...prev, score: e.target.value }))
                                }
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                                Lời phê / Nhận xét của giáo viên
                              </label>
                              <input
                                type="text"
                                placeholder="VD: Bài làm trình bày tốt, giải đúng phương pháp..."
                                value={modalChamDiem.feedback}
                                onChange={(e) =>
                                  setModalChamDiem((prev) => ({ ...prev, feedback: e.target.value }))
                                }
                                className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setModalChamDiem((prev) => ({ ...prev, submissionDangCham: null }))
                              }
                              className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 rounded-lg"
                            >
                              Đóng
                            </button>
                            <button
                              type="button"
                              disabled={modalChamDiem.dangLuuDiem}
                              onClick={() => handleLuuDiem(sub.id)}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow"
                            >
                              {modalChamDiem.dangLuuDiem ? 'Đang Lưu...' : 'Lưu Điểm Số'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: HỌC VIÊN NHẬP MẬT KHẨU GHI DANH KHÓA HỌC */}
      {/* ========================================================= */}
      {moModalNhapMatKhau && (
        <div className="modal_nen_den fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hop_modal_nhap_mat_khau bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="text-lg font-black text-gray-900">Mật Khẩu Khóa Học</h3>
                  <p className="text-[11px] text-gray-500">Bảo vệ nội dung bài giảng & bài tập</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoModalNhapMatKhau(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Khóa học <strong>"{khoaHoc.title}"</strong> yêu cầu mật khẩu ghi danh do Gia sư{' '}
              <strong>{khoaHoc.tutorName}</strong> cung cấp.
            </p>

            {loiGhiDanh && (
              <div className="hop_bao_loi_mat_khau bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loiGhiDanh}</span>
              </div>
            )}

            <form onSubmit={handleXacNhanGhiDanh} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Nhập Mật Khẩu (Enrollment Key)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="VD: VIP2026"
                  value={matKhauGhiDanh}
                  onChange={(e) => setMatKhauGhiDanh(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm font-mono font-bold tracking-wider text-center focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMoModalNhapMatKhau(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangGhiDanh || !matKhauGhiDanh.trim()}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow disabled:opacity-50"
                >
                  {dangGhiDanh ? 'Đang Kiểm Tra Mật Khẩu...' : 'Xác Nhận Tham Gia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: HỌC VIÊN NỘP BÀI TẬP VỀ NHÀ (HỖ TRỢ FILE UPLOAD) */}
      {/* ========================================================= */}
      {modalNopBai.hienThi && (
        <div className="modal_nen_den fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-md w-full border border-gray-100">
            <h3 className="font-black text-lg text-gray-900 mb-1">Nộp Bài Tập</h3>
            <p className="text-xs font-bold text-primary mb-4">{modalNopBai.tieuDe}</p>
            <form onSubmit={handleXacNhanNopBai} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Tải lên tệp bài làm trực tiếp
                </label>
                <input
                  type="file"
                  onChange={(e) => handleUploadFileTrucTiep(e, 'submission')}
                  disabled={modalNopBai.dangUpFile}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-primary hover:file:bg-orange-100 cursor-pointer"
                />
                {modalNopBai.fileName && (
                  <p className="text-[11px] text-green-700 font-semibold mt-1">
                    ✓ Đã đính kèm tệp: {modalNopBai.fileName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Ghi chú cho giáo viên</label>
                <textarea
                  placeholder="Ghi chú thêm về bài làm..."
                  value={modalNopBai.ghiChu}
                  onChange={(e) => setModalNopBai({ ...modalNopBai, ghiChu: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 text-xs rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNopBai({ ...modalNopBai, hienThi: false })}
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold text-xs text-gray-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalNopBai.dangNop || modalNopBai.dangUpFile}
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl font-bold text-xs transition shadow disabled:opacity-50"
                >
                  {modalNopBai.dangNop ? 'Đang Nộp...' : 'Nộp Bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: TÓM TẮT AI THẬT TỪ SLIDE / HỌC LIỆU */}
      {/* ========================================================= */}
      {modalTomTat.hienThi && (
        <div className="modal_nen_den fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full border border-gray-100 max-h-[90vh] flex flex-col">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                    <span>Tóm Tắt Bài Giảng / Slide AI</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      AI Trợ Giảng
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium truncate max-w-md">{modalTomTat.tieuDe}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalTomTat((prev) => ({ ...prev, hienThi: false }))}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trạng thái API Key & Model */}
            <div className="mb-4 shrink-0">
              {modalTomTat.aiConfig?.configured ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] text-emerald-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mô hình: <strong>{modalTomTat.aiConfig.model}</strong> ({modalTomTat.aiConfig.provider})</span>
                  </span>
                  <span className="font-mono text-emerald-700 font-semibold">{modalTomTat.aiConfig.maskedApiKey}</span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Hệ thống chưa được kết nối API Key LLM</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mb-2 leading-relaxed">
                    Bạn có thể gửi API Key cho trợ lý trong khung chat hoặc nhập trực tiếp Key (OpenAI / Gemini / DeepSeek / Groq) tại đây:
                  </p>
                  <form onSubmit={handleLuuKeyAi} className="flex gap-2">
                    <input
                      type="password"
                      placeholder="sk-... hoặc AIzaSy... (API Key)"
                      value={modalTomTat.apiKeyInput}
                      onChange={(e) => setModalTomTat((prev) => ({ ...prev, apiKeyInput: e.target.value }))}
                      className="flex-1 border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-mono bg-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={modalTomTat.dangLuuKey}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shrink-0"
                    >
                      {modalTomTat.dangLuuKey ? 'Đang lưu...' : 'Kích Hoạt'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Chuyển Tab Nguồn Tóm Tắt */}
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-4 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setModalTomTat((prev) => ({ ...prev, tab: 'auto' }))}
                className={`flex-1 py-1.5 font-bold rounded-xl transition ${
                  modalTomTat.tab === 'auto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                📄 Tự Động Từ Tệp Học Liệu
              </button>
              <button
                type="button"
                onClick={() => setModalTomTat((prev) => ({ ...prev, tab: 'custom' }))}
                className={`flex-1 py-1.5 font-bold rounded-xl transition ${
                  modalTomTat.tab === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                ✍️ Nhập Nội Dung Slide Thủ Công
              </button>
            </div>

            {/* Ô nhập custom text nếu chọn tab custom */}
            {modalTomTat.tab === 'custom' && (
              <div className="mb-4 shrink-0">
                <textarea
                  rows="3"
                  placeholder="Dán nội dung các slide, ghi chú hoặc nội dung bài giảng cần AI tóm tắt tại đây..."
                  value={modalTomTat.customText}
                  onChange={(e) => setModalTomTat((prev) => ({ ...prev, customText: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleChayLaiTomTat(true)}
                  disabled={modalTomTat.dangTai || !modalTomTat.customText.trim()}
                  className="mt-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tóm Tắt Nội Dung Đã Nhập</span>
                </button>
              </div>
            )}

            {/* Vùng hiển thị kết quả tóm tắt */}
            <div className="flex-1 overflow-y-auto pr-1">
              {modalTomTat.dangTai ? (
                <div className="py-12 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">AI đang đọc & tóm lược kiến thức...</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Trích xuất khái niệm cốt lõi, công thức và trọng tâm ôn tập</p>
                  </div>
                </div>
              ) : modalTomTat.loi ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Không thể tóm tắt:</span>
                  </div>
                  <p className="mt-1 leading-relaxed">{modalTomTat.loi}</p>
                  <button
                    type="button"
                    onClick={() => handleChayLaiTomTat(modalTomTat.tab === 'custom')}
                    className="mt-3 text-purple-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Thử lại</span>
                  </button>
                </div>
              ) : modalTomTat.noiDung ? (
                <div className="bg-purple-50/40 p-5 rounded-2xl border border-purple-100 text-xs text-gray-800 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                  {modalTomTat.noiDung}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-gray-400 italic">
                  Chưa có nội dung tóm tắt. Hãy bấm nút tóm tắt để bắt đầu.
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-100 mt-4 shrink-0">
              <div className="flex items-center gap-2">
                {modalTomTat.noiDung && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(modalTomTat.noiDung);
                      setModalTomTat((prev) => ({ ...prev, daSaoChep: true }));
                      setTimeout(() => setModalTomTat((prev) => ({ ...prev, daSaoChep: false })), 2000);
                    }}
                    className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-1.5"
                  >
                    {modalTomTat.daSaoChep ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{modalTomTat.daSaoChep ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                )}

                {modalTomTat.noiDung && (
                  <button
                    type="button"
                    onClick={() => {
                      const noiDungGoc = modalTomTat.noiDung;
                      setModalTomTat((prev) => ({ ...prev, hienThi: false }));
                      handleMoTaoTracNghiemAi({ id: modalTomTat.materialId, title: modalTomTat.tieuDe }, noiDungGoc);
                    }}
                    className="px-3 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition flex items-center gap-1.5 border border-amber-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Tạo Trắc Nghiệm từ bản tóm tắt này</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleChayLaiTomTat(modalTomTat.tab === 'custom')}
                  disabled={modalTomTat.dangTai}
                  className="px-3 py-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${modalTomTat.dangTai ? 'animate-spin' : ''}`} />
                  <span>Tóm Tắt Lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTomTat((prev) => ({ ...prev, hienThi: false }))}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl font-bold text-xs text-gray-700 transition"
                >
                  Đóng
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: TẠO BÀI GIẢNG TRẮC NGHIỆM AI & LÀM BÀI TRỰC TIẾP */}
      {/* ========================================================= */}
      {modalTracNghiem.hienThi && (
        <div className="modal_nen_den fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-3xl w-full border border-gray-100 max-h-[92vh] flex flex-col">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                    <span>Tạo & Làm Bài Tập Trắc Nghiệm AI</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Trắc nghiệm khách quan
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium truncate max-w-md">{modalTracNghiem.tieuDe}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalTracNghiem((prev) => ({ ...prev, hienThi: false }))}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar chọn số câu & nút tạo câu hỏi */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-gray-700">Số câu hỏi:</label>
                <div className="flex gap-1.5">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setModalTracNghiem((prev) => ({ ...prev, soLuongCauHoi: num }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                        modalTracNghiem.soLuongCauHoi === num
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {num} câu
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleChayTaoTracNghiem}
                  disabled={modalTracNghiem.dangTai}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalTracNghiem.dangTai ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI đang tạo câu hỏi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{modalTracNghiem.questions.length > 0 ? 'Tạo Lại Bộ Câu Hỏi' : 'Bắt Đầu Tạo Trắc Nghiệm'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Thanh chuyển chế độ (Xem trước / Làm thử / Kết quả) khi đã có câu hỏi */}
            {modalTracNghiem.questions.length > 0 && (
              <div className="flex bg-gray-100 p-1 rounded-2xl mb-4 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setModalTracNghiem((prev) => ({ ...prev, cheDo: 'preview' }))}
                  className={`flex-1 py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    modalTracNghiem.cheDo === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Trước & Đáp Án ({modalTracNghiem.questions.length} câu)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTracNghiem((prev) => ({ ...prev, cheDo: 'test' }))}
                  className={`flex-1 py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    modalTracNghiem.cheDo === 'test' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Làm Thử Trắc Nghiệm Trực Tiếp</span>
                </button>
                {modalTracNghiem.diemSo !== null && (
                  <button
                    type="button"
                    onClick={() => setModalTracNghiem((prev) => ({ ...prev, cheDo: 'result' }))}
                    className={`flex-1 py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                      modalTracNghiem.cheDo === 'result' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>Kết Quả Bài Làm ({modalTracNghiem.diemSo}/10)</span>
                  </button>
                )}
              </div>
            )}

            {/* Nội dung danh sách câu hỏi / giao diện làm bài */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {modalTracNghiem.dangTai ? (
                <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <Loader2 className="w-9 h-9 animate-spin text-amber-600" />
                    <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">AI đang biên soạn bộ câu hỏi trắc nghiệm...</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Xây dựng các phương án gây nhiễu, xác định đáp án đúng & giải thích chi tiết</p>
                  </div>
                </div>
              ) : modalTracNghiem.loi ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Lỗi khi tạo trắc nghiệm:</span>
                  </div>
                  <p className="mt-1 leading-relaxed">{modalTracNghiem.loi}</p>
                </div>
              ) : modalTracNghiem.questions.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-600">Chưa tạo bộ câu hỏi trắc nghiệm nào</p>
                  <p className="text-[11px] mt-1 text-gray-400">
                    Bấm nút <strong>"Bắt Đầu Tạo Trắc Nghiệm"</strong> ở phía trên để AI tự động phân tích slide và sinh câu hỏi cho bạn.
                  </p>
                </div>
              ) : modalTracNghiem.cheDo === 'preview' ? (
                /* CHẾ ĐỘ 1: XEM TRƯỚC BỘ ĐỀ VÀ ĐÁP ÁN */
                <div className="space-y-4">
                  {modalTracNghiem.questions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                      <div className="font-bold text-gray-900 text-sm flex items-start gap-2">
                        <span className="text-primary font-black">Câu {idx + 1}:</span>
                        <span>{q.question}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options?.map((opt, oIdx) => {
                          const isCorrect = q.correctAnswer && (
                            opt.trim().toUpperCase().startsWith(q.correctAnswer.trim().toUpperCase()) ||
                            q.correctAnswer.trim().toUpperCase().startsWith(String.fromCharCode(65 + oIdx))
                          );
                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && (
                                <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ml-1">
                                  <Check className="w-3 h-3" /> Đáp án đúng
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                          <strong>💡 Lời giải chi tiết:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : modalTracNghiem.cheDo === 'test' ? (
                /* CHẾ ĐỘ 2: LÀM THỬ TRẮC NGHIỆM TRỰC TIẾP */
                <div className="space-y-5">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                    <span>Chọn đáp án đúng nhất cho từng câu hỏi bên dưới và nhấn "Nộp Bài Kiểm Tra":</span>
                    <span className="font-bold text-amber-800">
                      Đã chọn: {Object.keys(modalTracNghiem.cauTraLoiUser).length} / {modalTracNghiem.questions.length} câu
                    </span>
                  </div>

                  {modalTracNghiem.questions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-xs space-y-3">
                      <div className="font-bold text-gray-900 text-sm flex items-start gap-2">
                        <span className="text-primary font-black">Câu {idx + 1}:</span>
                        <span>{q.question}</span>
                      </div>

                      <div className="space-y-2">
                        {q.options?.map((opt, oIdx) => {
                          const letter = String.fromCharCode(65 + oIdx); // 'A', 'B', 'C', 'D'
                          const isSelected = modalTracNghiem.cauTraLoiUser[idx] === letter;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() =>
                                setModalTracNghiem((prev) => ({
                                  ...prev,
                                  cauTraLoiUser: { ...prev.cauTraLoiUser, [idx]: letter },
                                }))
                              }
                              className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-50 border-primary text-primary font-bold shadow-sm ring-2 ring-primary/20'
                                  : 'bg-gray-50/60 hover:bg-gray-100 border-gray-200 text-gray-700'
                              }`}
                            >
                              <span>{opt}</span>
                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                  isSelected
                                    ? 'bg-primary text-white border-primary'
                                    : 'border-gray-300 text-gray-400'
                                }`}
                              >
                                {letter}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleNopBaiTracNghiemThu}
                      className="bg-primary hover:bg-primary-dark text-white font-extrabold px-8 py-3 rounded-2xl text-sm transition shadow-lg shadow-primary/25 inline-flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Nộp Bài Kiểm Tra & Chấm Điểm Ngay</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ 3: KẾT QUẢ VÀ GIẢI THÍCH CHI TIẾT */
                <div className="space-y-4">
                  {/* Banner điểm số */}
                  <div className="p-6 bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 rounded-3xl border border-orange-200 text-center">
                    <div className="inline-block p-3 rounded-full bg-white shadow-sm mb-2 text-primary font-black">
                      <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">
                      Điểm Số Của Bạn: <span className="text-primary text-2xl">{modalTracNghiem.diemSo} / 10</span>
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      Bạn đã trả lời đúng <strong>{modalTracNghiem.soCauDung}</strong> trên tổng số <strong>{modalTracNghiem.questions.length}</strong> câu hỏi ({Math.round((modalTracNghiem.soCauDung / modalTracNghiem.questions.length) * 100)}%).
                    </p>
                    <div className="mt-3 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setModalTracNghiem((prev) => ({
                            ...prev,
                            cheDo: 'test',
                            cauTraLoiUser: {},
                            diemSo: null,
                          }))
                        }
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Làm Lại Bài Kiểm Tra</span>
                      </button>
                    </div>
                  </div>

                  {/* Chi tiết từng câu đúng/sai */}
                  <div className="space-y-3">
                    {modalTracNghiem.questions.map((q, idx) => {
                      const userChoice = (modalTracNghiem.cauTraLoiUser[idx] || '').trim().toUpperCase();
                      const answer = (q.correctAnswer || '').trim().toUpperCase();
                      const isCorrect = userChoice && answer.startsWith(userChoice);

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border text-xs space-y-2 ${
                            isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/40 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-gray-900 text-sm flex items-start gap-2">
                              <span className="font-black text-primary">Câu {idx + 1}:</span>
                              <span>{q.question}</span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isCorrect ? '✓ Đúng' : '✕ Sai'}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {q.options?.map((opt, oIdx) => {
                              const letter = String.fromCharCode(65 + oIdx);
                              const isUserSelected = userChoice === letter;
                              const isRightAnswer = answer.startsWith(letter);

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                                    isRightAnswer
                                      ? 'bg-emerald-100/70 border-emerald-300 font-bold text-emerald-950'
                                      : isUserSelected
                                      ? 'bg-red-100 border-red-300 font-bold text-red-900'
                                      : 'bg-white border-gray-200 text-gray-600'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isRightAnswer && (
                                    <span className="text-[10px] text-emerald-700 font-bold">✓ Đáp án chuẩn</span>
                                  )}
                                  {isUserSelected && !isRightAnswer && (
                                    <span className="text-[10px] text-red-700 font-bold">Lựa chọn của bạn</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="mt-2 p-2.5 bg-white/80 rounded-xl border border-gray-200 text-[11px] text-gray-700">
                              <strong>💡 Lời giải:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-100 mt-4 shrink-0">
              <div className="flex items-center gap-2">
                {laChuKhoaHoc && modalTracNghiem.questions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleLuuTracNghiemVaoKhoaHoc}
                    disabled={modalTracNghiem.dangLuuVaoKhoaHoc || modalTracNghiem.daLuuThanhCong}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {modalTracNghiem.dangLuuVaoKhoaHoc ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu vào khóa học...</span>
                      </>
                    ) : modalTracNghiem.daLuuThanhCong ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Đã Lưu Thành Bài Tập Khóa Học!</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Lưu Thành Bài Tập Vào Khóa Học</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalTracNghiem((prev) => ({ ...prev, hienThi: false }))}
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold text-xs text-gray-700 transition"
                >
                  Đóng
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

