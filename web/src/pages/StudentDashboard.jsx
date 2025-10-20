import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Card } from 'antd';
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
import StatCard from '../components/StatCard';
import RecentLessonsList from '../components/RecentLessonsList';
import UpcomingExamsList from '../components/UpcomingExamsList';
import AchievementsList from '../components/AchievementsList';
import ToolCard from '../components/ToolCard';

// Import utilities
import { 
  BRAND_COLORS, 
  studentStats, 
  recentLessons, 
  upcomingExams, 
  achievements,
  injectStyles 
} from '../utils/studentDashboardUtils';

const { Title, Text } = Typography;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentTime] = useState(new Date().toLocaleDateString('vi-VN'));

  // Inject CSS styles
  React.useEffect(() => {
    injectStyles();
  }, []);

  const handleToolClick = (link) => {
    navigate(link);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements for liquid glass effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-30%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        animation: 'floatReverse 15s ease-in-out infinite',
        zIndex: 0
      }} />
      
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.15)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '40px 20px', 
        minHeight: '100vh', 
        borderRadius: 0, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: 'rgba(255, 255, 255, 0.95)', marginBottom: 8, textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            Chào mừng, Học sinh! 👋
          </Title>
          <Text style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Hôm nay là {currentTime} - Hãy tiếp tục hành trình học tập của bạn!
          </Text>
        </div>

        {/* Statistics Cards */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3} style={{ 
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
            paddingBottom: 10, 
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            📊 Thống kê học tập
          </Title>
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Tổng bài học"
                value={studentStats.totalLessons}
                icon={<BookOutlined style={{ fontSize: '24px', color: BRAND_COLORS.LESSON }} />}
                color={BRAND_COLORS.LESSON}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Đã hoàn thành"
                value={studentStats.completedLessons}
                icon={<CheckCircleOutlined style={{ fontSize: '24px', color: BRAND_COLORS.EXAM }} />}
                color={BRAND_COLORS.EXAM}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Điểm trung bình"
                value={studentStats.averageScore}
                suffix="%"
                icon={<BarChartOutlined style={{ fontSize: '24px', color: BRAND_COLORS.PROGRESS }} />}
                color={BRAND_COLORS.PROGRESS}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Chuỗi học tập"
                value={studentStats.studyStreak}
                suffix=" ngày"
                icon={<StarOutlined style={{ fontSize: '24px', color: BRAND_COLORS.ACHIEVEMENT }} />}
                color={BRAND_COLORS.ACHIEVEMENT}
              />
            </Col>
          </Row>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3} style={{ 
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
            paddingBottom: 10, 
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            🚀 Hành động nhanh
          </Title>
          <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
            <ToolCard
              title="Tham gia lớp học"
              description="Tìm và tham gia lớp học bằng mã lớp và mật khẩu."
              icon={<PlayCircleOutlined style={{ fontSize: '36px', color: BRAND_COLORS.LESSON }} />}
              link="/enroll-class"
              color={BRAND_COLORS.LESSON}
              onToolClick={handleToolClick}
            />
            <ToolCard
              title="Bài giảng và Tài liệu"
              description="Xem và học các bài giảng được phân phối bởi giáo viên."
              icon={<BookOutlined style={{ fontSize: '36px', color: BRAND_COLORS.STUDY }} />}
              link="/lesson-plans"
              color={BRAND_COLORS.STUDY}
              onToolClick={handleToolClick}
            />
            <ToolCard
              title="Làm bài kiểm tra"
              description="Thực hiện các bài kiểm tra và đánh giá kiến thức của bạn."
              icon={<QuestionCircleOutlined style={{ fontSize: '36px', color: BRAND_COLORS.EXAM }} />}
              link="/exams"
              color={BRAND_COLORS.EXAM}
              onToolClick={handleToolClick}
            />
          </Row>
        </div>

        {/* Content Grid */}
        <Row gutter={[32, 32]}>
          {/* Recent Lessons */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                height: '100%',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ 
                  color: 'rgba(255, 255, 255, 0.95)', 
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  <BookOutlined style={{ marginRight: 8 }} />
                  Bài học gần đây
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Tiếp tục học tập với các bài học chưa hoàn thành
                </Text>
              </div>
              <RecentLessonsList lessons={recentLessons} />
            </Card>
          </Col>

          {/* Upcoming Exams */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                height: '100%',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ 
                  color: 'rgba(255, 255, 255, 0.95)', 
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Sắp tới
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Các bài kiểm tra và bài tập sắp tới
                </Text>
              </div>
              <UpcomingExamsList exams={upcomingExams} />
            </Card>
          </Col>
        </Row>

        {/* Achievements */}
        <div style={{ marginTop: 32 }}>
          <Card
            style={{
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ 
                color: 'rgba(255, 255, 255, 0.95)', 
                margin: 0,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <TrophyOutlined style={{ marginRight: 8 }} />
                Thành tích
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Các thành tích bạn đã đạt được trong quá trình học tập
              </Text>
            </div>
            <AchievementsList achievements={achievements} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;