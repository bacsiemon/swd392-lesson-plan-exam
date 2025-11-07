import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Row, Col, Space, Tag, Progress, Statistic, Select, Badge, Button, Spin, Empty, message } from 'antd';
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import examService from '../services/examService';
import examAttemptService from '../services/examAttemptService';
import '../styles/chemistryTheme.css';

const { Title, Text } = Typography;
const { Option } = Select;

const liquidGlassStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  @keyframes floatReverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(20px) rotate(-180deg); }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = liquidGlassStyles;
  document.head.appendChild(styleSheet);
}

const TestScoresPage = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [testScores, setTestScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load test history from API
  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    setLoading(true);
    try {
      // Get current student ID from token
      let currentStudentId = null;
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          currentStudentId = decoded.userId || decoded.sub || 
                           decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                           decoded.id;
          if (currentStudentId) {
            currentStudentId = parseInt(currentStudentId);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }

      if (!currentStudentId) {
        console.warn('Cannot load test history: Student ID not found');
        setLoading(false);
        return;
      }

      // Get all active exams
      const examsResponse = await examService.getExams({ status: 2 }); // 2 = Active
      if (!examsResponse.success || !examsResponse.data) {
        console.warn('Failed to load exams:', examsResponse.message);
        setLoading(false);
        return;
      }

      const exams = examsResponse.data;

      // For each exam, get attempts and filter by current student
      // Limit to first 50 exams to avoid too many API calls
      const examsToCheck = exams.slice(0, 50);
      const attemptPromises = examsToCheck.map(async (exam) => {
        try {
          const attemptsResponse = await examAttemptService.getExamAttempts(exam.id || exam.Id);
          if (attemptsResponse.success && attemptsResponse.data) {
            // Filter attempts by current student and only get submitted/graded ones
            const studentAttempts = attemptsResponse.data
              .filter(attempt => {
                const studentId = attempt.StudentId !== undefined ? attempt.StudentId : attempt.studentId;
                const studentIdNum = typeof studentId === 'string' ? parseInt(studentId) : studentId;
                const currentIdNum = typeof currentStudentId === 'string' ? parseInt(currentStudentId) : currentStudentId;
                
                if (studentIdNum !== currentIdNum) return false;

                // Only include submitted (1) or graded (2) attempts
                const status = attempt.Status !== undefined ? attempt.Status : attempt.status;
                const statusEnum = attempt.StatusEnum !== undefined ? attempt.StatusEnum : status;
                return statusEnum === 1 || statusEnum === 2 || status === 1 || status === 2;
              })
              .map(attempt => ({
                ...attempt,
                examTitle: exam.title || exam.Title || 'Không có tiêu đề',
                examId: exam.id || exam.Id,
                examDescription: exam.description || exam.Description || '',
                examDuration: exam.durationMinutes || exam.DurationMinutes || 0,
              }));
            
            return studentAttempts;
          }
          return [];
        } catch (error) {
          console.error(`Error loading attempts for exam ${exam.id || exam.Id}:`, error);
          return [];
        }
      });

      const results = await Promise.all(attemptPromises);
      const flattenedAttempts = results.flat();
      
      // Sort by submitted date (most recent first)
      flattenedAttempts.sort((a, b) => {
        const dateA = new Date(a.SubmittedAt || a.submittedAt || a.StartedAt || a.startedAt || 0);
        const dateB = new Date(b.SubmittedAt || b.submittedAt || b.StartedAt || b.startedAt || 0);
        return dateB - dateA;
      });

      // Map to table format
      const mappedTestScores = flattenedAttempts.map((attempt, index) => {
        const submittedAt = attempt.SubmittedAt || attempt.submittedAt || attempt.StartedAt || attempt.startedAt;
        const totalScore = attempt.TotalScore !== undefined ? attempt.TotalScore : (attempt.totalScore !== undefined ? attempt.totalScore : 0);
        const maxScore = attempt.MaxScore !== undefined ? attempt.MaxScore : (attempt.maxScore !== undefined ? attempt.maxScore : 10);
        const scoreOnTen = maxScore > 0 ? (totalScore / maxScore) * 10 : 0;
        const statusEnum = attempt.StatusEnum !== undefined ? attempt.StatusEnum : (attempt.Status !== undefined ? attempt.Status : null);
        
        // Extract date for semester calculation (simple: based on month)
        const date = submittedAt ? new Date(submittedAt) : new Date();
        const semester = date.getMonth() < 6 ? '1' : '2'; // Jan-Jun = semester 1, Jul-Dec = semester 2

        return {
          key: attempt.AttemptId || attempt.attemptId || attempt.Id || attempt.id || index.toString(),
          testName: attempt.examTitle || 'Không có tiêu đề',
          subject: 'Hóa học', // Default subject
          date: submittedAt || new Date().toISOString(),
          score: scoreOnTen.toFixed(2),
          maxScore: 10,
          status: statusEnum === 2 ? 'completed' : (statusEnum === 1 ? 'completed' : 'pending'),
          type: 'Kiểm tra',
          semester: semester,
          attemptId: attempt.AttemptId || attempt.attemptId || attempt.Id || attempt.id,
          examId: attempt.examId,
          totalScore: totalScore,
          maxScoreOriginal: maxScore,
          statusEnum: statusEnum,
        };
      });

      setTestScores(mappedTestScores);
    } catch (error) {
      console.error('Error loading test history:', error);
      message.error('Không thể tải lịch sử làm bài');
    } finally {
      setLoading(false);
    }
  };

  const completedTests = testScores.filter((test) => test.status === 'completed');
  const averageScore = completedTests.length > 0
    ? (completedTests.reduce((sum, test) => sum + parseFloat(test.score), 0) / completedTests.length).toFixed(2)
    : '0.00';
  const highestScore = completedTests.length > 0
    ? Math.max(...completedTests.map((test) => parseFloat(test.score))).toFixed(1)
    : '0';
  const lowestScore = completedTests.length > 0
    ? Math.min(...completedTests.map((test) => parseFloat(test.score))).toFixed(1)
    : '0';

  const filteredData = testScores.filter((test) => {
    const subjectMatch = selectedSubject === 'all' || test.subject === selectedSubject;
    const semesterMatch = test.semester === selectedSemester;
    return subjectMatch && semesterMatch;
  });

  const getScoreColor = (score) => {
    if (score >= 8.5) return '#52c41a';
    if (score >= 6.5) return '#1890ff';
    if (score >= 5.0) return '#faad14';
    return '#f5222d';
  };

  const getScoreTag = (score) => {
    if (score >= 8.5) return { text: 'Giỏi', color: 'success' };
    if (score >= 6.5) return { text: 'Khá', color: 'processing' };
    if (score >= 5.0) return { text: 'Trung bình', color: 'warning' };
    return { text: 'Yếu', color: 'error' };
  };

  // Handle viewing test result
  const handleViewResult = async (record) => {
    const examId = record.examId;
    const attemptId = record.attemptId;
    
    if (!examId || !attemptId) {
      message.error('Không tìm thấy thông tin bài thi');
      return;
    }

    try {
      // Get attempt details
      const attemptResponse = await examAttemptService.getAttemptById(examId, attemptId);
      if (!attemptResponse.success || !attemptResponse.data) {
        message.error('Không thể tải kết quả bài thi');
        return;
      }

      // Get exam details
      const examResponse = await examService.getExamById(examId);
      if (!examResponse.success || !examResponse.data) {
        message.error('Không thể tải thông tin bài thi');
        return;
      }

      const attemptData = attemptResponse.data;
      const examData = examResponse.data;

      // Calculate score
      const totalScore = attemptData.TotalScore !== undefined ? attemptData.TotalScore : (attemptData.totalScore !== undefined ? attemptData.totalScore : 0);
      const maxScore = attemptData.MaxScore !== undefined ? attemptData.MaxScore : (attemptData.maxScore !== undefined ? attemptData.maxScore : examData.totalPoints || examData.TotalPoints || 10);
      const scorePercentage = attemptData.ScorePercentage !== undefined ? attemptData.ScorePercentage : (attemptData.scorePercentage !== undefined ? attemptData.scorePercentage : (maxScore > 0 ? (totalScore / maxScore) * 100 : 0));

      // Navigate to result page
      navigate('/student-test/result', {
        state: {
          examId: examId,
          attemptId: attemptId,
          examTitle: examData.title || examData.Title || 'Kết quả bài thi',
          totalScore: totalScore,
          scorePercentage: scorePercentage,
          maxScore: maxScore,
          totalQuestions: examData.totalQuestions || examData.TotalQuestions || 0,
          score: Math.round((totalScore / maxScore) * (examData.totalQuestions || examData.TotalQuestions || 1)),
          answers: {},
          questions: [],
          submitData: attemptData
        }
      });
    } catch (error) {
      console.error('Error viewing result:', error);
      message.error('Không thể xem kết quả bài thi');
    }
  };

  const columns = [
    {
      title: 'Tên bài kiểm tra',
      dataIndex: 'testName',
      key: 'testName',
      width: '30%',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <FileTextOutlined /> {record.type}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
      width: '18%',
      render: (date) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
        </Space>
      ),
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      width: '18%',
      align: 'center',
      render: (score, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text strong style={{ fontSize: '20px', color: getScoreColor(parseFloat(score)) }}>
            {score}/{record.maxScore}
          </Text>
          <Progress
            percent={(parseFloat(score) / record.maxScore) * 100}
            strokeColor={getScoreColor(parseFloat(score))}
            showInfo={false}
            size="small"
          />
        </Space>
      ),
      sorter: (a, b) => parseFloat(a.score) - parseFloat(b.score),
    },
    {
      title: 'Xếp loại',
      key: 'rating',
      width: '12%',
      align: 'center',
      render: (_, record) => {
        const tag = getScoreTag(parseFloat(record.score));
        return <Tag color={tag.color}>{tag.text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      align: 'center',
      render: (status) => (
        <Badge
          status={status === 'completed' ? 'success' : 'processing'}
          text={status === 'completed' ? 'Đã chấm' : 'Đang chấm'}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewResult(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '-30%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          animation: 'floatReverse 15s ease-in-out infinite',
          zIndex: 0,
        }}
      />

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '40px 20px',
          minHeight: '100vh',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <Title level={2} style={{ color: 'rgba(255, 255, 255, 0.95)', marginBottom: 8 }}>
            <TrophyOutlined style={{ marginRight: 12 }} />
            Điểm kiểm tra của bạn
          </Title>
          <Text style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Xem và theo dõi kết quả học tập của bạn
          </Text>
        </div>

        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Space size="large" wrap>
            <Space direction="vertical" size="small">
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Học kỳ:</Text>
              <Select value={selectedSemester} onChange={setSelectedSemester} style={{ width: 150 }}>
                <Option value="1">Học kỳ 1</Option>
                <Option value="2">Học kỳ 2</Option>
              </Select>
            </Space>
            <Space direction="vertical" size="small">
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Môn học:</Text>
              <Select value={selectedSubject} onChange={setSelectedSubject} style={{ width: 200 }}>
                <Option value="all">Tất cả môn học</Option>
                <Option value="Hóa học">Hóa học</Option>
              </Select>
            </Space>
          </Space>
        </Card>

        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Statistic
                title={<Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Điểm trung bình</Text>}
                value={averageScore}
                precision={2}
                valueStyle={{ color: '#52c41a', fontSize: '32px' }}
                prefix={<BarChartOutlined />}
                suffix="/10"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Statistic
                title={<Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Điểm cao nhất</Text>}
                value={highestScore}
                precision={1}
                valueStyle={{ color: '#1890ff', fontSize: '32px' }}
                prefix={<RiseOutlined />}
                suffix="/10"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Statistic
                title={<Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Điểm thấp nhất</Text>}
                value={lowestScore}
                precision={1}
                valueStyle={{ color: '#faad14', fontSize: '32px' }}
                prefix={<FallOutlined />}
                suffix="/10"
              />
            </Card>
          </Col>
        </Row>

        <Card
          style={{
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" tip="Đang tải lịch sử làm bài..." />
            </div>
          ) : filteredData.length === 0 ? (
            <Empty 
              description="Chưa có bài kiểm tra nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} bài kiểm tra`,
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default TestScoresPage;
