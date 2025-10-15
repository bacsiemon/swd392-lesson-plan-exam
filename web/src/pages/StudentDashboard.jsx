import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Space, Progress, Statistic, List, Avatar, Badge, Tag } from 'antd';
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

// Add CSS for liquid glass animations
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

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = liquidGlassStyles;
  document.head.appendChild(styleSheet);
}

const { Title, Text } = Typography;

const BRAND_COLORS = {
  LESSON: '#1890ff',
  EXAM: '#52c41a',
  PROGRESS: '#faad14',
  ACHIEVEMENT: '#eb2f96',
  STUDY: '#722ed1',
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentTime] = useState(new Date().toLocaleDateString('vi-VN'));

  // Mock data - in real app, this would come from API
  const studentStats = {
    totalLessons: 24,
    completedLessons: 18,
    totalExams: 8,
    completedExams: 6,
    averageScore: 85,
    studyStreak: 7,
  };

  const recentLessons = [
    {
      id: 1,
      title: 'Phản ứng oxi hóa - khử',
      subject: 'Hóa học 10',
      progress: 100,
      status: 'completed',
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Cân bằng phương trình hóa học',
      subject: 'Hóa học 10',
      progress: 75,
      status: 'in-progress',
      date: '2024-01-14',
    },
    {
      id: 3,
      title: 'Tính chất của kim loại',
      subject: 'Hóa học 10',
      progress: 0,
      status: 'not-started',
      date: '2024-01-16',
    },
  ];

  const upcomingExams = [
    {
      id: 1,
      title: 'Kiểm tra 1 tiết - Chương 1',
      subject: 'Hóa học 10',
      date: '2024-01-20',
      time: '08:00',
      duration: 45,
      type: 'exam',
    },
    {
      id: 2,
      title: 'Bài tập về nhà - Phản ứng hóa học',
      subject: 'Hóa học 10',
      date: '2024-01-18',
      time: '23:59',
      duration: 30,
      type: 'homework',
    },
  ];

  const achievements = [
    {
      id: 1,
      title: 'Học sinh chăm chỉ',
      description: 'Hoàn thành 5 bài học liên tiếp',
      icon: '🏆',
      earned: true,
    },
    {
      id: 2,
      title: 'Thiên tài hóa học',
      description: 'Đạt điểm 10 trong 3 bài kiểm tra',
      icon: '🧪',
      earned: false,
    },
    {
      id: 3,
      title: 'Người học nhanh',
      description: 'Hoàn thành bài học trong thời gian kỷ lục',
      icon: '⚡',
      earned: true,
    },
  ];

  const handleToolClick = (link) => {
    navigate(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'processing';
      case 'not-started': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang học';
      case 'not-started': return 'Chưa bắt đầu';
      default: return 'Không xác định';
    }
  };

  const StatCard = ({ title, value, icon, color, suffix }) => (
    <Card style={{ 
      textAlign: 'center', 
      borderRadius: 16,
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      <Statistic
        title={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{title}</span>}
        value={value}
        prefix={icon}
        suffix={suffix}
        valueStyle={{ color: color, textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
    </Card>
  );

  const ToolCard = ({ title, description, icon, link, color }) => (
    <Col xs={24} sm={12} lg={8} style={{ marginBottom: 24 }}>
      <Card
        hoverable
        onClick={() => handleToolClick(link)}
        style={{
          height: '100%',
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          borderLeft: `4px solid ${color}`,
          transition: 'all 0.3s ease',
          transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Title level={4} style={{ margin: 0, marginLeft: 16, color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              {title}
            </Title>
          </div>
          <p style={{ minHeight: 40, color: 'rgba(255, 255, 255, 0.8)' }}>{description}</p>
          <Button
            type="primary"
            size="large"
            style={{ 
              backgroundColor: color, 
              borderColor: color,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            Bắt đầu
          </Button>
        </Space>
      </Card>
    </Col>
  );

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

        {/* Stats Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Bài học đã hoàn thành"
              value={studentStats.completedLessons}
              suffix={`/ ${studentStats.totalLessons}`}
              icon={<BookOutlined />}
              color={BRAND_COLORS.LESSON}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Điểm trung bình"
              value={studentStats.averageScore}
              suffix="%"
              icon={<TrophyOutlined />}
              color={BRAND_COLORS.ACHIEVEMENT}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Chuỗi học tập"
              value={studentStats.studyStreak}
              suffix="ngày"
              icon={<StarOutlined />}
              color={BRAND_COLORS.PROGRESS}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Bài kiểm tra đã làm"
              value={studentStats.completedExams}
              suffix={`/ ${studentStats.totalExams}`}
              icon={<CheckCircleOutlined />}
              color={BRAND_COLORS.EXAM}
            />
          </Col>
        </Row>

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
              title="Tiếp tục học"
              description="Tiếp tục bài học đang dang dở hoặc bắt đầu bài học mới."
              icon={<PlayCircleOutlined style={{ fontSize: '36px', color: BRAND_COLORS.LESSON }} />}
              link="/lessons"
              color={BRAND_COLORS.LESSON}
            />
            <ToolCard
              title="Làm bài kiểm tra"
              description="Thực hiện các bài kiểm tra và đánh giá kiến thức của bạn."
              icon={<QuestionCircleOutlined style={{ fontSize: '36px', color: BRAND_COLORS.EXAM }} />}
              link="/exams"
              color={BRAND_COLORS.EXAM}
            />
            <ToolCard
              title="Xem tiến độ"
              description="Theo dõi tiến độ học tập và kết quả của bạn."
              icon={<BarChartOutlined style={{ fontSize: '36px', color: BRAND_COLORS.PROGRESS }} />}
              link="/progress"
              color={BRAND_COLORS.PROGRESS}
            />
          </Row>
        </div>

        <Row gutter={[24, 24]}>
          {/* Recent Lessons */}
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>📚 Bài học gần đây</span>} 
              style={{ 
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <List
                dataSource={recentLessons}
                renderItem={(lesson) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleToolClick(`/lesson/${lesson.id}`)}
                      >
                        {lesson.status === 'completed' ? 'Xem lại' : 'Tiếp tục'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: lesson.status === 'completed' ? '#52c41a' : 
                                           lesson.status === 'in-progress' ? '#1890ff' : '#d9d9d9' 
                          }}
                          icon={lesson.status === 'completed' ? <CheckCircleOutlined /> : 
                                lesson.status === 'in-progress' ? <ClockCircleOutlined /> : <BookOutlined />}
                        />
                      }
                      title={lesson.title}
                      description={
                        <div>
                          <div>{lesson.subject}</div>
                          <div style={{ marginTop: 8 }}>
                            <Tag color={getStatusColor(lesson.status)}>
                              {getStatusText(lesson.status)}
                            </Tag>
                            {lesson.status === 'in-progress' && (
                              <Progress 
                                percent={lesson.progress} 
                                size="small" 
                                style={{ marginTop: 4, width: 100 }}
                              />
                            )}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Upcoming Exams */}
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>📅 Sắp tới</span>} 
              style={{ 
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <List
                dataSource={upcomingExams}
                renderItem={(exam) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleToolClick(`/exam/${exam.id}`)}
                      >
                        {exam.type === 'exam' ? 'Làm bài' : 'Nộp bài'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ backgroundColor: exam.type === 'exam' ? '#f5222d' : '#faad14' }}
                          icon={exam.type === 'exam' ? <FileTextOutlined /> : <ClockCircleOutlined />}
                        />
                      }
                      title={exam.title}
                      description={
                        <div>
                          <div>{exam.subject}</div>
                          <div style={{ marginTop: 4 }}>
                            <CalendarOutlined /> {exam.date} lúc {exam.time}
                            <br />
                            <ClockCircleOutlined /> {exam.duration} phút
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Achievements */}
        <div style={{ marginTop: 32 }}>
          <Title level={3} style={{ 
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
            paddingBottom: 10, 
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            🏆 Thành tích
          </Title>
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            {achievements.map((achievement) => (
              <Col xs={24} sm={12} lg={8} key={achievement.id}>
                <Card
                  style={{
                    borderRadius: 16,
                    opacity: achievement.earned ? 1 : 0.6,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    border: achievement.earned ? '2px solid rgba(82, 196, 26, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: 16 }}>
                      {achievement.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                      {achievement.title}
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{achievement.description}</Text>
                    {achievement.earned && (
                      <div style={{ marginTop: 12 }}>
                        <Badge status="success" text="Đã đạt được" />
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
