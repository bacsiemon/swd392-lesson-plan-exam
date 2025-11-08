import React from 'react';
import { Card, Typography } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProfileHeaderCard = () => {
  return (
    <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
      <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8 }}>
        <ExperimentOutlined /> Hồ Sơ Cá Nhân
      </Title>
      <Text className="chemistry-subtitle" style={{ fontSize: 16 }}>
        Quản lý thông tin cá nhân và cài đặt tài khoản
      </Text>
    </Card>
  );
};

export default ProfileHeaderCard;

