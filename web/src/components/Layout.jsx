import React from 'react';
import { Layout } from 'antd';
import AppHeader from './Header'; 
import AppFooter from './Footer'; 

const { Content } = Layout;

/**
 * @param {object} props 
 */
const AppLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      {/* 1. Header Chung */}
      <AppHeader /> 
      
      {/* 2. Phần Nội dung */}
      <Content style={{ padding: '0', margin: '0', width: '100%' }}>
        {children}
      </Content>
      
      {/* 3. Footer Chung */}
      <AppFooter />
      
    </Layout>
  );
};

export default AppLayout;