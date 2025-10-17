import React from 'react';
import { Statistic } from 'antd';
import GlassCard from './GlassCard';

const StatCard = ({ title, value, icon, color, suffix }) => (
  <GlassCard style={{ textAlign: 'center' }}>
    <Statistic
      title={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{title}</span>}
      value={value}
      prefix={icon}
      suffix={suffix}
      valueStyle={{ color: color, textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
    />
  </GlassCard>
);

export default StatCard;
