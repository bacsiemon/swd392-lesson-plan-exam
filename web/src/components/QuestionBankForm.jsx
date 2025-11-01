import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import {
  BookOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  CHEMISTRY_GRADES,
  CHEMISTRY_TOPICS,
  VALIDATION_RULES
} from '../constants/questionBankConstants';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const QuestionBankForm = ({ initialValues, onSubmit, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  const [selectedGrade, setSelectedGrade] = useState(initialValues?.gradeLevel);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeChange = (gradeLevel) => {
    setSelectedGrade(gradeLevel);
    // Reset topic when grade changes
    form.setFieldsValue({ topic: undefined });
  };

  const getTopicsForGrade = (gradeLevel) => {
    return CHEMISTRY_TOPICS[gradeLevel] || [];
  };

  const isEditMode = !!initialValues;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <BookOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={3} style={{ margin: 0 }}>
            {isEditMode ? 'Chỉnh sửa ngân hàng câu hỏi' : 'Tạo ngân hàng câu hỏi mới'}
          </Title>
          <Text type="secondary">
            {isEditMode
              ? 'Cập nhật thông tin ngân hàng câu hỏi Hóa học'
              : 'Tạo ngân hàng câu hỏi Hóa học cho các lớp từ 8-12'
            }
          </Text>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
          requiredMark={false}
          size="large"
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <Text strong>Tên ngân hàng câu hỏi</Text>
                    <Text type="secondary"> *</Text>
                  </span>
                }
                name="name"
                rules={[
                  VALIDATION_RULES.questionBankName.required,
                  VALIDATION_RULES.questionBankName.minLength,
                  VALIDATION_RULES.questionBankName.maxLength
                ]}
              >
                <Input
                  placeholder="Ví dụ: Ngân hàng câu hỏi Hóa học 10 - Nguyên tử"
                  showCount
                  maxLength={200}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    <Text strong>Lớp học</Text>
                    <Text type="secondary"> *</Text>
                  </span>
                }
                name="gradeLevel"
                rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
              >
                <Select
                  placeholder="Chọn lớp học"
                  onChange={handleGradeChange}
                  disabled={isEditMode} // Không cho phép thay đổi lớp khi edit
                >
                  {CHEMISTRY_GRADES.map(grade => (
                    <Option key={grade.value} value={grade.value}>
                      <BookOutlined style={{ marginRight: 8 }} />
                      {grade.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    <Text strong>Chủ đề</Text>
                    <Text type="secondary"> *</Text>
                  </span>
                }
                name="topic"
                rules={[{ required: true, message: 'Vui lòng chọn chủ đề' }]}
              >
                <Select
                  placeholder={selectedGrade ? "Chọn chủ đề" : "Chọn lớp học trước"}
                  disabled={!selectedGrade}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {getTopicsForGrade(selectedGrade).map((topic, index) => (
                    <Option key={index} value={topic}>
                      {topic}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <Text strong>Mô tả chi tiết</Text>
                    <Text type="secondary"> *</Text>
                  </span>
                }
                name="description"
                rules={[
                  VALIDATION_RULES.description.required,
                  VALIDATION_RULES.description.minLength,
                  VALIDATION_RULES.description.maxLength
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả nội dung, mục đích và phạm vi của ngân hàng câu hỏi này. Ví dụ: Tập trung vào các khái niệm cơ bản về cấu tạo nguyên tử, bao gồm electron, proton, neutron..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          {!isEditMode && (
            <Alert
              message="Thông tin quan trọng"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 16 }}>
                  <li>Ngân hàng câu hỏi sẽ ở trạng thái "Chờ duyệt" sau khi tạo</li>
                  <li>Bạn có thể thêm câu hỏi vào ngân hàng ngay sau khi tạo thành công</li>
                  <li>Chọn chủ đề phù hợp để dễ dàng quản lý và tìm kiếm</li>
                  <li>Tên và mô tả nên rõ ràng, chi tiết để dễ phân biệt</li>
                </ul>
              }
              type="info"
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space size="large">
              <Button
                onClick={onCancel}
                size="large"
                disabled={submitting}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting || loading}
                size="large"
                icon={<BookOutlined />}
              >
                {isEditMode ? 'Cập nhật ngân hàng' : 'Tạo ngân hàng'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default QuestionBankForm;