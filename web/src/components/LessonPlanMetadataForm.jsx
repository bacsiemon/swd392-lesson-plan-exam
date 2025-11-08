import React from 'react';
import { Card, Row, Col, Input, InputNumber, Button, Typography } from 'antd';

const { Text } = Typography;

const LessonPlanMetadataForm = ({ document, onMetadataChange, onHide }) => {
  return (
    <Card style={{ marginBottom: 16 }} title="Thông tin giáo án">
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Text strong>Mục tiêu bài học *</Text>
          <Input.TextArea
            rows={3}
            placeholder="Nhập mục tiêu bài học..."
            value={document?.objectives || ''}
            onChange={(e) => onMetadataChange('objectives', e.target.value)}
            style={{ marginTop: 8 }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Mô tả *</Text>
          <Input.TextArea
            rows={3}
            placeholder="Nhập mô tả bài học..."
            value={document?.description || ''}
            onChange={(e) => onMetadataChange('description', e.target.value)}
            style={{ marginTop: 8 }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Khối lớp *</Text>
          <InputNumber
            min={1}
            max={12}
            placeholder="Khối lớp"
            value={document?.gradeLevel || 1}
            onChange={(value) => onMetadataChange('gradeLevel', value || 1)}
            style={{ width: '100%', marginTop: 8 }}
          />
        </Col>
        <Col xs={24} sm={16}>
          <Text strong>URL ảnh (tùy chọn)</Text>
          <Input
            placeholder="https://example.com/image.jpg"
            value={document?.imageUrl || ''}
            onChange={(e) => onMetadataChange('imageUrl', e.target.value)}
            style={{ marginTop: 8 }}
          />
        </Col>
        <Col xs={24}>
          <Button type="link" onClick={onHide}>Ẩn thông tin</Button>
        </Col>
      </Row>
    </Card>
  );
};

export default LessonPlanMetadataForm;

