import React, { useState, useEffect } from 'react';
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
  Alert,
  Radio,
  Checkbox,
  InputNumber,
  Tag
} from 'antd';
import {
  QuestionCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  VALIDATION_RULES
} from '../constants/questionBankConstants';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const QuestionForm = ({ initialValues, onSubmit, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState(initialValues?.questionTypeEnum ?? 0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      // Parse additionalData if editing
      try {
        const additionalData = typeof initialValues.additionalData === 'string'
          ? JSON.parse(initialValues.additionalData)
          : initialValues.additionalData;

        form.setFieldsValue({
          ...initialValues,
          ...additionalData
        });
      } catch (error) {
        console.error('Error parsing additional data:', error);
      }
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Prepare data based on question type
      let additionalData = {};

      if (questionType === 0) { // Multiple Choice
        additionalData = {
          answers: values.answers || [],
          explanation: values.explanation || ''
        };
      } else if (questionType === 1) { // Fill Blank
        additionalData = {
          blanks: values.blanks || [],
          explanation: values.explanation || ''
        };
      }

      const submitData = {
        title: values.title,
        content: values.content,
        questionTypeEnum: questionType,
        questionDifficultyId: values.questionDifficultyId,
        additionalData: JSON.stringify(additionalData)
      };

      await onSubmit(submitData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    // Reset type-specific fields
    form.setFieldsValue({
      answers: undefined,
      blanks: undefined,
      explanation: ''
    });
  };

  const isEditMode = !!initialValues;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <QuestionCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={3} style={{ margin: 0 }}>
            {isEditMode ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
          </Title>
          <Text type="secondary">
            {isEditMode
              ? 'Cập nhật thông tin câu hỏi Hóa học'
              : 'Tạo câu hỏi Hóa học cho ngân hàng câu hỏi'
            }
          </Text>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          size="large"
        >
          {/* Basic Information */}
          <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  label={
                    <span>
                      <Text strong>Tiêu đề câu hỏi</Text>
                      <Text type="secondary"> *</Text>
                    </span>
                  }
                  name="title"
                  rules={[
                    VALIDATION_RULES.questionTitle.required,
                    VALIDATION_RULES.questionTitle.minLength,
                    VALIDATION_RULES.questionTitle.maxLength
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: Cấu tạo nguyên tử Carbon"
                    showCount
                    maxLength={200}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  label={
                    <span>
                      <Text strong>Nội dung câu hỏi</Text>
                      <Text type="secondary"> *</Text>
                    </span>
                  }
                  name="content"
                  rules={[
                    VALIDATION_RULES.questionContent.required,
                    VALIDATION_RULES.questionContent.minLength,
                    VALIDATION_RULES.questionContent.maxLength
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Nhập nội dung chi tiết của câu hỏi..."
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      <Text strong>Loại câu hỏi</Text>
                      <Text type="secondary"> *</Text>
                    </span>
                  }
                  name="questionTypeEnum"
                  rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi' }]}
                  initialValue={0}
                >
                  <Select
                    placeholder="Chọn loại câu hỏi"
                    onChange={handleQuestionTypeChange}
                    disabled={isEditMode} // Không cho phép thay đổi loại khi edit
                  >
                    {QUESTION_TYPES.map(type => (
                      <Option key={type.value} value={type.value}>
                        <Tag color={type.value === 0 ? 'blue' : 'green'}>
                          {type.label}
                        </Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      <Text strong>Độ khó</Text>
                      <Text type="secondary"> *</Text>
                    </span>
                  }
                  name="questionDifficultyId"
                  rules={[{ required: true, message: 'Vui lòng chọn độ khó' }]}
                >
                  <Select placeholder="Chọn độ khó">
                    {DIFFICULTY_LEVELS.map(level => (
                      <Option key={level.value} value={level.value}>
                        <Tag color={level.color}>{level.label}</Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Question Type Specific Fields */}
          {questionType === 0 && ( // Multiple Choice
            <Card title="Các lựa chọn trả lời" style={{ marginBottom: 24 }}>
              <Form.List
                name="answers"
                rules={[
                  {
                    validator: async (_, answers) => {
                      if (!answers || answers.length < 2) {
                        return Promise.reject(new Error('Cần ít nhất 2 lựa chọn'));
                      }
                      if (answers.length > 6) {
                        return Promise.reject(new Error('Tối đa 6 lựa chọn'));
                      }
                      const correctAnswers = answers.filter(answer => answer?.isCorrect);
                      if (correctAnswers.length !== 1) {
                        return Promise.reject(new Error('Phải có đúng 1 đáp án đúng'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map((field, index) => (
                      <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Text strong>{String.fromCharCode(65 + index)}.</Text>
                        <Form.Item
                          {...field}
                          name={[field.name, 'text']}
                          rules={[{ required: true, message: 'Nhập nội dung đáp án' }]}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input placeholder="Nội dung đáp án" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'isCorrect']}
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox>Đáp án đúng</Checkbox>
                        </Form.Item>
                        {fields.length > 2 && (
                          <MinusCircleOutlined onClick={() => remove(field.name)} />
                        )}
                      </Space>
                    ))}
                    {fields.length < 6 && (
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add({ text: '', isCorrect: false })}
                          block
                          icon={<PlusOutlined />}
                        >
                          Thêm lựa chọn
                        </Button>
                      </Form.Item>
                    )}
                    <Form.ErrorList errors={errors} />
                  </>
                )}
              </Form.List>
            </Card>
          )}

          {questionType === 1 && ( // Fill Blank
            <Card title="Các chỗ trống cần điền" style={{ marginBottom: 24 }}>
              <Alert
                message="Hướng dẫn"
                description="Trong nội dung câu hỏi, sử dụng dấu gạch dưới _____ để đánh dấu chỗ trống. Sau đó cung cấp đáp án đúng cho từng chỗ trống."
                type="info"
                style={{ marginBottom: 16 }}
              />

              <Form.List
                name="blanks"
                rules={[
                  {
                    validator: async (_, blanks) => {
                      if (!blanks || blanks.length < 1) {
                        return Promise.reject(new Error('Cần ít nhất 1 chỗ trống'));
                      }
                      if (blanks.length > 5) {
                        return Promise.reject(new Error('Tối đa 5 chỗ trống'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map((field, index) => (
                      <Row key={field.key} gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={4}>
                          <Text strong>Chỗ trống {index + 1}:</Text>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'correctAnswer']}
                            rules={[{ required: true, message: 'Nhập đáp án đúng' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Đáp án đúng" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'alternatives']}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              mode="tags"
                              placeholder="Đáp án thay thế (tùy chọn)"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          {fields.length > 1 && (
                            <MinusCircleOutlined onClick={() => remove(field.name)} />
                          )}
                        </Col>
                      </Row>
                    ))}
                    {fields.length < 5 && (
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add({ correctAnswer: '', alternatives: [] })}
                          block
                          icon={<PlusOutlined />}
                        >
                          Thêm chỗ trống
                        </Button>
                      </Form.Item>
                    )}
                    <Form.ErrorList errors={errors} />
                  </>
                )}
              </Form.List>
            </Card>
          )}

          {/* Explanation */}
          <Card title="Giải thích đáp án" style={{ marginBottom: 24 }}>
            <Form.Item
              label="Giải thích chi tiết (tùy chọn)"
              name="explanation"
            >
              <TextArea
                rows={3}
                placeholder="Giải thích tại sao đáp án này đúng, cung cấp thêm thông tin để học sinh hiểu rõ hơn..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Card>

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
                icon={<QuestionCircleOutlined />}
              >
                {isEditMode ? 'Cập nhật câu hỏi' : 'Tạo câu hỏi'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default QuestionForm;