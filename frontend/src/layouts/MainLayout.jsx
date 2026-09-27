import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50 pt-16">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-secondary text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h3 className="text-2xl font-bold text-primary mb-4">TutorLMS</h3>
                <p className="text-gray-300 text-sm leading-relaxed">Nền tảng học tập trực tuyến kết nối học viên và gia sư hàng đầu, mang lại trải nghiệm học tập hiệu quả và linh hoạt.</p>
            </div>
            <div>
                <h4 className="text-lg font-semibold mb-4">Liên Kết Nhanh</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li><a href="#" className="hover:text-white">Về chúng tôi</a></li>
                    <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
                    <li><a href="#" className="hover:text-white">Điều khoản sử dụng</a></li>
                    <li><a href="#" className="hover:text-white">Trợ giúp & Hỗ trợ</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-lg font-semibold mb-4">Liên Hệ</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> 1900 1234</li>
                    <li className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> contact@tutorlms.vn</li>
                </ul>
            </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">&copy; 2026 TutorLMS. All rights reserved.</div>
      </footer>
    </div>
  );
}
