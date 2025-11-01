import React from 'react';
import { Layout } from 'antd';
import { useLocation } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import TeacherHeader from './TeacherHeader';
import AdminHeader from './AdminHeader';
import AppHeader from './Header';
import AppFooter from './Footer';

const { Content } = Layout;

/**
 * @param {object} props 
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  
  // Define routes for each user role
  const studentRoutes = ['/student-dashboard', '/student-test', '/lesson-plans', '/lesson', '/test-scores', '/calendar'];
  const teacherRoutes = ['/dashboard', '/profile', '/question-banks', '/manage-tests', '/create-lesson-plan', '/exam-matrix', '/calendar'];
  const adminRoutes = ['/admin/users', '/admin/activity-status', '/admin/dashboard', '/admin/settings', '/admin'];
  
  // Determine which header to render based on current path
  const isStudentRoute = studentRoutes.some(route => location.pathname.startsWith(route));
  const isTeacherRoute = teacherRoutes.some(route => location.pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));
  
  // Select appropriate header
  let HeaderComponent = AppHeader; // Default header for Home and other pages
  if (isAdminRoute) {
    HeaderComponent = AdminHeader;
  } else if (isTeacherRoute) {
    HeaderComponent = TeacherHeader;
  } else if (isStudentRoute) {
    HeaderComponent = StudentHeader;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* 1. Header - Conditional based on route */}
      <HeaderComponent />

      {/* 2. Phần Nội dung */}
      <Content
        className="content-with-sticky-header"
        style={{
          padding: '0',
          margin: '0',
          width: '100%',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Content>

      {/* 3. Footer Chung */}
      <AppFooter />

    </Layout>
  );
};

export default AppLayout;