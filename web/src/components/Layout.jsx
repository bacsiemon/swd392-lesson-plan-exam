import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { useLocation } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import TeacherHeader from './TeacherHeader';
import AdminHeader from './AdminHeader';
import AppHeader from './Header';
import AppFooter from './Footer';
import accountService from '../services/accountService';

const { Content } = Layout;

// Helper function to get user role from JWT token
const getUserRoleFromToken = () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      // Try different claim names that might contain role
      // Role is stored as string: "Student", "Teacher", "Admin"
      const role = decoded.role || decoded.Role || 
                   decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                   decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];
      
      if (role) {
        console.log('Role from token:', role);
        return role;
      }
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  return null;
};

/**
 * @param {object} props 
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  
  // Get role synchronously from localStorage first (for immediate use)
  // Then update from token/API if needed
  const getCachedRole = () => {
    return localStorage.getItem('user_role');
  };
  
  const [userRole, setUserRole] = useState(() => getCachedRole());
  
  // Get user role from token or localStorage or API
  useEffect(() => {
    const loadUserRole = async () => {
      // First try to get from localStorage (cached)
      let role = localStorage.getItem('user_role');
      
      // If not in localStorage, try to get from token
      if (!role) {
        role = getUserRoleFromToken();
        if (role) {
          // Cache it for future use
          localStorage.setItem('user_role', role);
        }
      }
      
      // If still not found, try to get from profile API (only for profile route)
      if (!role && location.pathname === '/profile') {
        try {
          const result = await accountService.getProfile();
          if (result.success && result.data) {
            role = result.data.role || result.data.roleEnum || result.data.Role;
            if (role) {
              localStorage.setItem('user_role', role);
              sessionStorage.setItem('user_role', role); // Also save to sessionStorage
              console.log('Role from API:', role);
            }
          }
        } catch (error) {
          console.error('Error getting role from API:', error);
        }
      }
      
      // Always sync role to sessionStorage and state
      if (role) {
        sessionStorage.setItem('user_role', role);
        if (role !== userRole) {
          setUserRole(role);
        }
      }
    };
    
    loadUserRole();
  }, [location.pathname]);
  
  // Define routes for each user role
  // Note: Some routes are shared (like /profile, /calendar) and should use role-based header selection
  const studentRoutes = ['/student-dashboard', '/student-test', '/lesson-plans', '/lesson', '/test-scores', '/calendar', '/exams', '/periodic-table'];
  const teacherRoutes = ['/dashboard', '/question-banks', '/manage-tests', '/create-lesson-plan', '/exam-matrix', '/calendar'];
  const adminRoutes = ['/admin/users', '/admin/activity-status', '/admin/dashboard', '/admin/settings', '/admin'];
  
  // Shared routes that need role-based header selection (not path-based)
  const sharedRoutes = ['/profile', '/calendar'];
  
  // Get current user role synchronously (immediate, no async delay)
  // Priority: sessionStorage (fast, persistent) > localStorage > token > state
  // Read from multiple sources to ensure we get the latest value
  const sessionRole = sessionStorage.getItem('user_role');
  const localStorageRole = localStorage.getItem('user_role');
  const tokenRole = getUserRoleFromToken();
  const currentRole = sessionRole || userRole || localStorageRole || tokenRole;
  
  // If we have a role from any source, save it to sessionStorage for quick access
  if (currentRole && !sessionRole) {
    sessionStorage.setItem('user_role', currentRole);
  }
  
  // Normalize role value - handle both string and numeric
  let normalizedRole = null;
  if (currentRole !== null && currentRole !== undefined) {
    const roleStr = String(currentRole).trim();
    normalizedRole = roleStr;
  }
  const roleLower = normalizedRole ? normalizedRole.toLowerCase() : '';
  
  // Determine which header to render based on current path
  const isProfileRoute = location.pathname === '/profile';
  const isCalendarRoute = location.pathname === '/calendar';
  const isSharedRoute = sharedRoutes.includes(location.pathname);
  const isStudentRoute = studentRoutes.some(route => location.pathname.startsWith(route));
  const isTeacherRoute = teacherRoutes.some(route => location.pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));
  
  // Select appropriate header
  let HeaderComponent = AppHeader; // Default header for Home and other pages
  
  // Priority order: Admin routes > Check role first > Shared routes (based on role) > Teacher routes > Student routes
  // First, determine if user is admin based on role - check multiple formats
  const isAdminRole = normalizedRole === '0' || normalizedRole === 0 || 
                      roleLower === 'admin' || 
                      normalizedRole === 'Admin' || 
                      normalizedRole === 'ADMIN' ||
                      currentRole === 0 || 
                      currentRole === '0';
  
  const isTeacherRole = normalizedRole === '1' || normalizedRole === 1 ||
                       roleLower === 'teacher' || 
                       normalizedRole === 'Teacher' || 
                       normalizedRole === 'TEACHER' ||
                       currentRole === 1 || 
                       currentRole === '1';
  
  const isStudentRole = 
    // Check normalized role first
    (normalizedRole === '2') ||
    (normalizedRole === 2) ||
    // Check lower case
    (roleLower === 'student') ||
    // Check exact string matches
    (normalizedRole === 'Student') ||
    (normalizedRole === 'STUDENT') ||
    // Check currentRole (raw value)
    (currentRole === 2) ||
    (currentRole === '2') ||
    // Also check if it's stored as string "2" in localStorage/sessionStorage
    (String(localStorageRole) === '2') ||
    (String(sessionRole) === '2') ||
    // Check if roleLower starts with "student" (for partial matches)
    (roleLower && roleLower.includes('student')) ||
    // Check numeric comparison
    (typeof currentRole === 'number' && currentRole === 2) ||
    (typeof normalizedRole === 'number' && normalizedRole === 2);
  
  console.log('🔍 Determining header:', {
    pathname: location.pathname,
    sessionRole,
    userRole,
    localStorageRole,
    tokenRole,
    currentRole,
    normalizedRole,
    roleLower,
    isAdminRole,
    isTeacherRole,
    isStudentRole,
    isAdminRoute,
    isSharedRoute,
    isTeacherRoute,
    isStudentRoute,
    rawComparison: {
      roleLower_eq_admin: roleLower === 'admin',
      roleLower_eq_teacher: roleLower === 'teacher',
      roleLower_eq_student: roleLower === 'student',
      normalizedRole_eq_0: normalizedRole === '0' || normalizedRole === 0,
      normalizedRole_eq_1: normalizedRole === '1' || normalizedRole === 1,
      normalizedRole_eq_2: normalizedRole === '2' || normalizedRole === 2,
      currentRole_eq_0: currentRole === 0 || currentRole === '0',
      currentRole_eq_1: currentRole === 1 || currentRole === '1',
      currentRole_eq_2: currentRole === 2 || currentRole === '2',
      sessionRole_value: sessionRole,
      localStorageRole_value: localStorageRole
    }
  });
  
  // CRITICAL: Check admin role FIRST, before any route-based logic
  // This ensures admin always gets AdminHeader regardless of route
  if (isAdminRole) {
    // If user is admin, ALWAYS use AdminHeader (highest priority)
    // This should catch admin users on ANY route, including /profile
    HeaderComponent = AdminHeader;
    console.log('🔴✅ Selected: AdminHeader (admin role detected - highest priority)', {
      pathname: location.pathname,
      isAdminRole: true,
      currentRole,
      normalizedRole,
      roleLower
    });
  } else if (isAdminRoute) {
    // Admin routes always use AdminHeader (but this shouldn't be reached if isAdminRole is true)
    HeaderComponent = AdminHeader;
    console.log('✅ Selected: AdminHeader (admin route)');
  } else if (isSharedRoute) {
    // For shared routes (profile, calendar), use header based on actual user role
    // Priority: Admin > Teacher > Student
    // (Admin already handled above, so only check teacher/student here)
    if (isTeacherRole) {
      HeaderComponent = TeacherHeader;
      console.log('✅ Selected: TeacherHeader (teacher role on shared route)');
    } else if (isStudentRole) {
      HeaderComponent = StudentHeader;
      console.log('🟢✅ Selected: StudentHeader (student role on shared route)', {
        pathname: location.pathname,
        isStudentRole: true,
        currentRole,
        normalizedRole,
        roleLower
      });
    } else {
      // Fallback: If role is not determined yet, check referrer or previous route
      const referrer = document.referrer || '';
      const previousPath = sessionStorage.getItem('previousPath') || '';
      const pathname = location.pathname;
      
      console.log('⚠️ Role not found, checking fallback:', { referrer, previousPath, pathname, currentRole });
      
      // Check referrer and previous path first to determine context
      // Priority: Admin > Student > Teacher (to avoid defaulting to Teacher when role is unclear)
      if (referrer.includes('/admin') || previousPath.includes('/admin') || pathname.includes('/admin')) {
        HeaderComponent = AdminHeader;
        console.log('⚠️ Fallback: Using AdminHeader (admin context)');
      } else if (referrer.includes('/student') || referrer.includes('/student-dashboard') || 
          referrer.includes('/exams') || referrer.includes('/student-test') ||
          referrer.includes('/periodic-table') || referrer.includes('/test-scores') ||
          previousPath.includes('/student') || previousPath.includes('/exams') ||
          previousPath.includes('/student-test') || previousPath.includes('/periodic-table') ||
          previousPath.includes('/test-scores') ||
          pathname.includes('/student')) {
        HeaderComponent = StudentHeader;
        console.log('⚠️ Fallback: Using StudentHeader (student context)', {
          referrer,
          previousPath,
          pathname
        });
      } else if (referrer.includes('/dashboard') || referrer.includes('/create-lesson-plan') ||
          referrer.includes('/question-banks') || referrer.includes('/manage-tests') ||
          referrer.includes('/exam-matrix') || previousPath.includes('/dashboard') ||
          previousPath.includes('/create-lesson-plan') || previousPath.includes('/question-banks') ||
          previousPath.includes('/manage-tests') || previousPath.includes('/exam-matrix')) {
        HeaderComponent = TeacherHeader;
        console.log('⚠️ Fallback: Using TeacherHeader (teacher context)', {
          referrer,
          previousPath,
          pathname
        });
      } else {
        // Last resort: Default to StudentHeader (safer than TeacherHeader) for unknown routes
        // This prevents mistakenly showing teacher header to students
        HeaderComponent = StudentHeader;
        console.log('⚠️ Fallback: Using StudentHeader (safe default - prevents wrong header)', {
          referrer,
          previousPath,
          pathname,
          currentRole
        });
      }
    }
  } else if (isTeacherRoute && !isStudentRoute) {
    // Only use TeacherHeader if it's a teacher route AND not a student route
    // (Admin already handled above, so no need to check again)
    HeaderComponent = TeacherHeader;
    console.log('✅ Selected: TeacherHeader (teacher route)');
  } else if (isStudentRoute) {
    // Student routes take priority (since they're more specific)
    // (Admin already handled above, so no need to check again)
    HeaderComponent = StudentHeader;
    console.log('✅ Selected: StudentHeader (student route)');
  } else if (isTeacherRoute) {
    // Fallback for teacher routes that aren't student routes
    HeaderComponent = TeacherHeader;
    console.log('✅ Selected: TeacherHeader (teacher route fallback)');
  }
  
  // Store current pathname for next navigation (to help with fallback logic)
  useEffect(() => {
    sessionStorage.setItem('previousPath', location.pathname);
  }, [location.pathname]);

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