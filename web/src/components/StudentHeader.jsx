import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Assets/Logo.png';
import { Layout, Typography, Dropdown, Menu, Space, Avatar, Badge, Button, Drawer, Grid } from 'antd';
import '../styles/chemistryTheme.css';
import './Header.css';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  TrophyOutlined,
  MenuOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const StudentHeader = ({ userName = 'Học sinh' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();

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

  // Account menu for students
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

  // Student navigation menu
  const menuItems = [
    {
      key: '/student-dashboard',
      icon: <HomeOutlined />,
      label: 'Trang chủ'
    },
    {
      key: '/lesson-plans',
      icon: <BookOutlined />,
      label: 'Bài học'
    },
    {
      key: '/exams',
      icon: <FileTextOutlined />,
      label: 'Bài kiểm tra'
    },
    {
      key: '/periodic-table',
      icon: <ExperimentOutlined />,
      label: 'Bảng tuần hoàn'
    }
  ];

  const headerPadding = screens.md ? '0 50px' : '0 16px';
  const logoHeight = screens.md ? '96px' : '56px';

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
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleNavigation('/student-dashboard')}
      >
        <img 
          src={Logo} 
          alt="Logo" 
          style={{ 
            height: logoHeight,
            marginRight: 12,
            objectFit: 'contain'
          }} 
        />
        <Title level={3} style={{ 
          margin: 0, 
          lineHeight: '64px',
          color: 'var(--chem-purple-dark, #8a6db8)',
          fontWeight: 700
        }}>
          AI Chemistry Hub
        </Title>
      </div>

      {screens.md ? (
        <>
          {/* Desktop */}
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
      ) : (
        <>
          {/* Mobile */}
          <Button
            aria-label="Open menu"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setIsDrawerOpen(true)}
            style={{ color: 'var(--chem-purple-dark)' }}
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

export default StudentHeader;
