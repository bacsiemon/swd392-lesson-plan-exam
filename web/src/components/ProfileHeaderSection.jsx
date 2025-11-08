import React from 'react';
import { Avatar, Row, Col, Typography, Button, Space, Upload } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined, CameraOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ProfileHeaderSection = ({ profile, uploading, onEdit, onChangePassword, onAvatarChange }) => {
  const uploadButton = (
    <div className="avatar-upload-button">
      {uploading ? <LoadingOutlined /> : <CameraOutlined />}
      <div style={{ marginTop: 8, fontSize: '12px' }}>
        {uploading ? 'Đang tải...' : 'Thay đổi'}
      </div>
    </div>
  );

  return (
    <div className="profile-header-section">
      <Row gutter={24} align="middle">
        <Col xs={24} sm={8} md={6} className="avatar-section">
          <div className="avatar-container">
            <Avatar
              size={120}
              src={profile.avatar_url}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
            <Upload
              name="avatar"
              listType="picture"
              className="avatar-uploader"
              showUploadList={false}
              action="/api/upload"
              beforeUpload={() => false}
              onChange={onAvatarChange}
            >
              {uploadButton}
            </Upload>
          </div>
        </Col>

        <Col xs={24} sm={16} md={18}>
          <div className="basic-info">
            <Title level={3} className="profile-name">
              {profile.full_name}
            </Title>
            <Paragraph className="profile-bio" ellipsis={{ rows: 2, expandable: true }}>
              {profile.bio}
            </Paragraph>
          </div>
        </Col>
      </Row>

      <div className="action-buttons">
        <Space>
          <Button
            type="primary"
            className="chemistry-btn-primary"
            icon={<EditOutlined />}
            onClick={onEdit}
            size="large"
          >
            Chỉnh sửa hồ sơ
          </Button>
          <Button
            icon={<LockOutlined />}
            onClick={onChangePassword}
            size="large"
          >
            Đổi mật khẩu
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ProfileHeaderSection;

