import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Alert, Space, Typography } from 'antd';
import { RobotOutlined, BookOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

/**
 * Modal để nhập thông tin tạo giáo án với AI
 */
const AIGenerateModal = ({ visible, onCancel, onGenerate, loading }) => {
  const [form] = Form.useForm();
  const [estimatedTime, setEstimatedTime] = useState(0);

  // Tính toán thời gian ước tính khi số tiết thay đổi
  const handleSlotsChange = (value) => {
    if (value) {
      // Ước tính 2-3 giây cho mỗi tiết
      setEstimatedTime(Math.ceil(value * 2.5));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onGenerate(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEstimatedTime(0);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span>Tạo Giáo Án với AI (Gemini 2.5 Flash)</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<RobotOutlined />}
          onClick={handleSubmit}
          loading={loading}
        >
          {loading ? 'Đang tạo...' : 'Tạo với AI'}
        </Button>
      ]}
    >
      <Alert
        message="Hướng dẫn sử dụng"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            Nhập mô tả chi tiết về nội dung giáo án bạn muốn tạo. AI sẽ tự động tạo giáo án đầy đủ 
            bao gồm: mục tiêu, nội dung chi tiết từng tiết, hoạt động dạy học, thiết bị cần thiết, 
            và câu hỏi ôn tập.
          </Paragraph>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          numberOfSlots: 3,
          durationMinutesPerSlot: 45,
          gradeLevel: 10
        }}
      >
        <Form.Item
          name="prompt"
          label={
            <Space>
              <FileTextOutlined />
              <span>Mô tả nội dung giáo án</span>
            </Space>
          }
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả nội dung giáo án' },
            { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
            { max: 2000, message: 'Mô tả không được vượt quá 2000 ký tự' }
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Ví dụ: Tạo bài học về phản ứng Este hóa trong Hóa học hữu cơ, bao gồm lý thuyết, thí nghiệm, và bài tập thực hành"
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item
          name="gradeLevel"
          label={
            <Space>
              <BookOutlined />
              <span>Lớp học</span>
            </Space>
          }
          rules={[
            { required: true, message: 'Vui lòng chọn lớp học' },
            { type: 'number', min: 8, max: 12, message: 'Lớp học phải từ 8 đến 12' }
          ]}
        >
          <InputNumber
            min={8}
            max={12}
            style={{ width: '100%' }}
            placeholder="Chọn lớp (8-12)"
          />
        </Form.Item>

        <Form.Item
          name="numberOfSlots"
          label={
            <Space>
              <ClockCircleOutlined />
              <span>Số tiết học</span>
            </Space>
          }
          rules={[
            { required: true, message: 'Vui lòng nhập số tiết học' },
            { type: 'number', min: 1, max: 60, message: 'Số tiết phải từ 1 đến 60' }
          ]}
        >
          <InputNumber
            min={1}
            max={60}
            style={{ width: '100%' }}
            placeholder="Số tiết học (1-60)"
            onChange={handleSlotsChange}
          />
        </Form.Item>

        <Form.Item
          name="durationMinutesPerSlot"
          label="Thời lượng mỗi tiết (phút)"
          rules={[
            { required: true, message: 'Vui lòng nhập thời lượng' },
            { type: 'number', min: 1, max: 240, message: 'Thời lượng phải từ 1 đến 240 phút' }
          ]}
        >
          <InputNumber
            min={1}
            max={240}
            style={{ width: '100%' }}
            placeholder="Thời lượng (1-240 phút)"
          />
        </Form.Item>

        {estimatedTime > 0 && (
          <Alert
            message={`Thời gian ước tính: ${estimatedTime} giây`}
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Form>

      <Alert
        message="Lưu ý"
        description={
          <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li>AI sẽ tạo nội dung bằng tiếng Việt, phù hợp với chương trình Bộ GD&ĐT</li>
            <li>Kết quả sẽ được tải về dưới dạng file Word (.docx)</li>
            <li>Bạn có thể chỉnh sửa nội dung sau khi tải về</li>
            <li>Quá trình tạo có thể mất vài giây đến vài phút tùy số tiết</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default AIGenerateModal;
