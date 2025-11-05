import React from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Button } from 'antd';

const { TextArea } = Input;

const ExamMatrixForm = ({
  visible,
  editingRecord,
  form,
  submitting,
  onCancel,
  onSubmit
}) => {
  return (
    <Modal
      className="chemistry-modal"
      title={editingRecord ? 'Chỉnh sửa ma trận đề' : 'Tạo ma trận đề mới'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          className="chemistry-btn-primary"
          loading={submitting}
          onClick={onSubmit}
        >
          {editingRecord ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      ]}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: '20px' }}
      >
        <Form.Item
          label="Tên ma trận đề"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên ma trận đề' },
            { max: 255, message: 'Tên ma trận đề không được vượt quá 255 ký tự' }
          ]}
        >
          <Input placeholder="Ví dụ: Chemistry Grade 10 Exam" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea
            rows={4}
            placeholder="Ví dụ: Random exam matrix for chemistry"
          />
        </Form.Item>

        {/* Hidden teacherId field - automatically filled from token */}
        <Form.Item
          name="teacherId"
          hidden
          rules={[
            { required: true, message: 'Teacher ID là bắt buộc' },
            { type: 'number', message: 'Teacher ID phải là số' }
          ]}
        >
          <InputNumber style={{ display: 'none' }} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tổng số câu hỏi"
              name="totalQuestions"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="50"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tổng điểm"
              name="totalPoints"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="100"
                min={0}
                step={0.1}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ExamMatrixForm;
