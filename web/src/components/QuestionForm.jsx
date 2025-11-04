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
  VALIDATION_RULES
} from '../constants/questionBankConstants';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const QuestionForm = ({ initialValues, onSubmit, onCancel, loading = false, questionBankId }) => {
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

        // Map backend response to form format
        // Backend returns: { Id, Title, Content, QuestionTypeEnum, MultipleChoiceAnswers, FillBlankAnswers, ... }
        const formData = {
          questionBankId: questionBankId || initialValues.questionBankId || initialValues.QuestionBankId || null, // Set questionBankId from prop or initialValues
          title: initialValues.title || initialValues.Title || '',
          content: initialValues.content || initialValues.Content || '',
          questionTypeEnum: initialValues.questionTypeEnum !== undefined 
            ? initialValues.questionTypeEnum 
            : (initialValues.QuestionTypeEnum !== undefined ? initialValues.QuestionTypeEnum : 0),
          questionDifficultyId: initialValues.questionDifficultyId !== undefined && initialValues.questionDifficultyId !== null
            ? initialValues.questionDifficultyId
            : (initialValues.QuestionDifficultyId !== undefined && initialValues.QuestionDifficultyId !== null
                ? initialValues.QuestionDifficultyId
                : null),
          explanation: additionalData?.explanation || initialValues.explanation || ''
        };

        // Map MultipleChoice answers
        const mcAnswers = initialValues.multipleChoiceAnswers || initialValues.MultipleChoiceAnswers || [];
        if (mcAnswers.length > 0) {
          formData.answers = mcAnswers.map(answer => ({
            text: answer.answerText || answer.text || answer.AnswerText || '',
            isCorrect: answer.isCorrect !== undefined ? answer.isCorrect : (answer.IsCorrect !== undefined ? answer.IsCorrect : false),
            explanation: answer.explanation || answer.Explanation || ''
          }));
        }

        // Map FillBlank answers
        const fbAnswers = initialValues.fillBlankAnswers || initialValues.FillBlankAnswers || [];
        if (fbAnswers.length > 0) {
          formData.blanks = fbAnswers.map(blank => ({
            correctAnswer: blank.correctAnswer || blank.CorrectAnswer || '',
            normalizedCorrectAnswer: blank.normalizedCorrectAnswer || blank.NormalizedCorrectAnswer || '',
            explanation: blank.explanation || blank.Explanation || ''
          }));
        }

        form.setFieldsValue(formData);
        setQuestionType(formData.questionTypeEnum);
      } catch (error) {
        console.error('Error parsing initial values:', error);
      }
    } else {
      // Reset form when no initial values (creating new)
      // Always set questionBankId from prop when creating new question
      form.resetFields();
      // Always set questionBankId when creating new question - ensure it's set in form values
      if (questionBankId) {
        form.setFieldsValue({ 
          questionBankId: questionBankId,
          questionTypeEnum: 0
        });
      } else {
        // If no questionBankId prop, still set questionTypeEnum
        form.setFieldsValue({ 
          questionTypeEnum: 0
        });
      }
      setQuestionType(0);
      
      // Log to debug
      console.log('QuestionForm - Creating new question:', {
        questionBankId: questionBankId,
        formValues: form.getFieldsValue()
      });
    }
  }, [initialValues, form, questionBankId]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Prepare data based on question type - format for backend API
      // Backend expects: questionBankId, title, content, questionTypeEnum, questionDifficultyId?, additionalData?, multipleChoiceAnswers?, fillBlankAnswers?
      // Backend repository converts additionalData: if null/empty -> "{}", otherwise use as JSON string
      
      // Get questionBankId from form values first, then fallback to prop, then initialValues
      // Priority: form values > prop > initialValues
      // Form values should always have questionBankId if it was set properly
      let questionBankIdValue = values.questionBankId;
      
      // If not in form values, try to get from prop
      if (!questionBankIdValue && questionBankId) {
        questionBankIdValue = questionBankId;
        // Also set it to form values for next time
        form.setFieldsValue({ questionBankId: questionBankId });
      }
      
      // If still not found, try initialValues
      if (!questionBankIdValue) {
        questionBankIdValue = initialValues?.questionBankId || initialValues?.QuestionBankId;
      }
      
      console.log('QuestionForm submit - questionBankId check:', {
        'values.questionBankId': values.questionBankId,
        'prop questionBankId': questionBankId,
        'initialValues?.questionBankId': initialValues?.questionBankId,
        'final value': questionBankIdValue,
        'all values keys': Object.keys(values),
        'form.getFieldsValue()': form.getFieldsValue()
      });
      
      if (!questionBankIdValue) {
        console.error('QuestionBankId is missing:', {
          values,
          questionBankId,
          initialValues,
          'form.getFieldsValue()': form.getFieldsValue(),
          'form.getFieldValue("questionBankId")': form.getFieldValue('questionBankId')
        });
        throw new Error('Vui lòng chọn ngân hàng câu hỏi');
      }
      
      // Validate and parse questionBankId
      const parsedBankId = parseInt(questionBankIdValue);
      if (isNaN(parsedBankId) || parsedBankId <= 0) {
        throw new Error(`ID ngân hàng câu hỏi không hợp lệ: ${questionBankIdValue}`);
      }
      
      const submitData = {
        questionBankId: parsedBankId, // Ensure it's a valid positive number (from form values, prop, or initialValues)
        title: (values.title || '').trim(),
        content: (values.content || '').trim(),
        questionTypeEnum: questionType,
        // Backend QuestionDifficultyId is int? (nullable) - optional field
        // Only send if provided and valid (positive integer > 0), otherwise send null
        questionDifficultyId: (() => {
          const diffId = values.questionDifficultyId;
          if (diffId === null || diffId === undefined || diffId === '' || diffId === 0) {
            return null;
          }
          const parsed = parseInt(diffId);
          if (isNaN(parsed) || parsed <= 0) {
            return null;
          }
          return parsed;
        })(),
        // Backend repository will convert null/empty to "{}", so we can send null or valid JSON string
        // If explanation provided, wrap it in JSON format; otherwise send null (backend will convert to "{}")
        additionalData: values.explanation && values.explanation.trim()
          ? JSON.stringify({ explanation: values.explanation.trim() })
          : null
      };
      
      // Validate required fields
      if (!submitData.title || submitData.title.length === 0) {
        throw new Error('Vui lòng nhập tiêu đề câu hỏi');
      }
      if (!submitData.content || submitData.content.length === 0) {
        throw new Error('Vui lòng nhập nội dung câu hỏi');
      }

      // Format answers based on question type
      if (questionType === 0) { // Multiple Choice
        // Convert form answers to backend format
        // Form structure: [{ text: '...', isCorrect: true }]
        // Backend expects: [{ AnswerText: '...', IsCorrect: true, Explanation?: string, OrderIndex?: number }]
        const answers = (values.answers || []).filter(answer => answer && answer.text); // Filter out empty answers
        if (answers.length === 0) {
          throw new Error('Cần ít nhất 1 lựa chọn trả lời');
        }
        
        submitData.multipleChoiceAnswers = answers
          .filter(answer => answer && (answer.text || answer.answerText)) // Filter empty answers
          .map((answer, index) => ({
            answerText: (answer.text || answer.answerText || '').trim(),
            isCorrect: answer.isCorrect !== undefined ? answer.isCorrect : false,
            explanation: answer.explanation || '', // Use empty string instead of null (backend accepts both, but empty string is safer)
            orderIndex: index + 1
          }));
        
        // Explicitly set fillBlankAnswers to null for MultipleChoice (not undefined)
        // This helps ASP.NET Core model binding - some validators expect the field to exist
        submitData.fillBlankAnswers = null;
      } else if (questionType === 1) { // Fill Blank
        // Convert form blanks to backend format
        // Form structure: [{ correctAnswer: '...', alternatives?: [] }]
        // Backend expects: [{ correctAnswer: '...', normalizedCorrectAnswer?: string, explanation?: string }]
        const blanks = (values.blanks || []).filter(blank => blank && blank.correctAnswer); // Filter out empty blanks
        if (blanks.length === 0) {
          throw new Error('Cần ít nhất 1 chỗ trống');
        }
        
        submitData.fillBlankAnswers = blanks
          .filter(blank => blank && blank.correctAnswer && (blank.correctAnswer || '').trim()) // Filter empty blanks
          .map(blank => {
            const correctAnswer = (blank.correctAnswer || '').trim();
            
            // Validate correctAnswer is not empty
            if (!correctAnswer || correctAnswer.length === 0) {
              throw new Error('Mỗi chỗ trống phải có đáp án đúng');
            }
            
            // Backend database requires NormalizedCorrectAnswer to be non-null (Required field)
            // Must provide it explicitly to avoid 500 errors
            const normalizedAnswer = (blank.normalizedCorrectAnswer || '').trim();
            const finalNormalized = normalizedAnswer || correctAnswer.toLowerCase();
            
            return {
              correctAnswer: correctAnswer,
              // Backend database requires normalizedCorrectAnswer to be non-null - MUST provide it
              normalizedCorrectAnswer: finalNormalized,
              // Use empty string instead of null (backend accepts both, but empty string is safer)
              explanation: blank.explanation || ''
            };
          });
        
        // Explicitly set multipleChoiceAnswers to null for FillBlank (not undefined)
        // This helps ASP.NET Core model binding - some validators expect the field to exist
        submitData.multipleChoiceAnswers = null;
      }

      await onSubmit(submitData);
    } catch (error) {
      // If validation error, throw it so Form can handle
      if (error.message) {
        throw error;
      }
      console.error('Error submitting question:', error);
      throw new Error('Có lỗi xảy ra khi tạo câu hỏi');
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
          initialValues={{
            questionBankId: questionBankId || null, // Set initial questionBankId from prop
            questionTypeEnum: 0
          }}
          requiredMark={false}
          size="large"
        >
          {/* Hidden field to store questionBankId - always present in form values */}
          <Form.Item 
            name="questionBankId" 
            hidden 
            preserve
            initialValue={questionBankId || null}
          >
            <Input type="hidden" />
          </Form.Item>
          
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
                      <Text strong>Độ khó (ID)</Text>
                      <Text type="secondary"> (Tùy chọn)</Text>
                    </span>
                  }
                  name="questionDifficultyId"
                  rules={[]}
                  extra="Nhập ID độ khó từ database (để trống nếu không cần)"
                >
                  <InputNumber
                    placeholder="Nhập ID độ khó (để trống nếu không cần)"
                    min={1}
                    style={{ width: '100%' }}
                  />
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