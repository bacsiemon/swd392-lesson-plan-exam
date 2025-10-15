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
    <Card style={{ textAlign: 'center', borderRadius: 12 }}>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        suffix={suffix}
        valueStyle={{ color: color }}
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
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderLeft: `5px solid ${color}`,
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Title level={4} style={{ margin: 0, marginLeft: 16, color: color }}>
              {title}
            </Title>
          </div>
          <p style={{ minHeight: 40 }}>{description}</p>
          <Button
            type="primary"
            size="large"
            style={{ backgroundColor: color, borderColor: color }}
          >
            Bắt đầu
          </Button>
        </Space>
      </Card>
    </Col>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ 
        background: '#fff', 
        padding: 40, 
        minHeight: 'calc(100vh - 40px)', 
        borderRadius: 12, 
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)' 
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: '#001529', marginBottom: 8 }}>
            Chào mừng, Học sinh! 👋
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
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
          <Title level={3} style={{ borderBottom: '2px solid #e8e8e8', paddingBottom: 10, color: '#001529' }}>
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
            <Card title="📚 Bài học gần đây" style={{ borderRadius: 12 }}>
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
            <Card title="📅 Sắp tới" style={{ borderRadius: 12 }}>
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
          <Title level={3} style={{ borderBottom: '2px solid #e8e8e8', paddingBottom: 10, color: '#001529' }}>
            🏆 Thành tích
          </Title>
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            {achievements.map((achievement) => (
              <Col xs={24} sm={12} lg={8} key={achievement.id}>
                <Card
                  style={{
                    borderRadius: 12,
                    opacity: achievement.earned ? 1 : 0.6,
                    border: achievement.earned ? '2px solid #52c41a' : '1px solid #d9d9d9',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: 16 }}>
                      {achievement.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {achievement.title}
                    </Title>
                    <Text type="secondary">{achievement.description}</Text>
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
