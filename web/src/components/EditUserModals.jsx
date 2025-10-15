import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space } from 'antd';

const { Option } = Select;

const EditUserModal = ({ visible, user, onEdit, onCancel }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleFormSubmit = (values) => {
    onEdit(values);
  };

  return (
    <Modal
      title="Chỉnh sửa thông tin tài khoản"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
      >
        <Form.Item name="name" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
          <Select>
            <Option value="teacher">Giáo viên</Option>
            <Option value="student">Học sinh</Option>
          </Select>
        </Form.Item>
        <Form.Item style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
