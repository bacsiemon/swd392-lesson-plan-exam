import React from 'react';
import { Modal, Form, Input, Select, Button, Space } from 'antd';

const { Option } = Select;

const AddUserModal = ({ visible, onAdd, onCancel }) => {
  const [form] = Form.useForm();

  const handleFormSubmit = (values) => {
    onAdd(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Thêm tài khoản mới"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        initialValues={{ role: 'student' }}
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
            <Button type="primary" htmlType="submit">Tạo tài khoản</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;