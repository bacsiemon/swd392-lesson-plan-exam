import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Assets/Logo.png';
import { Layout, Typography, Dropdown, Menu, Space, Avatar, Badge, message, Button, Drawer, Grid } from 'antd';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  DashboardOutlined,
  SafetyOutlined,
  LineChartOutlined,
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

const AdminHeader = ({ userName: propUserName }) => {
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
    return propUserName || 'Quản trị viên';
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

  // Account menu for admin
  const accountMenu = (
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
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Đăng xuất',
          danger: true,
        },
      ]}
    />
  );

  // Admin navigation menu
  const menuItems = [
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'Quản lý người dùng'
    },
    {
      key: '/admin/activity-status',
      icon: <LineChartOutlined />,
      label: 'Trạng thái hoạt động'
    },
  ];

  // Use lg breakpoint (992px) for better tablet support
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
        background: 'linear-gradient(135deg, rgba(255, 220, 220, 0.95) 0%, rgba(255, 240, 220, 0.95) 100%)',
        padding: headerPadding,
        borderBottom: '2px solid rgba(217, 156, 156, 0.3)',
        height: 64,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 12px rgba(184, 109, 109, 0.15)'
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
        onClick={() => handleNavigation('/admin/users')}
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
            color: '#c92a2a',
            fontWeight: 700,
            fontSize: screens.md ? '20px' : '18px',
            whiteSpace: 'nowrap'
          }}>
            AI Chemistry Hub - Admin
          </Title>
        )}
      </div>

      {/* Navigation Menu */}
      {showFullMenu || screens.md ? (
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
            maxWidth: '100%',
            fontSize: screens.md && !showFullMenu ? '13px' : '14px'
          }}
        />
      ) : (
        <>
          <Button
            aria-label="Open menu"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setIsDrawerOpen(true)}
            style={{ color: '#c92a2a', flexShrink: 0 }}
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

      {/* User Account */}
      {(showFullMenu || screens.md) && (
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
          <Badge dot color="#f5222d">
            <Avatar
              icon={<UserOutlined />}
              style={{ 
                background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                boxShadow: '0 2px 8px rgba(184, 109, 109, 0.3)'
              }}
            />
          </Badge>
          <span style={{ 
            color: '#c92a2a', 
            fontWeight: 600,
            fontSize: '14px'
          }}>
            {userName}
              </span>
            </Space>
          </Dropdown>
      )}
    </Header>
  );
};

export default AdminHeader;
