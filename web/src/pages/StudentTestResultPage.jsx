import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Tag, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function StudentTestResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAnswers, setShowAnswers] = useState(false);

  // Get data from location.state - includes submit response data
  const stateData = location.state || {};
  const { 
    examId = null,
    examTitle = 'Kết quả bài kiểm tra',
    attemptId = null,
    totalScore = 0,           // From submit response: TotalScore
    scorePercentage = 0,      // From submit response: ScorePercentage
    passed = false,           // From submit response: Passed
    details = [],             // From submit response: Details array
    totalQuestions = 0,       // Total number of questions
    totalPoints = 10,         // Total points possible
    answers = {},             // Student's answers (for reference)
    questions = [],           // Questions array
    submitData = null         // Full submit response
  } = stateData;

  // Debug logging
  React.useEffect(() => {
    console.log('[StudentTestResultPage] Location state data:', stateData);
    console.log('[StudentTestResultPage] Parsed data:', {
      examId,
      examTitle,
      attemptId,
      totalScore,
      scorePercentage,
      passed,
      detailsCount: details?.length || 0,
      details,
      totalQuestions,
      totalPoints,
      answersCount: Object.keys(answers || {}).length,
      questionsCount: questions?.length || 0
    });
  }, []);

  // Calculate correct answers count from details
  const correctCount = useMemo(() => {
    if (!details || details.length === 0) return 0;
    return details.filter(d => {
      const correct = d.correct !== undefined ? d.correct : (d.Correct !== undefined ? d.Correct : false);
      return correct;
    }).length;
  }, [details]);

  // Calculate score on scale of 10
  const scoreOnTen = useMemo(() => {
    if (scorePercentage !== undefined && scorePercentage !== null) {
      // scorePercentage is already a percentage (0-100), convert to scale of 10
      return Math.round((scorePercentage / 10) * 10) / 10;
    }
    if (totalPoints > 0 && totalScore !== undefined && totalScore !== null) {
      // Calculate from totalScore / totalPoints * 10
      return Math.round((totalScore / totalPoints) * 10 * 10) / 10;
    }
    if (totalQuestions > 0 && correctCount > 0) {
      // Fallback: calculate from correct count
      return Math.round((correctCount / totalQuestions) * 10 * 10) / 10;
    }
    return 0;
  }, [scorePercentage, totalScore, totalPoints, correctCount, totalQuestions]);

  const handleRetry = () => {
    // Navigate to test page with examId to start a new attempt
    // The StudentTestPage will check for latest attempt and since it's already submitted,
    // it will start a new attempt (requiring password if needed)
    if (examId) {
      navigate(`/student-test?id=${examId}`, { replace: false });
    } else {
      // Fallback: navigate to test list if examId is not available
      navigate('/exams', { replace: false });
    }
  };

  // Create a map of question details by questionId for quick lookup
  const detailsMap = useMemo(() => {
    const map = {};
    if (details && Array.isArray(details)) {
      details.forEach(detail => {
        const questionId = detail.questionId !== undefined ? detail.questionId : (detail.QuestionId !== undefined ? detail.QuestionId : null);
        if (questionId) {
          map[questionId] = detail;
        }
      });
    }
    return map;
  }, [details]);

  const renderAnswerLine = (q, idx) => {
    // Get question ID
    const questionId = q.questionId || q.QuestionId || q.id || q.Id;
    
    // Get detail from submit response
    const detail = questionId ? detailsMap[questionId] : null;
    
    // Get correctness from detail
    const isCorrect = detail ? (detail.correct !== undefined ? detail.correct : (detail.Correct !== undefined ? detail.Correct : false)) : false;
    
    // Get points from detail
    const pointsEarned = detail ? (detail.pointsEarned !== undefined ? detail.pointsEarned : (detail.PointsEarned !== undefined ? detail.PointsEarned : 0)) : 0;
    const pointsPossible = detail ? (detail.pointsPossible !== undefined ? detail.pointsPossible : (detail.PointsPossible !== undefined ? detail.PointsPossible : 0)) : 0;
    
    // Get question text
    const questionText = q.text || q.title || q.content || q.questionTitle || q.QuestionTitle || q.questionContent || q.QuestionContent || 
                        q.question?.title || q.question?.Title || q.question?.content || q.question?.Content || 'Câu hỏi';
    
    // Get options
    const options = q.options || q.multipleChoiceAnswers || q.MultipleChoiceAnswers || 
                   q.question?.multipleChoiceAnswers || q.question?.MultipleChoiceAnswers || [];
    
    // Get student's selected answer
    const studentAnswerId = answers[questionId] || answers[parseInt(questionId)];
    
    // Find correct answer IDs from question
    let correctAnswerIds = [];
    if (q.question && q.question.multipleChoiceAnswers) {
      correctAnswerIds = q.question.multipleChoiceAnswers
        .filter(ans => ans.isCorrect || ans.IsCorrect)
        .map(ans => ans.id || ans.Id);
    } else if (q.multipleChoiceAnswers) {
      correctAnswerIds = q.multipleChoiceAnswers
        .filter(ans => ans.isCorrect || ans.IsCorrect)
        .map(ans => ans.id || ans.Id);
    }
    
    return (
      <Card key={questionId || idx} style={{ marginBottom: 12 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Câu {idx + 1}: {questionText}</Title>
        
        {options.length > 0 ? (
          <div style={{ marginBottom: 8 }}>
            {options.map((opt, oidx) => {
              const optionId = opt.id !== undefined ? opt.id : (opt.Id !== undefined ? opt.Id : null);
              const optionText = opt.answerText || opt.AnswerText || opt.text || opt.option || opt.Text || '';
              
              const isStudentAnswer = optionId !== null && optionId === studentAnswerId;
              const isCorrectAnswer = optionId !== null && correctAnswerIds.includes(optionId);
              
              return (
                <div key={oidx} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
                  {isCorrectAnswer && <Tag color="green">Đáp án đúng</Tag>}
                  {isStudentAnswer && !isCorrectAnswer && <Tag color="red">Bạn chọn</Tag>}
                  {isStudentAnswer && isCorrectAnswer && <Tag color="green">Bạn chọn (Đúng)</Tag>}
                  <Text style={{ 
                    color: isCorrectAnswer ? 'green' : (isStudentAnswer && !isCorrectAnswer ? 'red' : undefined),
                    fontWeight: isStudentAnswer || isCorrectAnswer ? 'bold' : 'normal'
                  }}>
                    {optionText}
                  </Text>
                </div>
              );
            })}
          </div>
        ) : (
          <Text type="secondary">Không có lựa chọn</Text>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
          <Tag color={isCorrect ? 'green' : 'red'} style={{ padding: '6px 10px' }}>
            {isCorrect ? <><CheckCircleOutlined /> Đúng</> : <><CloseCircleOutlined /> Sai</>}
          </Tag>
          {pointsPossible > 0 && (
            <Text type="secondary">
              Điểm: {pointsEarned.toFixed(2)}/{pointsPossible.toFixed(2)}
            </Text>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>

      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8 }}>
          {examTitle || 'Kết quả bài kiểm tra'}
        </Title>
        <Paragraph className="chemistry-subtitle" style={{ fontSize: 16, marginBottom: 0 }}>
          Bạn đã hoàn thành bài kiểm tra. Dưới đây là kết quả của bạn.
        </Paragraph>
      </Card>

      <Card className="chemistry-card" style={{ maxWidth: 900, margin: '0 auto 16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={3} style={{ color: 'var(--chem-purple-dark)', margin: 0 }}>
            Điểm: {scoreOnTen}/10
          </Title>
          
          {/* Show score percentage */}
          {scorePercentage !== undefined && scorePercentage !== null && (
            <Text strong style={{ fontSize: 16 }}>
              Tỷ lệ: {scorePercentage.toFixed(2)}%
            </Text>
          )}
          
          {/* Show total score */}
          {totalScore !== undefined && totalScore !== null && totalPoints > 0 && (
            <Text strong style={{ fontSize: 16 }}>
              Điểm số: {totalScore.toFixed(2)}/{totalPoints.toFixed(2)}
            </Text>
          )}
          
          {/* Show correct count */}
          {totalQuestions > 0 && (
            <Text strong style={{ fontSize: 16 }}>
              Đúng {correctCount}/{totalQuestions} câu
            </Text>
          )}
          
          {/* Show pass/fail status */}
          {passed !== undefined && (
            <Tag color={passed ? 'green' : 'red'} style={{ fontSize: 14, padding: '6px 12px' }}>
              {passed ? <><CheckCircleOutlined /> Đạt</> : <><CloseCircleOutlined /> Chưa đạt</>}
            </Tag>
          )}
          
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
          {questions && questions.length > 0 ? (
            questions.map((q, idx) => renderAnswerLine(q, idx))
          ) : (
            <Text type="secondary">Chi tiết đáp án không có sẵn. Vui lòng xem từ trang kết quả bài thi.</Text>
          )}
        </Card>
      )}
    </div>
  );
}

export default StudentTestResultPage;


