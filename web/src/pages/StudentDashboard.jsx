import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Card, Statistic, Spin, message } from 'antd';
import {
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  CalendarOutlined,
  StarOutlined,
  QuestionCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

// Import components
import RecentLessonsList from '../components/RecentLessonsList';
import UpcomingExamsList from '../components/UpcomingExamsList';
import AchievementsList from '../components/AchievementsList';

// Import utilities
import { 
  BRAND_COLORS, 
  recentLessons, 
  upcomingExams, 
  achievements
} from '../utils/studentDashboardUtils';

// Import services
import studentDashboardService from '../services/studentDashboardService';

// Import styles
import '../styles/chemistryTheme.css';

const { Title, Text } = Typography;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentTime] = useState(new Date().toLocaleDateString('vi-VN'));
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState({
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    totalAttempts: 0,
    submittedAttempts: 0,
    gradedAttempts: 0,
    recentAttempts: []
  });

  // Load student statistics on mount
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const result = await studentDashboardService.getStudentStats();
        if (result.success) {
          setStudentStats(result.stats);
        } else {
          console.error('[StudentDashboard] Failed to load stats:', result.message);
          message.warning(result.message || 'Không thể tải thống kê');
        }
      } catch (error) {
        console.error('[StudentDashboard] Error loading stats:', error);
        message.error('Có lỗi xảy ra khi tải thống kê');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleToolClick = (link) => {
    navigate(link);
  };

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      
      {/* Header */}
      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8, color: '#4a3560' }}>
          Chào mừng, Học sinh! 👋
        </Title>
        <Text className="chemistry-subtitle" style={{ fontSize: '16px', color: '#7a6a8e' }}>
          Hôm nay là {currentTime} - Hãy tiếp tục hành trình học tập của bạn!
        </Text>
      </Card>

      {/* Statistics Cards */}
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ 
          borderBottom: '2px solid #d4c5e3', 
          paddingBottom: 10, 
          color: '#4a3560',
          marginBottom: 24
        }}>
          📊 Thống kê bài kiểm tra
        </Title>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" tip="Đang tải thống kê..." />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.EXAM}` }}>
                <Statistic
                  title={<span style={{ color: '#595959', fontWeight: 500 }}>Tổng bài kiểm tra</span>}
                  value={studentStats.totalExams}
                  prefix={<ExperimentOutlined style={{ color: BRAND_COLORS.EXAM }} />}
                  valueStyle={{ color: BRAND_COLORS.EXAM, fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.LESSON}` }}>
                <Statistic
                  title={<span style={{ color: '#595959', fontWeight: 500 }}>Đã nộp bài</span>}
                  value={studentStats.submittedAttempts}
                  prefix={<CheckCircleOutlined style={{ color: BRAND_COLORS.LESSON }} />}
                  valueStyle={{ color: BRAND_COLORS.LESSON, fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.PROGRESS}` }}>
                <Statistic
                  title={<span style={{ color: '#595959', fontWeight: 500 }}>Điểm trung bình</span>}
                  value={studentStats.averageScore}
                  suffix="%"
                  prefix={<BarChartOutlined style={{ color: BRAND_COLORS.PROGRESS }} />}
                  valueStyle={{ color: BRAND_COLORS.PROGRESS, fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.ACHIEVEMENT}` }}>
                <Statistic
                  title={<span style={{ color: '#595959', fontWeight: 500 }}>Tổng lần làm bài</span>}
                  value={studentStats.totalAttempts}
                  prefix={<PlayCircleOutlined style={{ color: BRAND_COLORS.ACHIEVEMENT }} />}
                  valueStyle={{ color: BRAND_COLORS.ACHIEVEMENT, fontWeight: 600 }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ 
          borderBottom: '2px solid #d4c5e3', 
          paddingBottom: 10, 
          color: '#4a3560'
        }}>
          🚀 Hành động nhanh
        </Title>
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={12}>
            <Card
              hoverable
              className="chemistry-card"
              onClick={() => handleToolClick('/lesson-plans')}
              style={{ borderLeft: `4px solid ${BRAND_COLORS.STUDY}`, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <BookOutlined style={{ fontSize: '36px', color: BRAND_COLORS.STUDY, marginRight: 16 }} />
                <div>
                  <Title level={4} style={{ margin: 0, color: '#4a3560' }}>
                    Bài giảng và Tài liệu
                  </Title>
                  <Text style={{ color: '#595959' }}>
                    Xem và học các bài giảng được phân phối bởi giáo viên.
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Card
              hoverable
              className="chemistry-card"
              onClick={() => handleToolClick('/exams')}
              style={{ borderLeft: `4px solid ${BRAND_COLORS.EXAM}`, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <QuestionCircleOutlined style={{ fontSize: '36px', color: BRAND_COLORS.EXAM, marginRight: 16 }} />
                <div>
                  <Title level={4} style={{ margin: 0, color: '#4a3560' }}>
                    Làm bài kiểm tra
                  </Title>
                  <Text style={{ color: '#595959' }}>
                    Thực hiện các bài kiểm tra và đánh giá kiến thức của bạn.
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Recent Exam Attempts */}
      {!loading && studentStats.recentAttempts.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Card className="chemistry-card">
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ 
                color: '#4a3560', 
                margin: 0
              }}>
                <ClockCircleOutlined style={{ marginRight: 8, color: BRAND_COLORS.EXAM }} />
                Bài kiểm tra gần đây
              </Title>
              <Text style={{ color: '#595959', fontSize: '14px' }}>
                Các bài kiểm tra bạn đã làm gần đây
              </Text>
            </div>
            <Row gutter={[16, 16]}>
              {studentStats.recentAttempts.map((attempt, index) => {
                const examTitle = attempt.examTitle || attempt.ExamTitle || 'Bài kiểm tra';
                const scorePercentage = attempt.ScorePercentage !== undefined 
                  ? attempt.ScorePercentage 
                  : (attempt.scorePercentage !== undefined ? attempt.scorePercentage : null);
                const submittedAt = attempt.SubmittedAt || attempt.submittedAt;
                const status = attempt.Status !== undefined ? attempt.Status : attempt.status;
                const isGraded = status === 2; // Graded
                
                return (
                  <Col xs={24} sm={12} lg={8} key={attempt.Id || attempt.id || index}>
                    <Card 
                      className="chemistry-card"
                      hoverable
                      onClick={() => navigate(`/student-test/result?attemptId=${attempt.Id || attempt.id}&examId=${attempt.ExamId || attempt.examId}`)}
                      style={{ 
                        cursor: 'pointer',
                        borderLeft: `4px solid ${isGraded && scorePercentage >= 50 ? BRAND_COLORS.EXAM : BRAND_COLORS.PROGRESS}`
                      }}
                    >
                      <div>
                        <Text strong style={{ color: '#4a3560', fontSize: '16px', display: 'block', marginBottom: 8 }}>
                          {examTitle}
                        </Text>
                        {isGraded && scorePercentage !== null && (
                          <div style={{ marginBottom: 8 }}>
                            <Text style={{ color: '#595959', fontSize: '14px' }}>
                              Điểm: <Text strong style={{ color: scorePercentage >= 50 ? BRAND_COLORS.EXAM : '#ff4d4f', fontSize: '18px' }}>
                                {scorePercentage.toFixed(1)}%
                              </Text>
                            </Text>
                          </div>
                        )}
                        {submittedAt && (
                          <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            Nộp: {new Date(submittedAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </div>
      )}

      {/* Content Grid */}
      <Row gutter={[24, 24]}>
        {/* Recent Lessons */}
        <Col xs={24} lg={12}>
          <Card className="chemistry-card" style={{ height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ 
                color: '#4a3560', 
                margin: 0
              }}>
                <BookOutlined style={{ marginRight: 8, color: BRAND_COLORS.STUDY }} />
                Bài học gần đây
              </Title>
              <Text style={{ color: '#595959', fontSize: '14px' }}>
                Tiếp tục học tập với các bài học chưa hoàn thành
              </Text>
            </div>
            <RecentLessonsList lessons={recentLessons} />
          </Card>
        </Col>

        {/* Upcoming Exams */}
        <Col xs={24} lg={12}>
          <Card className="chemistry-card" style={{ height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ 
                color: '#4a3560', 
                margin: 0
              }}>
                <CalendarOutlined style={{ marginRight: 8, color: BRAND_COLORS.EXAM }} />
                Sắp tới
              </Title>
              <Text style={{ color: '#595959', fontSize: '14px' }}>
                Các bài kiểm tra và bài tập sắp tới
              </Text>
            </div>
            <UpcomingExamsList exams={upcomingExams} />
          </Card>
        </Col>
      </Row>

      {/* Achievements */}
      <div style={{ marginTop: 32 }}>
        <Card className="chemistry-card">
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ 
              color: '#4a3560', 
              margin: 0
            }}>
              <TrophyOutlined style={{ marginRight: 8, color: BRAND_COLORS.ACHIEVEMENT }} />
              Thành tích
            </Title>
            <Text style={{ color: '#595959', fontSize: '14px' }}>
              Các thành tích bạn đã đạt được trong quá trình học tập
            </Text>
          </div>
          <AchievementsList achievements={achievements} />
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;