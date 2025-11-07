import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Assets/Logo.png';
import { Layout, Typography, Dropdown, Menu, Space, Avatar, Badge, Button, Drawer, Grid, message } from 'antd';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  TableOutlined,
  ExperimentOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  MenuOutlined
} from '@ant-design/icons';
import '../styles/chemistryTheme.css';
import './Header.css';
import accountService from '../services/accountService';

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
      const name = decoded.name || decoded.Name || 
                   decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                   decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/name'] ||
                   decoded.fullName || decoded.FullName;
      if (name) return name;
    }
  } catch (error) {
    console.error('Error decoding token for name:', error);
  }
  return null;
};

const { Header } = Layout;
const { Title } = Typography;

const TeacherHeader = ({ userName: propUserName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const [userName, setUserName] = useState(() => {
    const cachedName = localStorage.getItem('user_name');
    if (cachedName) return cachedName;
    const tokenName = getUserNameFromToken();
    if (tokenName) {
      localStorage.setItem('user_name', tokenName);
      return tokenName;
    }
    return propUserName || 'Giáo viên Hóa học';
  });

  // Load user name from API if not in token or localStorage
  useEffect(() => {
    const loadUserName = async () => {
      if (userName && userName !== 'Giáo viên Hóa học' && userName !== 'Học sinh' && userName !== 'Quản trị viên') {
        return;
      }
      const cachedName = localStorage.getItem('user_name');
      if (cachedName) {
        setUserName(cachedName);
        return;
      }
      const tokenName = getUserNameFromToken();
      if (tokenName) {
        localStorage.setItem('user_name', tokenName);
        setUserName(tokenName);
        return;
      }
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

  // Account menu for teachers
  const accountMenu = (
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

  // Teacher navigation menu
  const menuItems = [
    {
      key: '/dashboard',
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
      key: '/question-difficulties',
      icon: <ExperimentOutlined />,
      label: 'Độ khó câu hỏi'
    },
    {
      key: '/manage-tests',
      icon: <BulbOutlined />,
      label: 'Quản lý đề kiểm tra'
    }
  ];

  // Use lg breakpoint (992px) instead of md (768px) to better support tablets/iPads
  // Also check window width directly for more control
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show full menu on screens >= 992px (lg) or >= 1024px for better tablet support
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
      {/* Logo */}
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
        onClick={() => handleNavigation('/dashboard')}
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

      {showFullMenu ? (
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
            items={menuItems.map(item => ({
              ...item,
              label: item.label
            }))}
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
          {/* Mobile */}
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
            {accountMenu}
          </Drawer>
        </>
      )}
    </Header>
  );
};

export default TeacherHeader;
