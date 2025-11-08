import React from 'react';
import { Row, Col, Typography } from 'antd';
import { MailOutlined, PhoneOutlined, CalendarOutlined, HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProfileDetailsSection = ({ profile }) => {
  const isStudent = profile.role === 'Student' || profile.role === 'student' || profile.role === 2;

  return (
    <div className="profile-details">
      <Title level={4} className="section-title">Thông Tin Chi Tiết</Title>

      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12}>
          <div className="info-item">
            <div className="info-label">
              <MailOutlined className="info-icon" />
              <span>Email</span>
            </div>
            <Text className="info-value" copyable>
              {profile.email}
            </Text>
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="info-item">
            <div className="info-label">
              <PhoneOutlined className="info-icon" />
              <span>Số điện thoại</span>
            </div>
            <Text className="info-value" copyable>
              {profile.phone || 'Chưa cập nhật'}
            </Text>
          </div>
        </Col>

        {profile.date_of_birth && (
          <Col xs={24} sm={12}>
            <div className="info-item">
              <div className="info-label">
                <CalendarOutlined className="info-icon" />
                <span>Ngày sinh</span>
              </div>
              <Text className="info-value">
                {new Date(profile.date_of_birth).toLocaleDateString('vi-VN')}
              </Text>
            </div>
          </Col>
        )}

        {profile.school_name && (
          <Col xs={24}>
            <div className="info-item">
              <div className="info-label">
                <HomeOutlined className="info-icon" />
                <span>{isStudent ? 'Trường học' : 'Trường công tác'}</span>
              </div>
              <Text className="info-value">
                {profile.school_name}
              </Text>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ProfileDetailsSection;

