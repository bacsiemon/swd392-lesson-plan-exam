import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Assets/Logo.png';
import { Layout, Typography, Dropdown, Menu, Space, Avatar, Badge } from 'antd';
import '../styles/chemistryTheme.css';
import './Header.css';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  DashboardOutlined,
  SafetyOutlined,
  LineChartOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const AdminHeader = ({ userName = 'Quản trị viên' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Account menu for admin
  const accountMenu = (
    <Menu
      className="chemistry-dropdown-menu"
      onClick={({ key }) => {
        if (key === 'logout') {
          console.log('Đăng xuất...');
          navigate('/login');
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

  return (
    <Header
      className={`sticky-header chemistry-header ${isScrolled ? 'scrolled' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 220, 220, 0.95) 0%, rgba(255, 240, 220, 0.95) 100%)',
        padding: '0 50px',
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
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleNavigation('/admin/users')}
      >
        <img 
          src={Logo} 
          alt="Logo" 
          style={{ 
            height: '96px',
            marginRight: 12,
            objectFit: 'contain'
          }} 
        />
        <Title level={3} style={{ 
          margin: 0, 
          lineHeight: '64px',
          color: '#c92a2a',
          fontWeight: 700
        }}>
          AI Chemistry Hub - Admin
        </Title>
      </div>

      {/* Navigation Menu */}
      <Menu
        className="chemistry-nav-menu"
        theme="light"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => handleNavigation(key)}
        style={{ 
          flexGrow: 1, 
          minWidth: 0, 
          borderBottom: 'none', 
          lineHeight: '62px', 
          justifyContent: 'center',
          background: 'transparent',
          fontWeight: 600
        }}
      />

      {/* User Account */}
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
    </Header>
  );
};

export default AdminHeader;
