import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Card, Row, Col, Typography, Button, Space, Statistic, Progress, List, Tag, Spin } from 'antd';
import {
  FileTextOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  TableOutlined,
  AreaChartOutlined,
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import dashboardService from '../services/dashboardService';

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
  SLIDE: '#1890ff',
  LESSON: '#52c41a',
  QUESTION: '#faad14',
  TEST: '#eb2f96',
  ANALYTICS: '#f5222d',
};

const aiTools = [
  
  {
    title: 'Xây dựng Giáo án Bài giảng (AI)',
    description: 'Thiết kế giáo án chi tiết và cấu trúc cho bất kỳ chủ đề Hóa học nào.',
    icon: <FileTextOutlined style={{ fontSize: '36px', color: BRAND_COLORS.LESSON }} />,
    link: '/create-lesson-plan',
    color: BRAND_COLORS.LESSON,
  },
  {
    title: 'Ngân hàng Câu hỏi & Ôn tập (AI)',
    description: 'Tự động tạo câu hỏi trắc nghiệm và tự luận chất lượng cao.',
    icon: <QuestionCircleOutlined style={{ fontSize: '36px', color: BRAND_COLORS.QUESTION }} />,
    link: '/question-banks',
    color: BRAND_COLORS.QUESTION,
  },
];

const managementTools = [
    {
        title: 'Quản lý Đề kiểm tra',
        description: 'Tạo, phân phối và chấm điểm các bài kiểm tra từ ngân hàng câu hỏi.',
        icon: <TableOutlined style={{ fontSize: '36px', color: BRAND_COLORS.TEST }} />,
        link: '/manage-tests', 
        color: BRAND_COLORS.TEST,
    },
    {
        title: 'Phân tích Kết quả Học tập',
        description: 'Theo dõi tiến độ, điểm số và các lĩnh vực cần cải thiện của học sinh.',
        icon: <AreaChartOutlined style={{ fontSize: '36px', color: BRAND_COLORS.ANALYTICS }} />,
        link: '/manage-tests',
        color: BRAND_COLORS.ANALYTICS,
    },
];


const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [currentTime] = useState(new Date().toLocaleDateString('vi-VN'));
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, submissionsResponse] = await Promise.all([
        dashboardService.getTeacherStats(),
        dashboardService.getRecentSubmissions(5)
      ]);
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      if (submissionsResponse.success) {
        setRecentSubmissions(submissionsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToolClick = (link) => {
    navigate(link); 
  };

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
            Bắt đầu Ngay
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
            Chào mừng, Giáo viên! 👋
          </Title>
          <Text style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Hôm nay là {currentTime} - Tổng quan hoạt động giảng dạy của bạn
          </Text>
        </div>

        {/* Statistics Overview */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <Title level={3} style={{ 
                borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
                paddingBottom: 10, 
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                📈 Thống kê Tổng quan
              </Title>
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 16,
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderLeft: `4px solid ${BRAND_COLORS.LESSON}`,
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Bài giảng</span>}
                      value={stats?.totalLessonPlans || 0}
                      prefix={<BookOutlined style={{ color: BRAND_COLORS.LESSON }} />}
                      valueStyle={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 16,
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderLeft: `4px solid ${BRAND_COLORS.QUESTION}`,
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Câu hỏi</span>}
                      value={stats?.totalQuestions || 0}
                      prefix={<QuestionCircleOutlined style={{ color: BRAND_COLORS.QUESTION }} />}
                      valueStyle={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 16,
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderLeft: `4px solid ${BRAND_COLORS.TEST}`,
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Đề kiểm tra</span>}
                      value={stats?.totalTests || 0}
                      prefix={<TableOutlined style={{ color: BRAND_COLORS.TEST }} />}
                      valueStyle={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 'bold' }}
                      suffix={
                        <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                          ({stats?.publishedTests || 0} đã đăng)
                        </span>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 16,
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderLeft: `4px solid ${BRAND_COLORS.SLIDE}`,
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Học sinh</span>}
                      value={stats?.totalStudents || 0}
                      prefix={<UserOutlined style={{ color: BRAND_COLORS.SLIDE }} />}
                      valueStyle={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Test Completion Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px', fontWeight: 'bold' }}>
                      📊 Thống kê Làm bài
                    </span>
                  }
                  style={{
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  headStyle={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Đã hoàn thành</Text>
                        <Text strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                          {stats?.completedTests || 0} bài
                        </Text>
                      </div>
                      <Progress 
                        percent={((stats?.completedTests || 0) / ((stats?.completedTests || 0) + (stats?.pendingTests || 1)) * 100).toFixed(0)} 
                        strokeColor={BRAND_COLORS.LESSON}
                        trailColor="rgba(255, 255, 255, 0.2)"
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Đang chờ</Text>
                        <Text strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                          {stats?.pendingTests || 0} bài
                        </Text>
                      </div>
                      <Progress 
                        percent={((stats?.pendingTests || 0) / ((stats?.completedTests || 0) + (stats?.pendingTests || 1)) * 100).toFixed(0)} 
                        strokeColor={BRAND_COLORS.QUESTION}
                        trailColor="rgba(255, 255, 255, 0.2)"
                      />
                    </div>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        <TrophyOutlined style={{ marginRight: 8, color: BRAND_COLORS.QUESTION }} />
                        Điểm trung bình
                      </span>
                      <Text strong style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.95)' }}>
                        {stats?.avgTestScore || 0}/10
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px', fontWeight: 'bold' }}>
                      🕒 Hoạt động Gần đây
                    </span>
                  }
                  style={{
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  headStyle={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  <List
                    dataSource={recentSubmissions}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '12px 0'
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            item.status === 'graded' ? 
                            <CheckCircleOutlined style={{ fontSize: '20px', color: BRAND_COLORS.LESSON }} /> :
                            <ClockCircleOutlined style={{ fontSize: '20px', color: BRAND_COLORS.QUESTION }} />
                          }
                          title={
                            <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: '500' }}>
                              {item.studentName}
                            </Text>
                          }
                          description={
                            <div>
                              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                                {item.testTitle}
                              </Text>
                              {item.score !== null && (
                                <div>
                                  <Tag color={item.score >= 8 ? 'success' : item.score >= 5 ? 'warning' : 'error'}
                                    style={{ marginTop: 4 }}
                                  >
                                    Điểm: {item.score}
                                  </Tag>
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* AI Tools Section */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3} style={{ 
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
            paddingBottom: 10, 
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            ✨ Công cụ Sáng tạo Nội dung AI
          </Title>
          <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
            {aiTools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </Row>
        </div>

        {/* Management Tools Section */}
        <div style={{ marginTop: 40 }}>
          <Title level={3} style={{ 
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
            paddingBottom: 10, 
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            📊 Quản lý & Đánh giá
          </Title>
          <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
            {managementTools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;