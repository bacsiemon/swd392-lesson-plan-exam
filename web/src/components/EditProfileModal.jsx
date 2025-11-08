import React from 'react';
import { Modal, Form, Input, Row, Col, Button, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const EditProfileModal = ({ open, form, profile, onCancel, onSave }) => {
  const isStudent = profile?.role === 'Student' || profile?.role === 'student' || profile?.role === 2;

  return (
    <Modal
      className="chemistry-modal"
      title="Chỉnh sửa hồ sơ"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
        className="edit-profile-form"
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="full_name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="date_of_birth"
              label="Ngày sinh"
            >
              <Input
                type="date"
                placeholder="Chọn ngày sinh"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="school_name"
              label={isStudent ? 'Trường học' : 'Trường công tác'}
            >
              <Input placeholder={isStudent ? 'Nhập tên trường học' : 'Nhập tên trường công tác'} />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="bio"
              label="Giới thiệu bản thân"
            >
              <Input.TextArea
                rows={4}
                placeholder="Giới thiệu về bản thân..."
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="form-actions">
          <Space>
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button type="primary" className="chemistry-btn-primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu thay đổi
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;

