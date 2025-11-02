import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Typography, Button, Radio, Space, message, Spin, Alert } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import examAttemptService from '../services/examAttemptService';
import examService from '../services/examService';
import '../styles/chemistryTheme.css';
import '../styles/Home.css';

const { Title, Text } = Typography;

function StudentTestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const examId = searchParams.get('id') || searchParams.get('examId');

  // Load exam and start attempt on mount
  useEffect(() => {
    if (!examId) {
      setError('Không tìm thấy ID bài thi');
      setLoading(false);
      return;
    }

    const loadExamAndStartAttempt = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load exam details
        const examResponse = await examService.getExamById(examId);
        if (!examResponse.success) {
          setError(examResponse.message || 'Không thể tải thông tin bài thi');
          setLoading(false);
          return;
        }

        setExam(examResponse.data);

        // Check if there's a latest attempt that might be resumed
        const latestAttemptResponse = await examAttemptService.getLatestAttempt(examId);
        if (latestAttemptResponse.success && latestAttemptResponse.data) {
          const latestAttempt = latestAttemptResponse.data;
          // If attempt is not submitted, resume it
          if (latestAttempt.status !== 'Submitted' && latestAttempt.status !== 'Completed') {
            setAttemptId(latestAttempt.id);
            // Load saved answers if any
            if (latestAttempt.answers) {
              const savedAnswers = {};
              latestAttempt.answers.forEach(ans => {
                savedAnswers[ans.questionId] = ans.selectedAnswerIndex ?? ans.answerText;
              });
              setAnswers(savedAnswers);
            }
            message.success('Đã tiếp tục lần làm bài trước');
            setLoading(false);
            return;
          }
        }

        // Start new attempt
        const startResponse = await examAttemptService.startAttempt(examId);
        if (!startResponse.success) {
          setError(startResponse.message || 'Không thể bắt đầu bài thi');
          setLoading(false);
          return;
        }

        setAttemptId(startResponse.data.id || startResponse.data.attemptId);
        message.success('Đã bắt đầu bài thi');
      } catch (err) {
        console.error('Error loading exam:', err);
        setError('Có lỗi xảy ra khi tải bài thi');
      } finally {
        setLoading(false);
      }
    };

    loadExamAndStartAttempt();
  }, [examId]);

  const handleOptionChange = async (questionId, answerIndex) => {
    const newAnswers = { ...answers, [questionId]: answerIndex };
    setAnswers(newAnswers);

    // Submit answer to API if attemptId exists
    if (attemptId && examId) {
      try {
        await examAttemptService.submitAnswer(examId, attemptId, {
          questionId: questionId,
          selectedAnswerIndex: answerIndex,
          // If text answer is needed, add answerText field
        });
        // Optionally show a subtle notification
      } catch (err) {
        console.error('Error saving answer:', err);
        // Don't show error to user on every answer change, just log it
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!attemptId || !examId) {
      message.error('Không tìm thấy thông tin lần làm bài');
      return;
    }

    setSubmitting(true);
    try {
      // Submit the attempt
      const submitResponse = await examAttemptService.submitAttempt(examId, attemptId);
      
      if (!submitResponse.success) {
        message.error(submitResponse.message || 'Không thể nộp bài thi');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      message.success('Đã nộp bài thi thành công');

      // Navigate to result page
      // Get the attempt details to show results
      const attemptResponse = await examAttemptService.getAttemptById(examId, attemptId);
      
      const resultData = {
        examId,
        attemptId,
        examTitle: exam?.title || 'Kết quả bài thi',
        score: attemptResponse.data?.score || 0,
        totalQuestions: exam?.totalQuestions || exam?.questions?.length || 0,
        totalPoints: exam?.totalPoints || 10,
        answers: answers,
        questions: exam?.questions || [],
        attemptData: attemptResponse.data
      };

      navigate('/student-test/result', {
        state: resultData
      });
    } catch (err) {
      console.error('Error submitting exam:', err);
      message.error('Có lỗi xảy ra khi nộp bài thi');
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="chemistry-page">
        <div className="chemistry-molecules-bg"></div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" tip="Đang tải bài thi..." />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="chemistry-page">
        <div className="chemistry-molecules-bg"></div>
        <Card style={{ maxWidth: 900, margin: '40px auto' }}>
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => navigate('/exams')}>
                Quay lại danh sách
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Show message if no exam data
  if (!exam) {
    return (
      <div className="chemistry-page">
        <div className="chemistry-molecules-bg"></div>
        <Card style={{ maxWidth: 900, margin: '40px auto' }}>
          <Alert
            message="Không tìm thấy bài thi"
            description="Vui lòng kiểm tra lại ID bài thi"
            type="warning"
            showIcon
            action={
              <Button size="small" onClick={() => navigate('/exams')}>
                Quay lại danh sách
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Get questions from exam
  const questions = exam.questions || exam.examQuestions || [];
  const duration = exam.durationMinutes || exam.duration || 0;

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      
      {/* Header Card */}
      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ExperimentOutlined style={{ fontSize: 48 }} />
          <div>
            <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8 }}>
              {exam.title}
            </Title>
            <Text className="chemistry-subtitle" style={{ fontSize: 16 }}>
              {exam.description || ''}
            </Text>
            <div style={{ marginTop: 12, display: 'flex', gap: 24 }}>
              <Space>
                <ClockCircleOutlined />
                <Text strong>{duration} phút</Text>
              </Space>
              <Space>
                <CheckCircleOutlined />
                <Text strong>{questions.length} câu hỏi</Text>
              </Space>
              {exam.totalPoints && (
                <Space>
                  <Text strong>Tổng điểm: {exam.totalPoints}</Text>
                </Space>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {questions.length === 0 ? (
            <Card className="chemistry-card">
              <Alert
                message="Không có câu hỏi"
                description="Bài thi này chưa có câu hỏi nào"
                type="warning"
                showIcon
              />
            </Card>
          ) : (
            questions.map((q, idx) => {
              // Handle different question formats
              const questionId = q.id || q.questionId || q.examQuestionId;
              const questionText = q.question?.text || q.text || q.question || 'Câu hỏi';
              const options = q.question?.options || q.options || [];
              
              return (
                <Card key={questionId} className="chemistry-card">
                  <Title level={5} style={{ marginBottom: 16, color: 'var(--chem-purple-dark)' }}>
                    Câu {idx + 1}: {questionText}
                  </Title>
                  {options.length > 0 ? (
                    <Radio.Group
                      value={answers[questionId]}
                      onChange={(e) => handleOptionChange(questionId, e.target.value)}
                      disabled={submitted || submitting}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {options.map((opt, oidx) => {
                          const optionText = typeof opt === 'string' ? opt : (opt.text || opt.option || '');
                          const optionValue = opt.value !== undefined ? opt.value : oidx;
                          return (
                            <Radio key={oidx} value={optionValue} style={{ fontSize: 16, padding: '8px 0' }}>
                              {optionText}
                            </Radio>
                          );
                        })}
                      </Space>
                    </Radio.Group>
                  ) : (
                    <Alert
                      message="Câu hỏi này không có lựa chọn"
                      type="info"
                      showIcon
                    />
                  )}
                  {submitted && (
                    <div style={{ marginTop: 16, padding: 12, background: 'var(--chem-blue-light)', borderRadius: 8 }}>
                      <CheckCircleOutlined style={{ color: 'var(--chem-blue-dark)', marginRight: 8 }} />
                      <Text strong style={{ color: 'var(--chem-blue-dark)' }}>Đáp án đã lưu!</Text>
                    </div>
                  )}
                </Card>
              );
            })
          )}
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="chemistry-btn-primary"
              disabled={submitted || submitting || questions.length === 0}
              loading={submitting}
              style={{ minWidth: 220, height: 48, fontSize: 18 }}
            >
              {submitting ? 'Đang nộp bài...' : submitted ? '✓ Đã nộp bài' : 'Nộp bài kiểm tra'}
            </Button>
          </div>
        </Space>
      </form>
    </div>
  );
}

export default StudentTestPage;
