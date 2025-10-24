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
  BookOutlined,
  HomeOutlined,
  TableOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;
const AppHeader = ({ userName = 'Giáo viên Hóa học', userRole = 'teacher' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  
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

  // Memoized navigation handler
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // 1. Định nghĩa menu cho Dropdown Tài khoản - Teacher (Chemistry themed)
  const teacherAccountMenu = (
    <Menu
      className="chemistry-dropdown-menu"
      onClick={({ key }) => {
        if (key === 'logout') {
          console.log('Đăng xuất...');
          navigate('/login');
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

  // 2. Định nghĩa menu cho Dropdown Tài khoản - Student (Chemistry themed)
  const studentAccountMenu = (
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

  // Select the appropriate menu based on user role
  const accountMenu = userRole === 'student' ? studentAccountMenu : teacherAccountMenu;

  // 3. Định nghĩa menu điều hướng chính (Chemistry themed)
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

  return (
    <Header
      className={`sticky-header chemistry-header ${isScrolled ? 'scrolled' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(232, 213, 242, 0.95) 0%, rgba(213, 232, 247, 0.95) 100%)',
        padding: '0 50px',
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
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleNavigation('/')}
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
          color: 'var(--chem-purple-dark, #8a6db8)',
          fontWeight: 700
        }}>
          AI Chemistry Hub
        </Title>
      </div>

      {/* 2. Menu Điều hướng Chính - Chemistry Themed */}
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

      {/* 4. Mục Tài khoản và Dropdown - Chemistry Themed */}
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
    </Header>
  );
};

export default AppHeader;