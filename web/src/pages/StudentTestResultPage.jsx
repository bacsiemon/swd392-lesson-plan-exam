import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Tag, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function StudentTestResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAnswers, setShowAnswers] = useState(false);

  const { score = 0, totalQuestions = 0, answers = {}, questions = [], testTitle = 'Kết quả bài kiểm tra' } = location.state || {};

  const scoreOnTen = useMemo(() => {
    if (!totalQuestions || totalQuestions === 0) return 0;
    return Math.round((score / totalQuestions) * 10 * 10) / 10; // one decimal
  }, [score, totalQuestions]);

  const handleRetry = () => {
    navigate('/student-test', { replace: true });
  };

  const renderAnswerLine = (q, idx) => {
    const studentIdx = answers[q.id];
    const isCorrect = studentIdx === q.correctIndex;
    return (
      <Card key={q.id} style={{ marginBottom: 12 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Câu {idx + 1}: {q.question}</Title>
        <div style={{ marginBottom: 8 }}>
          {q.options.map((opt, oidx) => {
            const isStudent = oidx === studentIdx;
            const isAnswer = oidx === q.correctIndex;
            const color = isAnswer ? 'green' : isStudent && !isAnswer ? 'red' : 'default';
            return (
              <div key={oidx} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
                {isAnswer && <Tag color="green">Đáp án</Tag>}
                {isStudent && !isAnswer && <Tag color="red">Bạn chọn</Tag>}
                <Text style={{ color: isAnswer ? 'green' : isStudent && !isAnswer ? 'red' : undefined }}>{opt}</Text>
              </div>
            );
          })}
        </div>
        <Tag color={isCorrect ? 'green' : 'red'} style={{ padding: '6px 10px' }}>
          {isCorrect ? <><CheckCircleOutlined /> Đúng</> : <><CloseCircleOutlined /> Sai</>}
        </Tag>
      </Card>
    );
  };

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>

      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8 }}>{testTitle}</Title>
        <Paragraph className="chemistry-subtitle" style={{ fontSize: 16, marginBottom: 0 }}>
          Bạn đã hoàn thành bài kiểm tra. Dưới đây là kết quả của bạn.
        </Paragraph>
      </Card>

      <Card className="chemistry-card" style={{ maxWidth: 900, margin: '0 auto 16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={3} style={{ color: 'var(--chem-purple-dark)', margin: 0 }}>
            Điểm: {scoreOnTen}/10
          </Title>
          <Text strong>Đúng {score}/{totalQuestions} câu</Text>
          <Space size="middle" style={{ marginTop: 8 }}>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetry}>
              Làm lại
            </Button>
            <Button icon={<EyeOutlined />} onClick={() => setShowAnswers(!showAnswers)}>
              {showAnswers ? 'Ẩn đáp án' : 'Xem đáp án'}
            </Button>
          </Space>
        </Space>
      </Card>

      {showAnswers && (
        <Card className="chemistry-card" style={{ maxWidth: 900, margin: '0 auto' }}>
          <Title level={4} style={{ marginTop: 0 }}>Chi tiết đáp án</Title>
          <Divider style={{ margin: '12px 0' }} />
          {questions.map((q, idx) => renderAnswerLine(q, idx))}
        </Card>
      )}
    </div>
  );
}

export default StudentTestResultPage;


