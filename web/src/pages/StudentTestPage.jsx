import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Typography, Button, Radio, Space, message, Spin, Alert, Modal, Input } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, ClockCircleOutlined, LockOutlined } from '@ant-design/icons';
import examAttemptService from '../services/examAttemptService';
import examService from '../services/examService';
import questionService from '../services/questionService';
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
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

        // Load questions for the exam
        const questionsResponse = await examService.getExamQuestions(examId);
        const examData = examResponse.data;
        
        // Attach questions to exam data
        if (questionsResponse.success && questionsResponse.data && questionsResponse.data.length > 0) {
          // Backend returns ExamQuestionResponse which has QuestionId but not full question details
          // We need to load full question details with answers for each question
          const examQuestions = questionsResponse.data;
          console.log('Loading questions for exam:', examId, 'Found', examQuestions.length, 'exam questions');
          
          const fullQuestions = await Promise.all(
            examQuestions.map(async (examQuestion) => {
              const questionId = examQuestion.questionId || examQuestion.QuestionId;
              console.log('Loading question details for questionId:', questionId, 'examQuestion:', examQuestion);
              
              if (questionId) {
                try {
                  // Load full question details with answers
                  const questionResponse = await questionService.getQuestionById(questionId);
                  console.log('Question response for', questionId, ':', questionResponse);
                  
                  if (questionResponse.success && questionResponse.data) {
                    const fullQuestion = questionResponse.data;
                    console.log('Full question loaded:', fullQuestion);
                    
                    const mappedQuestion = {
                      ...examQuestion,
                      question: fullQuestion,
                      // Map for easier access
                      questionId: questionId,
                      id: examQuestion.id || examQuestion.Id || examQuestion.examQuestionId || examQuestion.ExamQuestionId,
                      text: fullQuestion.title || fullQuestion.Title || fullQuestion.content || fullQuestion.Content || examQuestion.questionTitle || examQuestion.QuestionTitle,
                      title: fullQuestion.title || fullQuestion.Title || examQuestion.questionTitle || examQuestion.QuestionTitle,
                      content: fullQuestion.content || fullQuestion.Content || examQuestion.questionContent || examQuestion.QuestionContent,
                      questionTypeEnum: fullQuestion.questionTypeEnum !== undefined ? fullQuestion.questionTypeEnum : (fullQuestion.QuestionTypeEnum !== undefined ? fullQuestion.QuestionTypeEnum : examQuestion.questionTypeEnum || examQuestion.QuestionTypeEnum),
                      // Map options/answers
                      options: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                      multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || []
                    };
                    
                    console.log('Mapped question:', mappedQuestion);
                    return mappedQuestion;
                  } else {
                    console.warn('Failed to load question', questionId, ':', questionResponse);
                  }
                } catch (error) {
                  console.error(`Error loading question ${questionId}:`, error);
                }
              } else {
                console.warn('No questionId found in examQuestion:', examQuestion);
              }
              
              // Fallback: return exam question with basic info
              return {
                ...examQuestion,
                questionId: questionId,
                id: examQuestion.id || examQuestion.Id || examQuestion.examQuestionId || examQuestion.ExamQuestionId,
                text: examQuestion.questionTitle || examQuestion.QuestionTitle || examQuestion.questionContent || examQuestion.QuestionContent,
                title: examQuestion.questionTitle || examQuestion.QuestionTitle,
                content: examQuestion.questionContent || examQuestion.QuestionContent,
                options: []
              };
            })
          );
          
          // Filter out any null/undefined questions
          const validQuestions = fullQuestions.filter(q => q != null);
          console.log('Valid questions after filtering:', validQuestions.length, 'out of', fullQuestions.length);
          console.log('Questions data:', validQuestions);
          
          examData.questions = validQuestions;
          examData.examQuestions = validQuestions;
        } else {
          console.warn('No questions found in response:', questionsResponse);
          // If questions API fails, use questions from exam response if available
          examData.questions = examData.questions || examData.examQuestions || [];
        }

        setExam(examData);
        
        // Check if there's a latest attempt that might be resumed
        const latestAttemptResponse = await examAttemptService.getLatestAttempt(examId);
        if (latestAttemptResponse.success && latestAttemptResponse.data) {
          const latestAttempt = latestAttemptResponse.data;
          // If attempt is not submitted, resume it
          if (latestAttempt.statusEnum !== 2 && latestAttempt.status !== 'Submitted') {
            setAttemptId(latestAttempt.attemptId || latestAttempt.id);
            
            // Load saved answers if any
            if (latestAttempt.answers && Array.isArray(latestAttempt.answers)) {
              const savedAnswers = {};
              latestAttempt.answers.forEach(ans => {
                if (ans.selectedAnswerIds && ans.selectedAnswerIds.length > 0) {
                  savedAnswers[ans.questionId] = ans.selectedAnswerIds[0];
                } else if (ans.textAnswer) {
                  savedAnswers[ans.questionId] = ans.textAnswer;
                }
              });
              setAnswers(savedAnswers);
            }
            message.success('Đã tiếp tục lần làm bài trước');
            setLoading(false);
            return;
          }
        }

        // Try to start new attempt without password first
        const startResponse = await examAttemptService.startAttempt(examId, null);
        
        if (startResponse.success) {
          // Started successfully without password
          const attemptData = startResponse.data;
          console.log('StartAttempt response data:', attemptData);
          setAttemptId(attemptData.attemptId || attemptData.id || attemptData.AttemptId);
          
          // Load questions from startAttempt response if available
          // startAttempt returns AttemptStartResponse with Questions array containing QuestionId, OrderIndex, PointsPossible
          // Backend uses PascalCase, but JSON serializer might convert to camelCase
          const questionsArray = attemptData.questions || attemptData.Questions || [];
          console.log('Questions array from startAttempt:', questionsArray);
          
          if (Array.isArray(questionsArray) && questionsArray.length > 0) {
            console.log('Loading questions from startAttempt response:', questionsArray);
            const questionIds = questionsArray.map(q => q.questionId || q.QuestionId).filter(id => id != null);
            console.log('Question IDs from startAttempt:', questionIds);
            
            // Load full question details for each QuestionId
            const fullQuestions = await Promise.all(
              questionIds.map(async (questionId, index) => {
                try {
                  const questionResponse = await questionService.getQuestionById(questionId);
                  if (questionResponse.success && questionResponse.data) {
                    const fullQuestion = questionResponse.data;
                    const questionItem = questionsArray[index];
                    console.log(`Loaded question ${questionId}:`, fullQuestion);
                    return {
                      questionId: questionId,
                      id: questionId, // Use QuestionId as the id for rendering
                      orderIndex: questionItem?.orderIndex || questionItem?.OrderIndex || index + 1,
                      points: questionItem?.pointsPossible || questionItem?.PointsPossible,
                      text: fullQuestion.title || fullQuestion.Title || fullQuestion.content || fullQuestion.Content,
                      title: fullQuestion.title || fullQuestion.Title,
                      content: fullQuestion.content || fullQuestion.Content,
                      questionTypeEnum: fullQuestion.questionTypeEnum !== undefined ? fullQuestion.questionTypeEnum : (fullQuestion.QuestionTypeEnum !== undefined ? fullQuestion.QuestionTypeEnum : 0),
                      options: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                      multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                      question: fullQuestion
                    };
                  } else {
                    console.warn(`Failed to load question ${questionId}:`, questionResponse);
                  }
                } catch (error) {
                  console.error(`Error loading question ${questionId}:`, error);
                }
                return null;
              })
            );
            
            // Filter out null questions and sort by orderIndex
            const validQuestions = fullQuestions.filter(q => q != null).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
            console.log('Valid questions loaded from startAttempt:', validQuestions.length);
            console.log('Valid questions:', validQuestions);
            
            examData.questions = validQuestions;
            examData.examQuestions = validQuestions;
            examData.totalQuestions = validQuestions.length; // Update totalQuestions
            setExam(examData);
          } else {
            console.warn('No questions found in startAttempt response. Response data:', attemptData);
            // Fallback: use getExamQuestions if startAttempt doesn't return questions
            console.log('No questions in startAttempt response, using getExamQuestions fallback');
            const questionsResponse = await examService.getExamQuestions(examId);
            if (questionsResponse.success && questionsResponse.data && questionsResponse.data.length > 0) {
              const examQuestions = questionsResponse.data;
              const fullQuestions = await Promise.all(
                examQuestions.map(async (examQuestion) => {
                  const questionId = examQuestion.questionId || examQuestion.QuestionId;
                  if (questionId) {
                    try {
                      const questionResponse = await questionService.getQuestionById(questionId);
                      if (questionResponse.success && questionResponse.data) {
                        const fullQuestion = questionResponse.data;
                        return {
                          ...examQuestion,
                          question: fullQuestion,
                          questionId: questionId,
                          id: examQuestion.id || examQuestion.Id || examQuestion.examQuestionId || examQuestion.ExamQuestionId,
                          text: fullQuestion.title || fullQuestion.Title || fullQuestion.content || fullQuestion.Content || examQuestion.questionTitle || examQuestion.QuestionTitle,
                          title: fullQuestion.title || fullQuestion.Title || examQuestion.questionTitle || examQuestion.QuestionTitle,
                          content: fullQuestion.content || fullQuestion.Content || examQuestion.questionContent || examQuestion.QuestionContent,
                          questionTypeEnum: fullQuestion.questionTypeEnum !== undefined ? fullQuestion.questionTypeEnum : (fullQuestion.QuestionTypeEnum !== undefined ? fullQuestion.QuestionTypeEnum : examQuestion.questionTypeEnum || examQuestion.QuestionTypeEnum),
                          options: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                          multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || []
                        };
                      }
                    } catch (error) {
                      console.error(`Error loading question ${questionId}:`, error);
                    }
                  }
                  return {
                    ...examQuestion,
                    questionId: questionId,
                    id: examQuestion.id || examQuestion.Id || examQuestion.examQuestionId || examQuestion.ExamQuestionId,
                    text: examQuestion.questionTitle || examQuestion.QuestionTitle || examQuestion.questionContent || examQuestion.QuestionContent,
                    title: examQuestion.questionTitle || examQuestion.QuestionTitle,
                    content: examQuestion.questionContent || examQuestion.QuestionContent,
                    options: []
                  };
                })
              );
              
              const validQuestions = fullQuestions.filter(q => q != null);
              examData.questions = validQuestions;
              examData.examQuestions = validQuestions;
              setExam(examData);
            }
          }
          
          message.success('Đã bắt đầu bài thi');
          setLoading(false);
        } else {
          // Failed to start - assume it needs password since all other errors would be caught earlier
          // Show password modal for any failure at this point
          setShowPasswordModal(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading exam:', err);
        setError('Có lỗi xảy ra khi tải bài thi');
        setLoading(false);
      }
    };

    loadExamAndStartAttempt();
  }, [examId]);

  const startNewAttempt = async (examPassword) => {
    try {
      setLoading(true);
      setPasswordError(''); // Clear previous errors
      const startResponse = await examAttemptService.startAttempt(examId, examPassword);
      
      if (!startResponse.success) {
        // Log the full error for debugging
        console.error('Start attempt failed:', startResponse);
        console.error('Error details:', {
          statusCode: startResponse.statusCode,
          error: startResponse.error,
          message: startResponse.message
        });
        
        // Use the message from service (already processed and user-friendly)
        const errorMsg = startResponse.message || 'Không thể bắt đầu bài thi';
        
        if (examPassword) {
          // If password was provided but failed
          // Show the actual error message from backend
          setPasswordError(errorMsg);
          setLoading(false);
          return false;
        } else {
          setError(errorMsg);
          setLoading(false);
          return false;
        }
      }

      const attemptData = startResponse.data;
      console.log('StartAttempt response data in startNewAttempt:', attemptData);
      setAttemptId(attemptData?.attemptId || attemptData?.id || attemptData?.AttemptId);
      
      // Load questions from startAttempt response if available
      // startAttempt returns AttemptStartResponse with Questions array containing QuestionId, OrderIndex, PointsPossible
      // Backend uses PascalCase, but JSON serializer might convert to camelCase
      const questionsArray = attemptData?.questions || attemptData?.Questions || [];
      console.log('Questions array from startAttempt in startNewAttempt:', questionsArray);
      
      if (Array.isArray(questionsArray) && questionsArray.length > 0) {
        console.log('Loading questions from startAttempt response in startNewAttempt:', questionsArray);
        const questionIds = questionsArray.map(q => q.questionId || q.QuestionId).filter(id => id != null);
        console.log('Question IDs from startAttempt:', questionIds);
        
        // Load full question details for each QuestionId
        const fullQuestions = await Promise.all(
          questionIds.map(async (questionId, index) => {
            try {
              const questionResponse = await questionService.getQuestionById(questionId);
              if (questionResponse.success && questionResponse.data) {
                const fullQuestion = questionResponse.data;
                const questionItem = questionsArray[index];
                console.log(`Loaded question ${questionId} in startNewAttempt:`, fullQuestion);
                return {
                  questionId: questionId,
                  id: questionId, // Use QuestionId as the id for rendering
                  orderIndex: questionItem?.orderIndex || questionItem?.OrderIndex || index + 1,
                  points: questionItem?.pointsPossible || questionItem?.PointsPossible,
                  text: fullQuestion.title || fullQuestion.Title || fullQuestion.content || fullQuestion.Content,
                  title: fullQuestion.title || fullQuestion.Title,
                  content: fullQuestion.content || fullQuestion.Content,
                  questionTypeEnum: fullQuestion.questionTypeEnum !== undefined ? fullQuestion.questionTypeEnum : (fullQuestion.QuestionTypeEnum !== undefined ? fullQuestion.QuestionTypeEnum : 0),
                  options: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                  multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                  question: fullQuestion
                };
              } else {
                console.warn(`Failed to load question ${questionId} in startNewAttempt:`, questionResponse);
              }
            } catch (error) {
              console.error(`Error loading question ${questionId} in startNewAttempt:`, error);
            }
            return null;
          })
        );
        
        // Filter out null questions and sort by orderIndex
        const validQuestions = fullQuestions.filter(q => q != null).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        console.log('Valid questions loaded from startAttempt in startNewAttempt:', validQuestions.length);
        console.log('Valid questions:', validQuestions);
        
        setExam(prev => ({
          ...prev,
          questions: validQuestions,
          examQuestions: validQuestions,
          totalQuestions: validQuestions.length // Update totalQuestions
        }));
      } else if (!exam || !exam.questions || exam.questions.length === 0) {
        // Fallback: use getExamQuestions if startAttempt doesn't return questions
        console.log('No questions in startAttempt response, using getExamQuestions fallback');
        const questionsResponse = await examService.getExamQuestions(examId);
        console.log('Loading questions in startNewAttempt, response:', questionsResponse);
        
        if (questionsResponse.success && questionsResponse.data && questionsResponse.data.length > 0) {
          // Load full question details with answers
          const examQuestions = questionsResponse.data;
          console.log('Found', examQuestions.length, 'exam questions to load');
          
          const fullQuestions = await Promise.all(
            examQuestions.map(async (examQuestion) => {
              const questionId = examQuestion.questionId || examQuestion.QuestionId;
              console.log('Loading question', questionId);
              
              if (questionId) {
                try {
                  const questionResponse = await questionService.getQuestionById(questionId);
                  if (questionResponse.success && questionResponse.data) {
                    const fullQuestion = questionResponse.data;
                    return {
                      ...examQuestion,
                      question: fullQuestion,
                      questionId: questionId,
                      id: examQuestion.id || examQuestion.Id || examQuestion.examQuestionId || examQuestion.ExamQuestionId,
                      text: fullQuestion.title || fullQuestion.Title || fullQuestion.content || fullQuestion.Content || examQuestion.questionTitle || examQuestion.QuestionTitle,
                      title: fullQuestion.title || fullQuestion.Title || examQuestion.questionTitle || examQuestion.QuestionTitle,
                      content: fullQuestion.content || fullQuestion.Content || examQuestion.questionContent || examQuestion.QuestionContent,
                      questionTypeEnum: fullQuestion.questionTypeEnum !== undefined ? fullQuestion.questionTypeEnum : (fullQuestion.QuestionTypeEnum !== undefined ? fullQuestion.QuestionTypeEnum : examQuestion.questionTypeEnum || examQuestion.QuestionTypeEnum),
                      options: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                      multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || []
                    };
                  } else {
                    console.warn('Failed to load question', questionId, ':', questionResponse);
                  }
                } catch (error) {
                  console.error(`Error loading question ${questionId}:`, error);
                }
              }
              
              return {
                ...examQuestion,
                questionId: questionId,
                id: examQuestion.id || examQuestion.Id || examQuestion.examQuestionId || examQuestion.ExamQuestionId,
                text: examQuestion.questionTitle || examQuestion.QuestionTitle || examQuestion.questionContent || examQuestion.QuestionContent,
                title: examQuestion.questionTitle || examQuestion.QuestionTitle,
                content: examQuestion.questionContent || examQuestion.QuestionContent,
                options: []
              };
            })
          );
          
          // Filter out any null/undefined questions
          const validQuestions = fullQuestions.filter(q => q != null);
          console.log('Valid questions loaded:', validQuestions.length);
          
          setExam(prev => ({
            ...prev,
            questions: validQuestions,
            examQuestions: validQuestions
          }));
        } else {
          console.warn('No questions found in startNewAttempt:', questionsResponse);
        }
      }
      
      setShowPasswordModal(false);
      setPasswordError('');
      setPassword(''); // Clear password field
      message.success('Đã bắt đầu bài thi');
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error starting attempt:', err);
      const errorMsg = 'Có lỗi xảy ra khi bắt đầu bài thi. Vui lòng thử lại.';
      if (examPassword) {
        setPasswordError(errorMsg);
      } else {
        setError(errorMsg);
      }
      setLoading(false);
      return false;
    }
  };

  const handlePasswordSubmit = () => {
    if (!password || password.trim() === '') {
      setPasswordError('Vui lòng nhập mật khẩu');
      return;
    }
    startNewAttempt(password);
  };

  const handleOptionChange = async (questionId, answerId) => {
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);

    // Submit answer to API if attemptId exists
    if (attemptId && examId) {
      try {
        // Backend expects: { questionId, selectedAnswerIds: "10,11", textAnswer }
        // The service will format answerId to the correct format
        const result = await examAttemptService.submitAnswer(examId, attemptId, {
          questionId: questionId,
          answerIds: answerId, // Can be number, array, or string - service will format it
        });
        
        if (result.success) {
          // Optionally show a subtle notification
          console.log('Answer saved successfully for question', questionId);
        } else {
          console.warn('Failed to save answer:', result.message);
        }
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
  
  // Debug logging
  console.log('Render - Exam data:', exam);
  console.log('Render - Questions:', questions);
  console.log('Render - Questions length:', questions.length);
  console.log('Render - Total questions:', exam.totalQuestions);

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      
      {/* Password Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined style={{ color: 'var(--chem-purple)' }} />
            <span>Bài thi được bảo vệ</span>
          </Space>
        }
        open={showPasswordModal}
        onOk={handlePasswordSubmit}
        onCancel={() => navigate('/exams')}
        okText="Bắt đầu làm bài"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Text>Bài thi này yêu cầu mật khẩu. Vui lòng nhập mật khẩu để tiếp tục:</Text>
          <Input.Password
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            onPressEnter={handlePasswordSubmit}
            style={{ marginTop: 12 }}
            size="large"
            prefix={<LockOutlined />}
            status={passwordError ? 'error' : ''}
          />
          {passwordError && (
            <Text type="danger" style={{ display: 'block', marginTop: 8 }}>
              {passwordError}
            </Text>
          )}
        </div>
      </Modal>

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
              // Backend returns ExamQuestionResponse with QuestionId, we've loaded full question details
              const questionId = q.questionId || q.QuestionId || q.id || q.Id || q.examQuestionId || q.ExamQuestionId;
              const questionText = q.text || q.title || q.content || q.questionTitle || q.QuestionTitle || q.questionContent || q.QuestionContent || q.question?.title || q.question?.Title || q.question?.content || q.question?.Content || 'Câu hỏi';
              // Use options from loaded question data
              const options = q.options || q.multipleChoiceAnswers || q.MultipleChoiceAnswers || q.question?.multipleChoiceAnswers || q.question?.MultipleChoiceAnswers || [];
              
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
                          // Backend returns MultipleChoiceAnswerPayload: { Id, AnswerText, IsCorrect, Explanation, OrderIndex }
                          const optionText = typeof opt === 'string' 
                            ? opt 
                            : (opt.answerText || opt.AnswerText || opt.text || opt.option || opt.Text || '');
                          
                          // Use answer ID from backend if available, otherwise use composite key
                          const answerId = opt.id !== undefined && opt.id !== null ? opt.id : 
                                         (opt.Id !== undefined && opt.Id !== null ? opt.Id :
                                         (opt.answerId !== undefined && opt.answerId !== null ? opt.answerId :
                                         (opt.AnswerId !== undefined && opt.AnswerId !== null ? opt.AnswerId :
                                         `${questionId}_${oidx}`)));
                          
                          return (
                            <Radio key={`${questionId}_opt_${oidx}`} value={answerId} style={{ fontSize: 16, padding: '8px 0' }}>
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
