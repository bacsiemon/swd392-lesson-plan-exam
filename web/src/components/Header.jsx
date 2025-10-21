import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Assets/Logo.png';
import { Layout, Typography, Dropdown, Menu, Space, Avatar } from 'antd';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  BookOutlined,
  HomeOutlined,
  TableOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;
const AppHeader = ({ userName = 'Giáo viên Hóa học' }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  // 1. Định nghĩa menu cho Dropdown Tài khoản
  const accountMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === 'logout') {
          console.log('Đăng xuất...');
          navigate('/login');
        } else if (key === 'dashboard') {
          navigate('/dashboard');
        } else {
          // Xử lý các key khác như 'profile', 'settings'
          navigate(`/${key}`);
        }
      }}
      items={[
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Hồ sơ cá nhân',
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Cài đặt hệ thống',
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

  // 2. Định nghĩa menu điều hướng chính
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Trang chủ'
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/question-banks',
      icon: <BookOutlined />,
      label: 'Ngân hàng câu hỏi'
    },
    {
      key: '/exam-matrix',
      icon: <TableOutlined />,
      label: 'Ma trận đề'
    },
    {
      key: '/manage-tests',
      icon: <TableOutlined />,
      label: 'Quản lý đề kiểm tra'
    }
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 50px',
        borderBottom: '1px solid #e8e8e8',
        height: 64,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {/* 1. Logo/Tên Ứng Dụng */}
      <div 
        className="logo" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '64px', 
          cursor: 'pointer',
          transition: 'opacity 0.3s'
        }}
        onClick={() => navigate('/')}
        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
      >
        <img src={Logo} alt="Logo" style={{ height: '64px', marginRight: 16 }} />
        <Title level={3} style={{ margin: 0, lineHeight: '64px', color: '#001529' }}>
          AI Chemistry Hub
        </Title>
      </div>

      {/* 2. Menu Điều hướng Chính */}
      <Menu
        theme="light"
        mode="horizontal"
        // Lấy key đang active từ URL (ví dụ: /dashboard)
        selectedKeys={[location.pathname]} 
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ flexGrow: 1, minWidth: 0, borderBottom: 'none', lineHeight: '62px', justifyContent: 'center' }}
      />
      

      {/* 3. Mục Tài khoản và Dropdown */}
      <Dropdown overlay={accountMenu} trigger={['click']} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          {/* Avatar của người dùng */}
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          {/* Tên người dùng */}
          <span style={{ color: '#001529', fontWeight: 500 }}>
            {userName}
          </span>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;