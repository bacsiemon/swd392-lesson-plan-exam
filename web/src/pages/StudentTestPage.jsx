import React, { useState } from 'react';
import { Card, Typography, Button, Radio, Space } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import '../styles/chemistryTheme.css';
import '../styles/Home.css';

const { Title, Text } = Typography;

const mockTest = {
  title: 'Bài kiểm tra Hóa học - Chương 1',
  description: 'Kiểm tra kiến thức cơ bản về nguyên tử, bảng tuần hoàn và liên kết hóa học.',
  duration: 30, // phút
  questions: [
    {
      id: 1,
      type: 'multiple-choice',
      question: 'Nguyên tử là gì?',
      options: [
        'Hạt nhỏ nhất cấu tạo nên vật chất',
        'Một loại phân tử',
        'Một loại ion',
        'Một loại hợp chất'
      ]
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: 'Nguyên tố nào sau đây thuộc nhóm Halogen?',
      options: [
        'Oxy',
        'Natri',
        'Clo',
        'Magie'
      ]
    },
    {
      id: 3,
      type: 'multiple-choice',
      question: 'Liên kết hóa học là gì?',
      options: [
        'Sự hút giữa các nguyên tử tạo thành phân tử hoặc tinh thể',
        'Sự phân hủy của nguyên tử',
        'Sự chuyển động của electron',
        'Sự kết hợp giữa proton và neutron'
      ]
    }
  ]
};

function StudentTestPage() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleOptionChange = (qid, idx) => {
    setAnswers({ ...answers, [qid]: idx });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Gửi đáp án lên server hoặc xử lý kết quả
  };

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      
      {/* Header Card */}
      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ExperimentOutlined style={{ fontSize: 48 }} />
          <div>
            <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8 }}>
              {mockTest.title}
            </Title>
            <Text className="chemistry-subtitle" style={{ fontSize: 16 }}>
              {mockTest.description}
            </Text>
            <div style={{ marginTop: 12, display: 'flex', gap: 24 }}>
              <Space>
                <ClockCircleOutlined />
                <Text strong>{mockTest.duration} phút</Text>
              </Space>
              <Space>
                <CheckCircleOutlined />
                <Text strong>{mockTest.questions.length} câu hỏi</Text>
              </Space>
            </div>
          </div>
        </div>
      </Card>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {mockTest.questions.map((q, idx) => (
            <Card key={q.id} className="chemistry-card">
              <Title level={5} style={{ marginBottom: 16, color: 'var(--chem-purple-dark)' }}>
                Câu {idx + 1}: {q.question}
              </Title>
              <Radio.Group
                value={answers[q.id]}
                onChange={(e) => handleOptionChange(q.id, e.target.value)}
                disabled={submitted}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {q.options.map((opt, oidx) => (
                    <Radio key={oidx} value={oidx} style={{ fontSize: 16, padding: '8px 0' }}>
                      {opt}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
              {submitted && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--chem-blue-light)', borderRadius: 8 }}>
                  <CheckCircleOutlined style={{ color: 'var(--chem-blue-dark)', marginRight: 8 }} />
                  <Text strong style={{ color: 'var(--chem-blue-dark)' }}>Đáp án đã lưu!</Text>
                </div>
              )}
            </Card>
          ))}
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="chemistry-btn-primary"
              disabled={submitted}
              style={{ minWidth: 220, height: 48, fontSize: 18 }}
            >
              {submitted ? '✓ Đã nộp bài' : 'Nộp bài kiểm tra'}
            </Button>
          </div>
        </Space>
      </form>
    </div>
  );
}

export default StudentTestPage;
