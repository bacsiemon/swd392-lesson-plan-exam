import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserManagementHeader = ({ onAddUser }) => {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ fontSize: 32, color: '#1890ff', marginRight: 16 }} />
            <div>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                Quản lý Người dùng
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Quản lý tài khoản giáo viên và học sinh trong hệ thống
              </Text>
            </div>
          </div>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddUser}
            size="large"
            style={{ height: 48, fontSize: '16px' }}
          >
            Thêm người dùng mới
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default UserManagementHeader;
