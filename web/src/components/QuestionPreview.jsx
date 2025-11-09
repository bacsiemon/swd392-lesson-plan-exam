import React from 'react';
import {
  Card,
  Typography,
  Tag,
  Radio,
  Input,
  Space,
  Divider,
  Alert,
  List
} from 'antd';
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS
} from '../constants/questionBankConstants';

const { Title, Text, Paragraph } = Typography;

const QuestionPreview = ({ question }) => {
  if (!question) return null;

  // Parse additional data
  let additionalData = {};
  try {
    additionalData = typeof question.additionalData === 'string'
      ? JSON.parse(question.additionalData)
      : question.additionalData || {};
  } catch (error) {
    console.error('Error parsing additional data:', error);
  }

  // Get question type info
  const questionTypeInfo = QUESTION_TYPES.find(type => type.value === question.questionTypeEnum);
  const difficultyInfo = DIFFICULTY_LEVELS.find(level => level.value === question.questionDifficultyId);

  // Render multiple choice question
  const renderMultipleChoice = () => {
    const answers = additionalData.answers || [];

    return (
      <Card
        title="Câu hỏi trắc nghiệm"
        size="small"
        style={{ marginTop: 16 }}
      >
        <Radio.Group style={{ width: '100%' }} disabled>
          <Space direction="vertical" style={{ width: '100%' }}>
            {answers.map((answer, index) => (
              <Radio
                key={index}
                value={answer.id || String.fromCharCode(65 + index)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '8px 12px',
                  backgroundColor: answer.isCorrect ? '#f6ffed' : 'transparent',
                  border: answer.isCorrect ? '1px solid #b7eb8f' : '1px solid #f0f0f0',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}
              >
                <span style={{ marginLeft: 8 }}>
                  <Text strong>{String.fromCharCode(65 + index)}. </Text>
                  {answer.text}
                  {answer.isCorrect && (
                    <CheckCircleOutlined
                      style={{ color: '#52c41a', marginLeft: 8 }}
                    />
                  )}
                </span>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Card>
    );
  };

  // Render fill blank question
  const renderFillBlank = () => {
    const blanks = additionalData.blanks || [];

    return (
      <Card
        title="Câu hỏi điền chỗ trống"
        size="small"
        style={{ marginTop: 16 }}
      >
        <Alert
          message="Hướng dẫn"
          description="Các chỗ trống được đánh dấu bằng dấu gạch dưới trong câu hỏi."
          type="info"
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Text strong>Đáp án cho các chỗ trống:</Text>
        </div>

        <List
          size="small"
          dataSource={blanks}
          renderItem={(blank, index) => (
            <List.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Tag color="blue">Chỗ trống {index + 1}</Tag>
                  <Text strong style={{ color: '#52c41a' }}>
                    {blank.correctAnswer}
                  </Text>
                </div>
                {blank.alternatives && blank.alternatives.length > 0 && (
                  <div>
                    <Text type="secondary">Đáp án thay thế: </Text>
                    {blank.alternatives.map((alt, altIndex) => (
                      <Tag key={altIndex} style={{ marginLeft: 4 }}>
                        {alt}
                      </Tag>
                    ))}
                  </div>
                )}
              </Space>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  return (
    <div>
      {/* Question Header */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <QuestionCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>
              {question.title}
            </Title>
          </Space>

          <div style={{ marginTop: 8 }}>
            <Space>
              <Tag color={questionTypeInfo?.value === 0 ? 'blue' : 'green'}>
                {questionTypeInfo?.label}
              </Tag>
              <Tag color={difficultyInfo?.color}>
                {difficultyInfo?.label}
              </Tag>
              <Tag color={question.isActive ? 'success' : 'default'}>
                {question.isActive ? 'Kích hoạt' : 'Không kích hoạt'}
              </Tag>
            </Space>
          </div>
        </div>

        <Divider />

        {/* Question Content */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>Nội dung câu hỏi:</Text>
          <Paragraph style={{
            marginTop: 8,
            fontSize: 15,
            lineHeight: 1.6,
            padding: '12px 16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            borderLeft: '4px solid #1890ff'
          }}>
            {question.content}
          </Paragraph>
        </div>

        {/* Question Type Specific Content */}
        {question.questionTypeEnum === 0 && renderMultipleChoice()}
        {question.questionTypeEnum === 1 && (
          <Alert
            message="Loại câu hỏi không được hỗ trợ"
            description="Câu hỏi điền vào chỗ trống hiện không được hiển thị."
            type="info"
            style={{ marginTop: 16 }}
          />
        )}

        {/* Explanation */}
        {additionalData.explanation && (
          <Card
            title={
              <span>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                Giải thích đáp án
              </span>
            }
            size="small"
            style={{ marginTop: 16 }}
          >
            <Paragraph style={{
              margin: 0,
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}>
              {additionalData.explanation}
            </Paragraph>
          </Card>
        )}

        {/* Question Metadata */}
        <Divider />
        <div style={{ fontSize: '13px', color: '#8c8c8c' }}>
          <Space split={<Divider type="vertical" />}>
            <span>ID: {question.id}</span>
            <span>Tạo: {new Date(question.createdAt).toLocaleString('vi-VN')}</span>
            {question.updatedAt && question.updatedAt !== question.createdAt && (
              <span>Cập nhật: {new Date(question.updatedAt).toLocaleString('vi-VN')}</span>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default QuestionPreview;