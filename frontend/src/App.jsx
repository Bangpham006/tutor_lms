import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Các trang chính của hệ thống
import Home from './pages/Home';
import Market from './pages/Market';
import MyCourses from './pages/MyCourses';
import AllCourses from './pages/AllCourses';
import CourseDetail from './pages/CourseDetail';
import TutorProfile from './pages/TutorProfile';
import EditProfile from './pages/EditProfile';
import TutorCourseManager from './pages/TutorCourseManager';
import Login from './pages/Login';

/**
 * ====================================================================
 * ĐIỀU HƯỚNG TỔNG THỂ ỨNG DỤNG (App.jsx)
 * Kết nối toàn bộ các trang với Router:
 *   - / : Trang chủ (Home.jsx)
 *   - /courses : Khám phá toàn bộ khóa học (AllCourses.jsx)
 *   - /all-courses : Khám phá toàn bộ khóa học (AllCourses.jsx)
 *   - /market : Chợ ghép lớp (Market.jsx)
 *   - /my-courses : Khóa học của tôi (MyCourses.jsx)
 *   - /courses/:courseId : Chi tiết khóa học theo ID (CourseDetail.jsx)
 *   - /tutor-profile : Xem chi tiết hồ sơ gia sư (TutorProfile.jsx)
 *   - /edit-profile : Chỉnh sửa hồ sơ gia sư (EditProfile.jsx)
 *   - /login : Đăng nhập / Đăng ký (Login.jsx)
 * ====================================================================
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Khung giao diện chính (Có Navbar trên + Footer dưới) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<AllCourses />} />
          <Route path="/all-courses" element={<AllCourses />} />
          <Route path="/market" element={<Market />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/course-detail" element={<CourseDetail />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/tutor-profile" element={<TutorProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/tutor/courses" element={<TutorCourseManager />} />
        </Route>

        {/* Khung giao diện đăng nhập (Toàn màn hình riêng biệt) */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
