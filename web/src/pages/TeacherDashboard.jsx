import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Card, Row, Col, Typography, Button, Space, Statistic, Progress, List, Tag } from 'antd';
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
import ChemistryLoader from '../components/ChemistryLoader';
import '../styles/chemistryTheme.css';

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
        link: '/student-test/analytics',
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
        className="chemistry-card"
        onClick={() => handleToolClick(link)}
        style={{
          height: '100%',
          borderLeft: `4px solid ${color}`,
          cursor: 'pointer'
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Title level={4} style={{ margin: 0, marginLeft: 16, color: 'var(--chem-purple-dark)' }}>
              {title}
            </Title>
          </div>
          <p style={{ minHeight: 40, color: 'var(--chem-text-secondary)' }}>{description}</p>
          <Button
            type="primary"
            size="large"
            style={{ 
              backgroundColor: color, 
              borderColor: color,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            Bắt đầu Ngay
          </Button>
        </Space>
      </Card>
    </Col>
  );

  return (
    <div className="chemistry-page">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: 'var(--chem-purple-dark)', marginBottom: 8 }}>
          Chào mừng, Giáo viên! 👋
        </Title>
        <Text style={{ fontSize: '16px', color: 'var(--chem-text-secondary)' }}>
          Hôm nay là {currentTime} - Tổng quan hoạt động giảng dạy của bạn
        </Text>
      </div>

      {/* Statistics Overview */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ChemistryLoader size="large" text="Đang tải thống kê..." />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 32 }}>
            <Title level={3} style={{ 
              borderBottom: '2px solid var(--chem-border)', 
              paddingBottom: 10, 
              color: 'var(--chem-purple-dark)'
            }}>
              📈 Thống kê Tổng quan
            </Title>
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.LESSON}` }}>
                  <Statistic
                    title={<span style={{ color: 'var(--chem-text-secondary)' }}>Bài giảng</span>}
                    value={stats?.totalLessonPlans || 0}
                    prefix={<BookOutlined style={{ color: BRAND_COLORS.LESSON }} />}
                    valueStyle={{ color: BRAND_COLORS.LESSON, fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.QUESTION}` }}>
                  <Statistic
                    title={<span style={{ color: 'var(--chem-text-secondary)' }}>Câu hỏi</span>}
                    value={stats?.totalQuestions || 0}
                    prefix={<QuestionCircleOutlined style={{ color: BRAND_COLORS.QUESTION }} />}
                    valueStyle={{ color: BRAND_COLORS.QUESTION, fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.TEST}` }}>
                  <Statistic
                    title={<span style={{ color: 'var(--chem-text-secondary)' }}>Đề kiểm tra</span>}
                    value={stats?.totalTests || 0}
                    prefix={<TableOutlined style={{ color: BRAND_COLORS.TEST }} />}
                    valueStyle={{ color: BRAND_COLORS.TEST, fontWeight: 'bold' }}
                    suffix={
                      <span style={{ fontSize: '14px', color: 'var(--chem-text-secondary)' }}>
                        ({stats?.publishedTests || 0} đã đăng)
                      </span>
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="chemistry-card" style={{ borderLeft: `4px solid ${BRAND_COLORS.SLIDE}` }}>
                  <Statistic
                    title={<span style={{ color: 'var(--chem-text-secondary)' }}>Học sinh</span>}
                    value={stats?.totalStudents || 0}
                    prefix={<UserOutlined style={{ color: BRAND_COLORS.SLIDE }} />}
                    valueStyle={{ color: BRAND_COLORS.SLIDE, fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* Test Completion Stats */}
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} lg={12}>
              <Card
                className="chemistry-card"
                title={
                  <span style={{ color: 'var(--chem-purple-dark)', fontSize: '16px', fontWeight: 'bold' }}>
                    📊 Thống kê Làm bài
                  </span>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: 'var(--chem-text-secondary)' }}>Đã hoàn thành</Text>
                      <Text strong style={{ color: 'var(--chem-purple-dark)' }}>
                        {stats?.completedTests || 0} bài
                      </Text>
                    </div>
                    <Progress 
                      percent={((stats?.completedTests || 0) / ((stats?.completedTests || 0) + (stats?.pendingTests || 1)) * 100).toFixed(0)} 
                      strokeColor={BRAND_COLORS.LESSON}
                      trailColor="var(--chem-border)"
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: 'var(--chem-text-secondary)' }}>Đang chờ</Text>
                      <Text strong style={{ color: 'var(--chem-purple-dark)' }}>
                        {stats?.pendingTests || 0} bài
                      </Text>
                    </div>
                    <Progress 
                      percent={((stats?.pendingTests || 0) / ((stats?.completedTests || 0) + (stats?.pendingTests || 1)) * 100).toFixed(0)} 
                      strokeColor={BRAND_COLORS.QUESTION}
                      trailColor="var(--chem-border)"
                    />
                  </div>
                  <div style={{
                    background: 'var(--chem-gradient)',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: 'var(--chem-purple-dark)' }}>
                      <TrophyOutlined style={{ marginRight: 8, color: BRAND_COLORS.QUESTION }} />
                      Điểm trung bình
                    </span>
                    <Text strong style={{ fontSize: '20px', color: 'var(--chem-purple-dark)' }}>
                      {stats?.avgTestScore || 0}/10
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                className="chemistry-card"
                title={
                  <span style={{ color: 'var(--chem-purple-dark)', fontSize: '16px', fontWeight: 'bold' }}>
                    🕒 Hoạt động Gần đây
                  </span>
                }
              >
                <List
                  dataSource={recentSubmissions}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        borderBottom: '1px solid var(--chem-border)',
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
                          <Text style={{ color: 'var(--chem-purple-dark)', fontWeight: '500' }}>
                            {item.studentName}
                          </Text>
                        }
                        description={
                          <div>
                            <Text style={{ color: 'var(--chem-text-secondary)', fontSize: '12px' }}>
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
          borderBottom: '2px solid var(--chem-border)', 
          paddingBottom: 10, 
          color: 'var(--chem-purple-dark)'
        }}>
          ✨ Công cụ Sáng tạo Nội dung AI
        </Title>
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {aiTools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </Row>
      </div>

      {/* Management Tools Section */}
      <div style={{ marginTop: 40 }}>
        <Title level={3} style={{ 
          borderBottom: '2px solid var(--chem-border)', 
          paddingBottom: 10, 
          color: 'var(--chem-purple-dark)'
        }}>
          📊 Quản lý & Đánh giá
        </Title>
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {managementTools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </Row>
      </div>
    </div>
  );
};

export default TeacherDashboard;