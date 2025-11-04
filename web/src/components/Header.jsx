import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Assets/Logo.png';
import { Layout, Typography, Dropdown, Menu, Space, Avatar, Badge, Button, Drawer, Grid, message } from 'antd';
import '../styles/chemistryTheme.css';
import './Header.css';
import accountService from '../services/accountService';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BookOutlined,
  HomeOutlined,
  TableOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
  MenuOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

// Helper function to get user name from JWT token
const getUserNameFromToken = () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      // Try different claim names that might contain name
      const name = decoded.name || decoded.Name || 
                   decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                   decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/name'] ||
                   decoded.fullName || decoded.FullName;
      
      if (name) {
        return name;
      }
    }
  } catch (error) {
    console.error('Error decoding token for name:', error);
  }
  return null;
};

const AppHeader = ({ userName: propUserName, userRole = 'teacher' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const [userName, setUserName] = useState(() => {
    // Try to get from localStorage first, then from token, then from props
    const cachedName = localStorage.getItem('user_name');
    if (cachedName) return cachedName;
    const tokenName = getUserNameFromToken();
    if (tokenName) {
      localStorage.setItem('user_name', tokenName);
      return tokenName;
    }
    return propUserName || 'Giáo viên Hóa học';
  });

  
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Check if user is authenticated - check token and ensure it's valid
  const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    // Additional check: verify token is not empty string
    if (token.trim() === '') return false;
    
    // Check if token format is valid (JWT tokens have 3 parts separated by dots)
    if (token.split('.').length !== 3) return false;
    
    return true;
  };
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  
  // Show login/register buttons if on home page and not authenticated
  // Default to showing auth buttons if not authenticated (even if not on home, but only show on home)
  const authenticated = isAuthenticated();
  const showAuthButtons = isHomePage && !authenticated;

  // Load user name from API if not in token or localStorage
  useEffect(() => {
    const loadUserName = async () => {
      // If we already have a name from token or localStorage, use it
      if (userName && userName !== 'Giáo viên Hóa học' && userName !== 'Học sinh' && userName !== 'Quản trị viên') {
        return;
      }

      // Try to get from localStorage first
      const cachedName = localStorage.getItem('user_name');
      if (cachedName) {
        setUserName(cachedName);
        return;
      }

      // Try to get from token
      const tokenName = getUserNameFromToken();
      if (tokenName) {
        localStorage.setItem('user_name', tokenName);
        setUserName(tokenName);
        return;
      }

      // If not in token, try to get from API
      if (isAuthenticated()) {
        try {
          const result = await accountService.getProfile();
          if (result.success && result.data) {
            const fullName = result.data.FullName || result.data.fullName || result.data.full_name;
            if (fullName) {
              localStorage.setItem('user_name', fullName);
              setUserName(fullName);
            }
          }
        } catch (error) {
          console.error('Error loading user name:', error);
        }
      }
    };

    loadUserName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          setIsScrolled(scrollTop > 10); 
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Memoized navigation handler
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await accountService.logout();
      if (result.success) {
        message.success('Đăng xuất thành công');
      } else {
        message.warning(result.message || 'Đăng xuất thành công');
      }
    } catch (error) {
      console.error('Logout error:', error);
      message.warning('Đã đăng xuất');
    } finally {
      // Always redirect to home after logout and reload to clear all cached state
      window.location.href = '/';
    }
  };

  // 1. Định nghĩa menu cho Dropdown Tài khoản - Teacher (Chemistry themed)
  const teacherAccountMenu = (
    <Menu
      className="chemistry-dropdown-menu"
      onClick={({ key }) => {
        if (key === 'logout') {
          handleLogout();
        } else if (key === 'create-lesson-plan') {
          navigate('/create-lesson-plan');
        } else {
          navigate(`/${key}`);
        }
      }}
      items={[
        {
          key: 'create-lesson-plan',
          icon: <ExperimentOutlined />,
          label: 'Xây dựng giáo án',
        },
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Hồ sơ cá nhân',
        },
        {
          key: 'calendar',
          icon: <CalendarOutlined />,
          label: 'Lịch làm việc',
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Đăng xuất',
          danger: true,
        },
      ]}
    />
  );

  const studentAccountMenu = (
    <Menu
      className="chemistry-dropdown-menu"
      onClick={({ key }) => {
        if (key === 'logout') {
          handleLogout();
        } else {
          navigate(`/${key}`);
        }
      }}
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Hồ sơ cá nhân',
        },
        {
          key: 'calendar',
          icon: <CalendarOutlined />,
          label: 'Lịch học',
        },
        {
          key: 'test-scores',
          icon: <TrophyOutlined />,
          label: 'Xem điểm kiểm tra',
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Đăng xuất',
          danger: true,
        },
      ]}
    />
  );

  const accountMenu = userRole === 'student' ? studentAccountMenu : teacherAccountMenu;
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Trang chủ'
    },
    {
      key: '/create-lesson-plan',
      icon: <ExperimentOutlined />,
      label: 'Xây dựng giáo án'
    },
    {
      key: '/question-banks',
      icon: <QuestionCircleOutlined />,
      label: 'Ngân hàng câu hỏi'
    },
    {
      key: '/exam-matrix',
      icon: <TableOutlined />,
      label: 'Ma trận đề'
    },
    {
      key: '/manage-tests',
      icon: <BulbOutlined />,
      label: 'Quản lý đề kiểm tra'
    }
  ];

  // Use lg breakpoint (992px) instead of md (768px) to better support tablets/iPads
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showFullMenu = screens.lg || windowWidth >= 1024;
  const headerPadding = showFullMenu ? '0 50px' : (screens.md ? '0 24px' : '0 16px');
  const logoHeight = showFullMenu ? '96px' : (screens.md ? '80px' : '56px');

  return (
    <Header
      className={`sticky-header chemistry-header ${isScrolled ? 'scrolled' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(232, 213, 242, 0.95) 0%, rgba(213, 232, 247, 0.95) 100%)',
        padding: headerPadding,
        borderBottom: '2px solid rgba(177, 156, 217, 0.3)',
        height: 64,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 12px rgba(138, 109, 184, 0.15)'
      }}
    >
      {/* 1. Logo/Tên Ứng Dụng - Chemistry Themed */}
      <div
        className="logo chemistry-logo"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '64px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          flexShrink: 0
        }}
        onClick={() => handleNavigation('/')}
      >
        <img 
          src={Logo} 
          alt="Logo" 
          style={{ 
            height: logoHeight,
            marginRight: screens.md ? 12 : 8,
            objectFit: 'contain'
          }} 
        />
        {(showFullMenu || screens.md) && (
          <Title level={3} style={{ 
            margin: 0, 
            lineHeight: '64px',
            color: 'var(--chem-purple-dark, #8a6db8)',
            fontWeight: 700,
            fontSize: screens.md ? '20px' : '18px',
            whiteSpace: 'nowrap'
          }}>
            AI Chemistry Hub
          </Title>
        )}
      </div>

      {showAuthButtons ? (
        <>
          {/* Desktop/Tablet: Login and Register Buttons */}
          {showFullMenu || screens.md ? (
            <Space size="middle" style={{ marginLeft: 'auto' }}>
              <Button 
                type="default"
                onClick={() => navigate('/login')}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  borderColor: 'var(--chem-purple-dark)',
                  color: 'var(--chem-purple-dark)'
                }}
              >
                Đăng nhập
              </Button>
              <Button 
                type="primary"
                onClick={() => navigate('/register')}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, var(--chem-purple), var(--chem-blue))',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(138, 109, 184, 0.3)'
                }}
              >
                Đăng ký
              </Button>
            </Space>
          ) : (
            /* Mobile: Login and Register Buttons */
            <Space size="small">
              <Button 
                type="text"
                onClick={() => navigate('/login')}
                style={{
                  color: 'var(--chem-purple-dark)',
                  fontWeight: 600
                }}
              >
                Đăng nhập
              </Button>
              <Button 
                type="primary"
                size="small"
                onClick={() => navigate('/register')}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, var(--chem-purple), var(--chem-blue))',
                  border: 'none'
                }}
              >
                Đăng ký
              </Button>
            </Space>
          )}
        </>
      ) : showFullMenu ? (
        <>
          {/* Desktop/Tablet - Full Menu */}
          <Menu
            className="chemistry-nav-menu"
            theme="light"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => handleNavigation(key)}
            overflowedIndicator={<MenuOutlined />}
            style={{ 
              flexGrow: 1, 
              minWidth: 0, 
              borderBottom: 'none', 
              lineHeight: '62px', 
              justifyContent: 'center',
              background: 'transparent',
              fontWeight: 600,
              maxWidth: '100%'
            }}
          />

          {/* Desktop: Account Dropdown */}
          <Dropdown 
            overlay={accountMenu} 
            trigger={['click']} 
            placement="bottomRight"
          >
            <Space 
              className="chemistry-user-section"
              style={{ 
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              <Badge dot color="var(--chem-blue)">
                <Avatar
                  icon={<UserOutlined />}
                  style={{ 
                    background: 'linear-gradient(135deg, var(--chem-purple), var(--chem-blue))',
                    boxShadow: '0 2px 8px rgba(138, 109, 184, 0.3)'
                  }}
                />
              </Badge>
              <span style={{ 
                color: 'var(--chem-purple-dark)', 
                fontWeight: 600,
                fontSize: '14px'
              }}>
                {userName}
              </span>
            </Space>
          </Dropdown>
        </>
      ) : screens.md ? (
        <>
          {/* Tablet - Try to show menu with compact spacing */}
          <Menu
            className="chemistry-nav-menu"
            theme="light"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => handleNavigation(key)}
            overflowedIndicator={<MenuOutlined />}
            style={{ 
              flexGrow: 1, 
              minWidth: 0, 
              borderBottom: 'none', 
              lineHeight: '62px', 
              justifyContent: 'center',
              background: 'transparent',
              fontWeight: 600,
              fontSize: '13px'
            }}
          />
          <Dropdown 
            overlay={accountMenu} 
            trigger={['click']} 
            placement="bottomRight"
          >
            <Space 
              className="chemistry-user-section"
              style={{ 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                flexShrink: 0
              }}
            >
              <Badge dot color="var(--chem-blue)">
                <Avatar
                  icon={<UserOutlined />}
                  style={{ 
                    background: 'linear-gradient(135deg, var(--chem-purple), var(--chem-blue))',
                    boxShadow: '0 2px 8px rgba(138, 109, 184, 0.3)'
                  }}
                />
              </Badge>
              <span style={{ 
                color: 'var(--chem-purple-dark)', 
                fontWeight: 600,
                fontSize: '13px',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {userName}
              </span>
            </Space>
          </Dropdown>
        </>
      ) : (
        <>
          {/* Mobile: Hamburger button */}
          <Button
            aria-label="Open menu"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setIsDrawerOpen(true)}
            style={{ color: 'var(--chem-purple-dark)', flexShrink: 0 }}
          />
          <Drawer
            placement="right"
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            width={280}
            title={
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{userName}</span>
              </Space>
            }
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => {
                setIsDrawerOpen(false);
                handleNavigation(key);
              }}
              style={{ borderRight: 'none', marginBottom: 16 }}
            />
            {/* Account items inside Drawer */}
            {teacherAccountMenu}
          </Drawer>
        </>
      )}
    </Header>
  );
};

export default AppHeader;