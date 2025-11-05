import React from 'react';
import { Card, Row, Col, Button, Space, Typography } from 'antd';
import { ExperimentOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ExamMatrixHeader = ({ onCreate }) => {
  const navigate = useNavigate();

  return (
    <Card className="chemistry-header-card" style={{ marginBottom: '24px' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ExperimentOutlined style={{ fontSize: 32, marginRight: 16 }} />
            <div>
              <Title level={2} className="chemistry-title" style={{ margin: 0 }}>
                Quản lý Ma trận Đề thi
              </Title>
              <Text className="chemistry-subtitle" style={{ fontSize: '16px' }}>
                Tạo và quản lý ma trận đề thi hóa học
              </Text>
            </div>
          </div>
        </Col>
        <Col>
          <Space>
            <Button
              onClick={() => navigate('/dashboard')}
              size="large"
              style={{ height: 48, fontSize: '16px' }}
            >
              Quay lại Dashboard
            </Button>
            <Button
              type="primary"
              className="chemistry-btn-primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              size="large"
              style={{ height: 48, fontSize: '16px' }}
            >
              Tạo ma trận đề
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default ExamMatrixHeader;
