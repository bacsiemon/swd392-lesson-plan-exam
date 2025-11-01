import React from 'react';
import { Card, Statistic } from 'antd';

const StatCard = ({ title, value, suffix, icon, color }) => (
  <Card
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
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
      {icon}
      <span style={{ 
        marginLeft: 12, 
        color: 'rgba(255, 255, 255, 0.9)', 
        fontSize: '16px',
        fontWeight: 500
      }}>
        {title}
      </span>
    </div>
    <Statistic
      value={value}
      suffix={suffix}
      valueStyle={{ color: color, textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
    />
  </Card>
);

export default StatCard;