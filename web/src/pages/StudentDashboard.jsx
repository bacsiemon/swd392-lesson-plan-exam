import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Card, Statistic } from 'antd';
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
} from '@ant-design/icons';

// Import components
import RecentLessonsList from '../components/RecentLessonsList';
import UpcomingExamsList from '../components/UpcomingExamsList';
import AchievementsList from '../components/AchievementsList';

// Import utilities
import { 
  BRAND_COLORS, 
  studentStats, 
  recentLessons, 
  upcomingExams, 
  achievements
} from '../utils/studentDashboardUtils';

// Import styles
import '../styles/chemistryTheme.css';

const { Title, Text } = Typography;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentTime] = useState(new Date().toLocaleDateString('vi-VN'));

  const handleToolClick = (link) => {
    navigate(link);
  };

  return (
    <div className="chemistry-page">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: 'var(--chem-purple-dark)', marginBottom: 8 }}>
          Chào mừng, Học sinh! 👋
        </Title>
        <Text style={{ fontSize: '16px', color: 'var(--chem-text-secondary)' }}>
          Hôm nay là {currentTime} - Hãy tiếp tục hành trình học tập của bạn!
        </Text>
      </div>

      {/* Statistics Cards */}
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ 
          borderBottom: '2px solid var(--chem-border)', 
          paddingBottom: 10, 
          color: 'var(--chem-purple-dark)'
        }}>
          📊 Thống kê học tập
        </Title>
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.LESSON}` }}>
              <Statistic
                title={<span style={{ color: 'var(--chem-text-secondary)' }}>Tổng bài học</span>}
                value={studentStats.totalLessons}
                prefix={<BookOutlined style={{ color: BRAND_COLORS.LESSON }} />}
                valueStyle={{ color: BRAND_COLORS.LESSON }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.EXAM}` }}>
              <Statistic
                title={<span style={{ color: 'var(--chem-text-secondary)' }}>Đã hoàn thành</span>}
                value={studentStats.completedLessons}
                prefix={<CheckCircleOutlined style={{ color: BRAND_COLORS.EXAM }} />}
                valueStyle={{ color: BRAND_COLORS.EXAM }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.PROGRESS}` }}>
              <Statistic
                title={<span style={{ color: 'var(--chem-text-secondary)' }}>Điểm trung bình</span>}
                value={studentStats.averageScore}
                suffix="%"
                prefix={<BarChartOutlined style={{ color: BRAND_COLORS.PROGRESS }} />}
                valueStyle={{ color: BRAND_COLORS.PROGRESS }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.ACHIEVEMENT}` }}>
              <Statistic
                title={<span style={{ color: 'var(--chem-text-secondary)' }}>Chuỗi học tập</span>}
                value={studentStats.studyStreak}
                suffix=" ngày"
                prefix={<StarOutlined style={{ color: BRAND_COLORS.ACHIEVEMENT }} />}
                valueStyle={{ color: BRAND_COLORS.ACHIEVEMENT }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ 
          borderBottom: '2px solid var(--chem-border)', 
          paddingBottom: 10, 
          color: 'var(--chem-purple-dark)'
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
                  <Title level={4} style={{ margin: 0, color: 'var(--chem-purple-dark)' }}>
                    Bài giảng và Tài liệu
                  </Title>
                  <Text style={{ color: 'var(--chem-text-secondary)' }}>
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
                  <Title level={4} style={{ margin: 0, color: 'var(--chem-purple-dark)' }}>
                    Làm bài kiểm tra
                  </Title>
                  <Text style={{ color: 'var(--chem-text-secondary)' }}>
                    Thực hiện các bài kiểm tra và đánh giá kiến thức của bạn.
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Content Grid */}
      <Row gutter={[24, 24]}>
        {/* Recent Lessons */}
        <Col xs={24} lg={12}>
          <Card className="chemistry-card" style={{ height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ 
                color: 'var(--chem-purple-dark)', 
                margin: 0
              }}>
                <BookOutlined style={{ marginRight: 8, color: BRAND_COLORS.STUDY }} />
                Bài học gần đây
              </Title>
              <Text style={{ color: 'var(--chem-text-secondary)', fontSize: '14px' }}>
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
                color: 'var(--chem-purple-dark)', 
                margin: 0
              }}>
                <CalendarOutlined style={{ marginRight: 8, color: BRAND_COLORS.EXAM }} />
                Sắp tới
              </Title>
              <Text style={{ color: 'var(--chem-text-secondary)', fontSize: '14px' }}>
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
              color: 'var(--chem-purple-dark)', 
              margin: 0
            }}>
              <TrophyOutlined style={{ marginRight: 8, color: BRAND_COLORS.ACHIEVEMENT }} />
              Thành tích
            </Title>
            <Text style={{ color: 'var(--chem-text-secondary)', fontSize: '14px' }}>
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