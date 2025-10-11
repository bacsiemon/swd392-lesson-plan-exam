// web/src/components/Header.jsx
import React from 'react';
import { Layout, Typography, Dropdown, Menu, Space, Avatar } from 'antd';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined
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

const AppHeader = ({ userName = 'Giáo viên A' }) => {
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
      {/* 1. Logo/Tên Ứng Dụng  */}
      <div className="logo">
        <Title level={3} style={{ margin: 0, lineHeight: '64px', color: '#001529' }}>
          🧪 AI Chemistry Hub
        </Title>
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