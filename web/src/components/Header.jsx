// web/src/components/Header.jsx
import React from 'react';
import { Layout, Typography, Dropdown, Menu, Space, Avatar, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  BookOutlined,
  HomeOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;
const accountMenu = (
  <Menu
    onClick={({ key }) => {
      if (key === 'logout') {
        console.log('Đăng xuất...');
      } else {
        console.log(`Chuyển hướng đến: ${key}`);
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

const AppHeader = ({ userName = 'Giáo viên Hóa học' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const accountMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === 'logout') {
          console.log('Đăng xuất...');
          navigate('/login');
        } else if (key === 'dashboard') {
          navigate('/dashboard');
        } else {
          console.log(`Chuyển hướng đến: ${key}`);
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
    }
  ];

  return (
    <Header style={{
      background: '#fff',
      padding: '0 50px',
      borderBottom: '1px solid #e8e8e8',
      height: 64,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* 1. Logo/Tên Ứng Dụng và Navigation */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" style={{ marginRight: 32 }}>
          <Title level={3} style={{ margin: 0, lineHeight: '64px', color: '#1890ff' }}>
            🧪 AI Chemistry Hub
          </Title>
        </div>

        {/* Navigation Menu */}
        <Space size="large">
          {menuItems.map(item => (
            <Button
              key={item.key}
              type={location.pathname === item.key ? 'primary' : 'text'}
              icon={item.icon}
              onClick={() => navigate(item.key)}
              style={{
                height: 40,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {item.label}
            </Button>
          ))}
        </Space>
      </div>

      {/* 2. Mục Tài khoản và Dropdown */}
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