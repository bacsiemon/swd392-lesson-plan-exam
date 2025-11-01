import React from 'react';
import { Card, Col, Typography, Button, Space } from 'antd';

const { Title } = Typography;

const ToolCard = ({ title, description, icon, link, color, onToolClick }) => (
  <Col xs={24} sm={12} lg={8} style={{ marginBottom: 24 }}>
    <Card
      hoverable
      onClick={() => onToolClick(link)}
      style={{
        height: '100%',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        borderLeft: `4px solid ${color}`,
        transition: 'all 0.3s ease',
        transform: 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Title level={4} style={{ margin: 0, marginLeft: 16, color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            {title}
          </Title>
        </div>
        <p style={{ minHeight: 40, color: 'rgba(255, 255, 255, 0.8)' }}>{description}</p>
        <Button
          type="primary"
          size="large"
          style={{ 
            backgroundColor: color, 
            borderColor: color,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          Bắt đầu Ngay
        </Button>
      </Space>
    </Card>
  </Col>
);

export default ToolCard;
