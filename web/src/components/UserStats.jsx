import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';

const UserStats = ({ totalUsers, totalTeachers, totalStudents }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={8}>
        <Card>
          <Statistic
            title="Tổng người dùng"
            value={totalUsers}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="Giáo viên"
            value={totalTeachers}
            prefix={<BookOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="Học sinh"
            value={totalStudents}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default UserStats;
