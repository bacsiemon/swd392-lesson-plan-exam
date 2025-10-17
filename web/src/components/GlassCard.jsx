import React from 'react';
import { Card } from 'antd';

const GlassCard = ({ children, style = {}, ...props }) => (
  <Card
    style={{
      borderRadius: 16,
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      ...style
    }}
    {...props}
  >
    {children}
  </Card>
);

export default GlassCard;
