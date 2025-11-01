import React from 'react';
import { Layout, Space, Typography } from 'antd';
import { GithubOutlined, LinkedinOutlined } from '@ant-design/icons';

const { Footer } = Layout;
const { Link } = Typography;

const AppFooter = () => {
  return (
    <Footer style={{ 
        textAlign: 'center', 
        backgroundColor: '#f0f2f5', 
        padding: '24px 50px' 
    }}>
     
      <p style={{ marginBottom: 8, color: '#595959' }}>
        AI Chemistry Hub ©{new Date().getFullYear()} Created by Your Team
      </p>
      
      
      <Space size="large">
        <Link href="#" target="_blank" style={{ color: '#001529' }}>
          Điều khoản dịch vụ
        </Link>
        <Link href="#" target="_blank" style={{ color: '#001529' }}>
          Chính sách bảo mật
        </Link>
        <Link href="https://github.com/bacsiemon/swd392-lesson-plan-exam" target="_blank" style={{ color: '#001529' }}>
          <GithubOutlined style={{ fontSize: '18px' }} />
        </Link>
      </Space>
    </Footer>
  );
};

export default AppFooter;