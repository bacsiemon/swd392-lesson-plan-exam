import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';

const UserStats = ({ totalUsers, totalTeachers, totalStudents }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={8}>
        <Card className="admin-stat-card">
          <Statistic
            className="admin-stat"
            title="Tổng người dùng"
            value={totalUsers}
            prefix={<UserOutlined style={{ color: 'var(--admin-red)' }} />}
            valueStyle={{ color: 'var(--admin-red-dark)', fontWeight: 700 }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card className="admin-stat-card">
          <Statistic
            className="admin-stat"
            title="Giáo viên"
            value={totalTeachers}
            prefix={<BookOutlined style={{ color: 'var(--admin-orange)' }} />}
            valueStyle={{ color: 'var(--admin-orange-dark)', fontWeight: 700 }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card className="admin-stat-card">
          <Statistic
            className="admin-stat"
            title="Học sinh"
            value={totalStudents}
            prefix={<TeamOutlined style={{ color: 'var(--admin-red)' }} />}
            valueStyle={{ color: 'var(--admin-red-dark)', fontWeight: 700 }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default UserStats;
