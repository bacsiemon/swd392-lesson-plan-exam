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
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(null); // Time remaining in seconds
  const [startedAt, setStartedAt] = useState(null); // When the attempt started (ISO string or Date)
  const [durationMinutes, setDurationMinutes] = useState(null); // Exam duration in minutes
  
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
                      multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                      fillBlankAnswers: fullQuestion.fillBlankAnswers || fullQuestion.FillBlankAnswers || []
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
        // GET /api/exams/{examId}/attempts/my-latest returns AttemptDetailResponse
        const latestAttemptResponse = await examAttemptService.getLatestAttempt(examId);
        if (latestAttemptResponse.success && latestAttemptResponse.data) {
          const latestAttempt = latestAttemptResponse.data;
          // If attempt is not submitted, resume it
          // Status: 0 = InProgress, 1 = Submitted, 2 = Graded, 3 = Expired
          // Only resume if status is InProgress (0)
          const statusEnum = latestAttempt.statusEnum !== undefined ? latestAttempt.statusEnum : 
                            (latestAttempt.status !== undefined ? latestAttempt.status : null);
          
          console.log('[StudentTestPage] Latest attempt found:', {
            attemptId: latestAttempt.attemptId || latestAttempt.id || latestAttempt.AttemptId,
            statusEnum: statusEnum,
            status: latestAttempt.status,
            statusEnumRaw: latestAttempt.statusEnum
          });
          
          // Only resume if status is explicitly InProgress (0)
          // If status is 1 (Submitted), 2 (Graded), 3 (Expired), or null/undefined, start new attempt
          if (statusEnum === 0) {
            // Resume attempt - only if status is explicitly InProgress
            const attemptIdValue = latestAttempt.attemptId || latestAttempt.id || latestAttempt.AttemptId;
            setAttemptId(attemptIdValue);
            
            // Load saved answers if any
            // AttemptDetailResponse has Answers: List<AttemptAnswerItem>
            if (latestAttempt.answers && Array.isArray(latestAttempt.answers)) {
              const savedAnswers = {};
              latestAttempt.answers.forEach(ans => {
                const questionId = ans.questionId || ans.QuestionId;
                // Ensure questionId is a number for consistency
                const numericQuestionId = typeof questionId === 'number' ? questionId : parseInt(questionId);
                
                // Handle both camelCase and PascalCase
                if (ans.selectedAnswerIds && Array.isArray(ans.selectedAnswerIds) && ans.selectedAnswerIds.length > 0) {
                  // For MCQ, store the first answer ID (Radio.Group only supports single selection)
                  savedAnswers[numericQuestionId] = ans.selectedAnswerIds[0];
                } else if (ans.SelectedAnswerIds && Array.isArray(ans.SelectedAnswerIds) && ans.SelectedAnswerIds.length > 0) {
                  savedAnswers[numericQuestionId] = ans.SelectedAnswerIds[0];
                } else if (ans.textAnswer) {
                  savedAnswers[numericQuestionId] = ans.textAnswer;
                } else if (ans.TextAnswer) {
                  savedAnswers[numericQuestionId] = ans.TextAnswer;
                }
              });
              console.log(`[Resume attempt] Loaded saved answers:`, savedAnswers);
              setAnswers(savedAnswers);
            }
            
            // Set timer data from latest attempt
            const attemptStartedAt = latestAttempt.startedAt || latestAttempt.StartedAt;
            const attemptDurationMinutes = examData.durationMinutes || examData.DurationMinutes; // Use exam's duration for consistency
            if (attemptStartedAt && attemptDurationMinutes) {
              setStartedAt(attemptStartedAt);
              setDurationMinutes(attemptDurationMinutes);
              // Calculate initial time remaining
              const startTime = new Date(attemptStartedAt);
              const endTime = new Date(startTime.getTime() + attemptDurationMinutes * 60 * 1000);
              const now = new Date();
              const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
              setTimeRemaining(remainingSeconds);
              console.log(`[Timer] Resumed: ${startTime.toISOString()}, Duration: ${attemptDurationMinutes} minutes, Remaining: ${remainingSeconds} seconds`);
            }
            
            // Load questions from attempt if available
            // Note: my-latest returns attempt result, not start response
            // We still need to load questions from exam
            message.info('Đã tiếp tục lần làm bài trước');
            setLoading(false);
            return;
          } else {
            // Status is Submitted (1), Graded (2), Expired (3), or null/undefined
            // Start a new attempt instead
            console.log('[StudentTestPage] Latest attempt is not InProgress (status=' + statusEnum + '), starting new attempt');
          }
        }

        // Try to start new attempt without password first
        const startResponse = await examAttemptService.startAttempt(examId, null);
        
        if (startResponse.success) {
          // Started successfully without password
          const attemptData = startResponse.data;
          console.log('StartAttempt response data:', attemptData);
          setAttemptId(attemptData.attemptId || attemptData.id || attemptData.AttemptId);
          
          // Set timer data from startAttempt response
          const attemptStartedAt = attemptData.startedAt || attemptData.StartedAt;
          const attemptDurationMinutes = attemptData.durationMinutes || attemptData.DurationMinutes || examData.durationMinutes || examData.DurationMinutes;
          
          if (attemptStartedAt && attemptDurationMinutes) {
            setStartedAt(attemptStartedAt);
            setDurationMinutes(attemptDurationMinutes);
            // Calculate initial time remaining
            const startTime = new Date(attemptStartedAt);
            const endTime = new Date(startTime.getTime() + attemptDurationMinutes * 60 * 1000);
            const now = new Date();
            const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeRemaining(remainingSeconds);
            console.log(`[Timer] Started: ${startTime.toISOString()}, Duration: ${attemptDurationMinutes} minutes, Remaining: ${remainingSeconds} seconds`);
          }
          
          // Load questions from startAttempt response if available
          // startAttempt returns AttemptStartResponse: { AttemptId, AttemptNumber, ExamId, DurationMinutes, StartedAt, Questions: List<AttemptQuestionItem> }
          // AttemptQuestionItem: { QuestionId, OrderIndex, PointsPossible }
          // Handle both camelCase and PascalCase
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
                      orderIndex: questionItem?.orderIndex !== undefined ? questionItem.orderIndex : (questionItem?.OrderIndex !== undefined ? questionItem.OrderIndex : index + 1),
                      points: questionItem?.pointsPossible !== undefined && questionItem.pointsPossible !== null ? questionItem.pointsPossible : (questionItem?.PointsPossible !== undefined && questionItem.PointsPossible !== null ? questionItem.PointsPossible : null),
                      text: fullQuestion.title || fullQuestion.Title || fullQuestion.content || fullQuestion.Content,
                      title: fullQuestion.title || fullQuestion.Title,
                      content: fullQuestion.content || fullQuestion.Content,
                      questionTypeEnum: fullQuestion.questionTypeEnum !== undefined ? fullQuestion.questionTypeEnum : (fullQuestion.QuestionTypeEnum !== undefined ? fullQuestion.QuestionTypeEnum : 0),
                      options: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                      multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                      fillBlankAnswers: fullQuestion.fillBlankAnswers || fullQuestion.FillBlankAnswers || [],
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
                          multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                          fillBlankAnswers: fullQuestion.fillBlankAnswers || fullQuestion.FillBlankAnswers || []
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

  // Timer countdown effect
  useEffect(() => {
    // Only run timer if we have startedAt, durationMinutes, and not submitted
    if (!startedAt || !durationMinutes || submitted || timeRemaining === null) {
      return;
    }

    // Calculate time remaining based on server time
    const calculateTimeRemaining = () => {
      const startTime = new Date(startedAt);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      return remaining;
    };

    // Update immediately
    const remaining = calculateTimeRemaining();
    setTimeRemaining(remaining);

    // If time is up, auto-submit
    if (remaining <= 0 && !submitted && !submitting && attemptId) {
      console.log('[Timer] Time is up! Auto-submitting...');
      handleSubmit(new Event('submit'));
      return;
    }

    // Set up interval to update every second
    const interval = setInterval(() => {
      const newRemaining = calculateTimeRemaining();
      setTimeRemaining(newRemaining);

      // If time is up, auto-submit
      if (newRemaining <= 0 && !submitted && !submitting && attemptId) {
        console.log('[Timer] Time is up! Auto-submitting...');
        clearInterval(interval);
        handleSubmit(new Event('submit'));
      }
    }, 1000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, durationMinutes, submitted, submitting, attemptId]);

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
      
      // Set timer data from startAttempt response
      const attemptStartedAt = attemptData.startedAt || attemptData.StartedAt;
      const attemptDurationMinutes = attemptData.durationMinutes || attemptData.DurationMinutes || exam?.durationMinutes || exam?.DurationMinutes;
      
      if (attemptStartedAt && attemptDurationMinutes) {
        setStartedAt(attemptStartedAt);
        setDurationMinutes(attemptDurationMinutes);
        // Calculate initial time remaining
        const startTime = new Date(attemptStartedAt);
        const endTime = new Date(startTime.getTime() + attemptDurationMinutes * 60 * 1000);
        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remainingSeconds);
        console.log(`[Timer] Started: ${startTime.toISOString()}, Duration: ${attemptDurationMinutes} minutes, Remaining: ${remainingSeconds} seconds`);
      }
      
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
                  orderIndex: questionItem?.orderIndex !== undefined ? questionItem.orderIndex : (questionItem?.OrderIndex !== undefined ? questionItem.OrderIndex : index + 1),
                  points: questionItem?.pointsPossible !== undefined && questionItem.pointsPossible !== null ? questionItem.pointsPossible : (questionItem?.PointsPossible !== undefined && questionItem.PointsPossible !== null ? questionItem.PointsPossible : null),
                  text: fullQuestion.title || fullQuestion.Title || fullQuestion.content || fullQuestion.Content,
                  title: fullQuestion.title || fullQuestion.Title,
                  content: fullQuestion.content || fullQuestion.Content,
                  questionTypeEnum: fullQuestion.questionTypeEnum !== undefined ? fullQuestion.questionTypeEnum : (fullQuestion.QuestionTypeEnum !== undefined ? fullQuestion.QuestionTypeEnum : 0),
                  options: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                  multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                  fillBlankAnswers: fullQuestion.fillBlankAnswers || fullQuestion.FillBlankAnswers || [],
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
                          multipleChoiceAnswers: fullQuestion.multipleChoiceAnswers || fullQuestion.MultipleChoiceAnswers || [],
                          fillBlankAnswers: fullQuestion.fillBlankAnswers || fullQuestion.FillBlankAnswers || []
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

  // Handle text answer change for FillBlank questions
  const handleTextAnswerChange = async (questionId, textAnswer) => {
    // Convert to number to ensure it's the correct type
    const numericQuestionId = typeof questionId === 'number' ? questionId : parseInt(questionId);
    
    if (isNaN(numericQuestionId)) {
      console.error(`[handleTextAnswerChange] Invalid questionId:`, questionId);
      return;
    }
    
    console.log(`[handleTextAnswerChange] Question ${numericQuestionId}, Text answer:`, textAnswer);
    console.log(`[handleTextAnswerChange] Current answers state:`, answers);
    
    // Update answers state
    const newAnswers = { ...answers, [numericQuestionId]: textAnswer };
    console.log(`[handleTextAnswerChange] New answers state:`, newAnswers);
    setAnswers(newAnswers);

    // Submit answer to API if attemptId exists and not already submitted
    if (!attemptId) {
      console.error(`[handleTextAnswerChange] Cannot save answer - attemptId is null or undefined`);
      message.error('Không tìm thấy thông tin lần làm bài. Vui lòng tải lại trang.');
      return;
    }
    
    if (!examId) {
      console.error(`[handleTextAnswerChange] Cannot save answer - examId is null or undefined`);
      message.error('Không tìm thấy thông tin bài thi. Vui lòng tải lại trang.');
      return;
    }
    
    if (submitted) {
      console.warn(`[handleTextAnswerChange] Cannot save answer - attempt already submitted`);
      return;
    }
    
    try {
      console.log(`[handleTextAnswerChange] Preparing to save answer:`, {
        examId: examId,
        attemptId: attemptId,
        questionId: numericQuestionId,
        textAnswer: textAnswer
      });
      
      const result = await examAttemptService.submitAnswer(examId, attemptId, {
        questionId: numericQuestionId,
        textAnswer: textAnswer || '', // Send empty string if null/undefined
      });
      
      if (result.success) {
        console.log(`[handleTextAnswerChange] Answer saved successfully for question ${numericQuestionId}, textAnswer: ${textAnswer}`);
      } else {
        console.error(`[handleTextAnswerChange] Failed to save answer for question ${numericQuestionId}:`, result.message, result.error);
        // If attempt is already submitted, don't try to save again
        if (result.message && (result.message.includes('submitted') || result.message.includes('SUBMITTED'))) {
          setSubmitted(true);
          message.warning('Bài thi đã được nộp, không thể lưu câu trả lời');
        } else {
          message.error(`Không thể lưu câu trả lời: ${result.message || 'Lỗi không xác định'}`);
        }
      }
    } catch (err) {
      console.error(`[handleTextAnswerChange] Error saving answer for question ${numericQuestionId}:`, err);
      console.error(`[handleTextAnswerChange] Error details:`, {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        stack: err.stack
      });
      // Check if error is due to attempt already submitted
      if (err.response?.status === 400) {
        const errorData = err.response?.data;
        const errorMessage = errorData?.message || errorData?.Message || err.message || '';
        if (errorMessage.includes('submitted') || errorMessage.includes('SUBMITTED') || errorMessage.includes('CANNOT_SAVE_ANSWER')) {
          console.warn('Attempt may already be submitted, stopping answer saves');
          setSubmitted(true);
          message.warning('Bài thi đã được nộp, không thể lưu câu trả lời');
        } else {
          message.error(`Lỗi khi lưu câu trả lời: ${errorMessage}`);
        }
      } else if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 404) {
        message.error('Không tìm thấy attempt hoặc exam. Vui lòng tải lại trang.');
      } else {
        message.error('Có lỗi xảy ra khi lưu câu trả lời. Vui lòng thử lại.');
      }
    }
  };

  const handleOptionChange = async (questionId, answerId) => {
    // Handle both single answer and array of answers
    // For MCQ, answerId should be the database Id of the MultipleChoiceAnswer
    // Convert to number to ensure it's the correct type
    const numericQuestionId = typeof questionId === 'number' ? questionId : parseInt(questionId);
    const numericAnswerId = typeof answerId === 'number' ? answerId : (typeof answerId === 'string' ? parseInt(answerId) : answerId);
    
    if (isNaN(numericQuestionId)) {
      console.error(`[handleOptionChange] Invalid questionId:`, questionId);
      return;
    }
    
    if (isNaN(numericAnswerId)) {
      console.error(`[handleOptionChange] Invalid answerId for question ${numericQuestionId}:`, answerId);
      return;
    }
    
    console.log(`[handleOptionChange] Question ${numericQuestionId}, Selected answerId: ${numericAnswerId} (type: ${typeof numericAnswerId})`);
    console.log(`[handleOptionChange] Current answers state:`, answers);
    console.log(`[handleOptionChange] Current answer for question ${numericQuestionId}:`, answers[numericQuestionId]);
    
    // Ensure questionId is consistent (always use numeric)
    const newAnswers = { ...answers, [numericQuestionId]: numericAnswerId };
    console.log(`[handleOptionChange] New answers state:`, newAnswers);
    console.log(`[handleOptionChange] New answer for question ${numericQuestionId}:`, newAnswers[numericQuestionId]);
    setAnswers(newAnswers);

    // Submit answer to API if attemptId exists and not already submitted
    if (!attemptId) {
      console.error(`[handleOptionChange] Cannot save answer - attemptId is null or undefined`);
      message.error('Không tìm thấy thông tin lần làm bài. Vui lòng tải lại trang.');
      return;
    }
    
    if (!examId) {
      console.error(`[handleOptionChange] Cannot save answer - examId is null or undefined`);
      message.error('Không tìm thấy thông tin bài thi. Vui lòng tải lại trang.');
      return;
    }
    
    if (submitted) {
      console.warn(`[handleOptionChange] Cannot save answer - attempt already submitted`);
      return;
    }
    
    try {
      // Backend expects: { questionId, selectedAnswerIds: List<int>, textAnswer, answerData }
      // Convert answerId to array format (always array for consistency)
      const selectedAnswerIds = [numericAnswerId];
      
      console.log(`[handleOptionChange] Preparing to save answer:`, {
        examId: examId,
        attemptId: attemptId,
        questionId: numericQuestionId,
        selectedAnswerIds: selectedAnswerIds,
        selectedAnswerIdsType: Array.isArray(selectedAnswerIds) ? 'array' : typeof selectedAnswerIds,
        selectedAnswerIdsLength: selectedAnswerIds.length
      });
      
      const result = await examAttemptService.submitAnswer(examId, attemptId, {
        questionId: numericQuestionId,
        selectedAnswerIds: selectedAnswerIds, // Array of numbers (database Ids)
      });
      
      if (result.success) {
        console.log(`[handleOptionChange] Answer saved successfully for question ${numericQuestionId}, answerId: ${numericAnswerId}`);
      } else {
        console.error(`[handleOptionChange] Failed to save answer for question ${numericQuestionId}:`, result.message, result.error);
        // If attempt is already submitted, don't try to save again
        if (result.message && (result.message.includes('submitted') || result.message.includes('SUBMITTED'))) {
          setSubmitted(true);
          message.warning('Bài thi đã được nộp, không thể lưu câu trả lời');
        } else {
          message.error(`Không thể lưu câu trả lời: ${result.message || 'Lỗi không xác định'}`);
        }
      }
    } catch (err) {
      console.error(`[handleOptionChange] Error saving answer for question ${numericQuestionId}:`, err);
      console.error(`[handleOptionChange] Error details:`, {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        stack: err.stack
      });
      // Check if error is due to attempt already submitted
      if (err.response?.status === 400) {
        const errorData = err.response?.data;
        const errorMessage = errorData?.message || errorData?.Message || err.message || '';
        if (errorMessage.includes('submitted') || errorMessage.includes('SUBMITTED') || errorMessage.includes('CANNOT_SAVE_ANSWER')) {
          console.warn('Attempt may already be submitted, stopping answer saves');
          setSubmitted(true);
          message.warning('Bài thi đã được nộp, không thể lưu câu trả lời');
        } else {
          message.error(`Lỗi khi lưu câu trả lời: ${errorMessage}`);
        }
      } else if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 404) {
        message.error('Không tìm thấy attempt hoặc exam. Vui lòng tải lại trang.');
      } else {
        message.error('Có lỗi xảy ra khi lưu câu trả lời. Vui lòng thử lại.');
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

      // SubmitResponse: { AttemptId, TotalScore, ScorePercentage, Passed, Details: List<SubmitQuestionDetail> }
      // SubmitQuestionDetail: { QuestionId, PointsPossible, PointsEarned, Correct, Explanation? }
      const submitData = submitResponse.data;
      console.log('[StudentTestPage] Submit response data:', submitData);
      console.log('[StudentTestPage] Submit response details:', submitData?.details || submitData?.Details);
      console.log('[StudentTestPage] Current answers state:', answers);
      console.log('[StudentTestPage] Current exam questions:', exam?.questions);
      
      // Save answers and exam data BEFORE clearing state
      const savedAnswers = { ...answers };
      const savedQuestions = exam?.questions || [];
      const savedExamTitle = exam?.title || exam?.Title || 'Kết quả bài thi';
      const savedTotalQuestions = exam?.totalQuestions || savedQuestions.length || 0;
      const savedTotalPoints = exam?.totalPoints || exam?.TotalPoints || 10;
      
      // Clear attemptId, answers, and timer to prevent resuming this attempt
      // This ensures that when user comes back, a new attempt will be started
      setAttemptId(null);
      setAnswers({});
      setTimeRemaining(null);
      setStartedAt(null);
      setDurationMinutes(null);
      
      // Navigate to result page with submit response data
      const resultData = {
        examId,
        attemptId: submitData?.attemptId || submitData?.AttemptId || attemptId,
        examTitle: savedExamTitle,
        totalScore: submitData?.totalScore !== undefined ? submitData.totalScore : (submitData?.TotalScore !== undefined ? submitData.TotalScore : 0),
        scorePercentage: submitData?.scorePercentage !== undefined ? submitData.scorePercentage : (submitData?.ScorePercentage !== undefined ? submitData.ScorePercentage : 0),
        passed: submitData?.passed !== undefined ? submitData.passed : (submitData?.Passed !== undefined ? submitData.Passed : false),
        details: submitData?.details || submitData?.Details || [],
        totalQuestions: savedTotalQuestions,
        totalPoints: savedTotalPoints,
        answers: savedAnswers,
        questions: savedQuestions,
        submitData: submitData
      };
      
      console.log('[StudentTestPage] Navigate with resultData:', resultData);

      // Navigate to result page - this will clear the page state
      // When user comes back to this page, useEffect will run again and check for latest attempt
      // Since the attempt is now Submitted (status=1), it will start a new attempt
      navigate('/student-test/result', {
        state: resultData,
        replace: true // Use replace to prevent going back to the test page
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
            <div style={{ marginTop: 12, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
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
              {/* Timer display */}
              {timeRemaining !== null && timeRemaining >= 0 && !submitted && (
                <Space>
                  <ClockCircleOutlined style={{ 
                    color: timeRemaining <= 60 ? '#ff4d4f' : (timeRemaining <= 300 ? '#faad14' : '#52c41a'),
                    fontSize: 18
                  }} />
                  <Text strong style={{ 
                    fontSize: 18,
                    color: timeRemaining <= 60 ? '#ff4d4f' : (timeRemaining <= 300 ? '#faad14' : '#52c41a'),
                    fontFamily: 'monospace'
                  }}>
                    {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:
                    {(timeRemaining % 60).toString().padStart(2, '0')}
                  </Text>
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
            questions
              .filter((q) => {
                // Only show Multiple Choice questions (questionTypeEnum === 0)
                const questionTypeEnum = q.questionTypeEnum !== undefined 
                  ? q.questionTypeEnum 
                  : (q.QuestionTypeEnum !== undefined 
                    ? q.QuestionTypeEnum 
                    : (q.question?.questionTypeEnum !== undefined 
                      ? q.question.questionTypeEnum 
                      : (q.question?.QuestionTypeEnum !== undefined ? q.question.QuestionTypeEnum : 0)));
                return questionTypeEnum === 0;
              })
              .map((q, idx) => {
              // Handle different question formats
              // Backend returns ExamQuestionResponse with QuestionId, we've loaded full question details
              const questionId = q.questionId || q.QuestionId || q.id || q.Id || q.examQuestionId || q.ExamQuestionId;
              const questionText = q.text || q.title || q.content || q.questionTitle || q.QuestionTitle || q.questionContent || q.QuestionContent || q.question?.title || q.question?.Title || q.question?.content || q.question?.Content || 'Câu hỏi';
              const questionContent = q.content || q.Content || q.question?.content || q.question?.Content || questionText;
              
              // Use options from loaded question data (for MultipleChoice)
              const options = q.options || q.multipleChoiceAnswers || q.MultipleChoiceAnswers || q.question?.multipleChoiceAnswers || q.question?.MultipleChoiceAnswers || [];
              
              // MultipleChoice question - render radio buttons
              return (
                <Card key={questionId} className="chemistry-card">
                  <Title level={5} style={{ marginBottom: 16, color: 'var(--chem-purple-dark)' }}>
                    Câu {idx + 1}: {questionText}
                  </Title>
                  {options.length > 0 ? (
                    <Radio.Group
                      value={answers[questionId] || answers[parseInt(questionId)] || answers[String(questionId)]}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        console.log(`[Radio.Group onChange] Question ${questionId} (type: ${typeof questionId}), Selected value:`, selectedValue, 'Type:', typeof selectedValue);
                        console.log(`[Radio.Group onChange] Current answers state:`, answers);
                        console.log(`[Radio.Group onChange] Current answer for question ${questionId}:`, answers[questionId]);
                        handleOptionChange(questionId, selectedValue);
                      }}
                      disabled={submitted || submitting}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {options.map((opt, oidx) => {
                          // Backend returns MultipleChoiceAnswerPayload: { Id, AnswerText, IsCorrect, Explanation, OrderIndex }
                          const optionText = typeof opt === 'string' 
                            ? opt 
                            : (opt.answerText || opt.AnswerText || opt.text || opt.option || opt.Text || '');
                          
                          // Use answer ID from backend - MUST be the database Id, not a composite key
                          // Backend maps: Id = a.Id (from QuestionMultipleChoiceAnswer.Id)
                          // Handle both camelCase and PascalCase
                          let answerId = null;
                          if (opt.id !== undefined && opt.id !== null && !isNaN(parseInt(opt.id))) {
                            answerId = typeof opt.id === 'number' ? opt.id : parseInt(opt.id);
                          } else if (opt.Id !== undefined && opt.Id !== null && !isNaN(parseInt(opt.Id))) {
                            answerId = typeof opt.Id === 'number' ? opt.Id : parseInt(opt.Id);
                          } else if (opt.answerId !== undefined && opt.answerId !== null && !isNaN(parseInt(opt.answerId))) {
                            answerId = typeof opt.answerId === 'number' ? opt.answerId : parseInt(opt.answerId);
                          } else if (opt.AnswerId !== undefined && opt.AnswerId !== null && !isNaN(parseInt(opt.AnswerId))) {
                            answerId = typeof opt.AnswerId === 'number' ? opt.AnswerId : parseInt(opt.AnswerId);
                          }
                          
                          // If no valid Id found, log error and use a fallback (but this should not happen)
                          if (answerId === null || isNaN(answerId)) {
                            console.error(`[StudentTestPage] No valid answer Id found for question ${questionId}, option ${oidx}:`, opt);
                            // Fallback: use index, but this will cause grading to fail
                            answerId = oidx;
                          }
                          
                          console.log(`[StudentTestPage] Question ${questionId}, Option ${oidx}: answerId=${answerId}, optionText="${optionText}"`, opt);
                          
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
