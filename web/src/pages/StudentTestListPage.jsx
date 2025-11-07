import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Tag, 
  Space, 
  Input,
  Select,
  Badge,
  Divider,
  Progress,
  Empty
} from 'antd';
import {
  ClockCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  LockOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import studentTestService from '../services/studentTestService';
import examAttemptService from '../services/examAttemptService';
import ChemistryLoader from '../components/ChemistryLoader';
import '../styles/chemistryTheme.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const BRAND_COLORS = {
  AVAILABLE: '#52c41a',
  COMPLETED: '#1890ff',
  MISSED: '#ff4d4f',
  LOCKED: '#8c8c8c',
  EASY: '#52c41a',
  MEDIUM: '#faad14',
  HARD: '#ff4d4f',
};

const StudentTestListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    loadTests();
  }, []);

  // Reload tests when navigating back to this page (e.g., from result page)
  useEffect(() => {
    // If we're coming from a different page, reload tests to get updated attempt counts
    // Check if we're on the exam list page (could be /exams or /student-test or other routes)
    const isExamListPage = location.pathname === '/exams' || 
                           location.pathname === '/student-test' ||
                           location.pathname.startsWith('/exams') ||
                           location.pathname.startsWith('/student-test');
    
    if (prevLocationRef.current !== location.pathname && isExamListPage) {
      console.log('Navigated back to exam list, reloading attempt counts...');
      loadTests(true);
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname]);

  // Reload attempt counts when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, reloading attempt counts...');
      loadTests(false); // Don't show loading spinner on focus
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchText, statusFilter, difficultyFilter]);

  const loadTests = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const response = await studentTestService.getAvailableTests();
      if (response.success) {
        const testsData = response.data || [];
        
        // Load attempt count for each test
        const testsWithAttempts = await Promise.all(testsData.map(async (test) => {
          const examId = test.id;
          if (examId) {
            try {
              // Force fresh fetch by calling API directly
              const attemptResult = await examAttemptService.getMyAttemptCount(examId);
              if (attemptResult.success) {
                console.log(`Exam ${examId} (${test.title}): Loaded ${attemptResult.count} total attempts, ${attemptResult.submittedCount || 0} submitted attempts`);
                return {
                  ...test,
                  attempts: attemptResult.count || 0, // Total attempts (all statuses)
                  submittedAttempts: attemptResult.submittedCount || 0, // Only submitted attempts
                  myAttempts: attemptResult.attempts || [],
                  submittedAttemptsList: attemptResult.submittedAttempts || []
                };
              } else {
                console.warn(`Failed to load attempt count for exam ${examId}:`, attemptResult.message);
              }
            } catch (error) {
              console.error(`Error loading attempt count for exam ${examId}:`, error);
            }
          }
          return {
            ...test,
            attempts: test.attempts || 0,
            submittedAttempts: test.submittedAttempts || 0,
            myAttempts: [],
            submittedAttemptsList: []
          };
        }));
        
        console.log('Loaded tests with attempt counts:', testsWithAttempts.map(t => ({ id: t.id, title: t.title, attempts: t.attempts })));
        setTests(testsWithAttempts);
      } else {
        // Handle error response
        console.error('Failed to load tests:', response.message, response.error);
        // Optionally show error message to user
        // You can add a notification/toast here if needed
      }
    } catch (error) {
      console.error('Failed to load tests:', error);
      // Set empty array on error to prevent UI crash
      setTests([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const filterTests = () => {
    let filtered = [...tests];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchText.toLowerCase()) ||
        test.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(test => test.status === statusFilter);
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(test => test.difficulty === difficultyFilter);
    }

    // Sort by deadline
    filtered = studentTestService.sortTests(filtered, 'deadline');
    setFilteredTests(filtered);
  };

  const handleStartTest = (testId) => {
    navigate(`/student-test?id=${testId}`);
  };

  const getStatusConfig = (status) => {
    const configs = {
      available: {
        color: BRAND_COLORS.AVAILABLE,
        text: 'Có thể làm',
        icon: <PlayCircleOutlined />
      },
      completed: {
        color: BRAND_COLORS.COMPLETED,
        text: 'Đã hoàn thành',
        icon: <CheckCircleOutlined />
      },
      missed: {
        color: BRAND_COLORS.MISSED,
        text: 'Đã quá hạn',
        icon: <CloseCircleOutlined />
      },
      locked: {
        color: BRAND_COLORS.LOCKED,
        text: 'Chưa mở',
        icon: <LockOutlined />
      }
    };
    return configs[status] || configs.available;
  };

  const getDifficultyConfig = (difficulty) => {
    const configs = {
      easy: { color: BRAND_COLORS.EASY, text: 'Dễ' },
      medium: { color: BRAND_COLORS.MEDIUM, text: 'Trung bình' },
      hard: { color: BRAND_COLORS.HARD, text: 'Khó' }
    };
    return configs[difficulty] || configs.medium;
  };

  const TestCard = ({ test }) => {
    const statusConfig = getStatusConfig(test.status);
    const difficultyConfig = getDifficultyConfig(test.difficulty);
    const timeRemaining = studentTestService.getTimeRemaining(test.deadline);
    const canStart = studentTestService.isTestAvailable(test);
    const remainingAttempts = test.maxAttempts - test.attempts;

    return (
      <Card
        hoverable={canStart}
        className="chemistry-card"
        style={{
          borderLeft: `4px solid ${statusConfig.color}`,
          height: '100%',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ 
                margin: 0,
                marginBottom: 8
              }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                {test.title}
              </Title>
              <Space size="small" wrap>
                <Tag 
                  icon={statusConfig.icon}
                  color={statusConfig.color}
                  style={{ borderRadius: 12 }}
                >
                  {statusConfig.text}
                </Tag>
                <Tag 
                  color={difficultyConfig.color}
                  style={{ borderRadius: 12 }}
                >
                  {difficultyConfig.text}
                </Tag>
              </Space>
            </div>
          </div>

          {/* Description */}
          <Paragraph 
            style={{ 
              margin: 0,
              minHeight: 40
            }}
            ellipsis={{ rows: 2 }}
          >
            {test.description}
          </Paragraph>

          <Divider style={{ margin: '8px 0' }} />

          {/* Test Info */}
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Space size="small">
                <ClockCircleOutlined />
                <Text style={{ fontSize: '13px' }}>
                  {test.duration} phút
                </Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space size="small">
                <QuestionCircleOutlined />
                <Text style={{ fontSize: '13px' }}>
                  {test.totalQuestions} câu hỏi
                </Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space size="small">
                <CalendarOutlined />
                <Text style={{ fontSize: '13px' }}>
                  {timeRemaining}
                </Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space size="small">
                <UserOutlined />
                <Text style={{ fontSize: '13px' }}>
                  {test.teacher}
                </Text>
              </Space>
            </Col>
          </Row>

          {/* Attempts & Score */}
          {test.status === 'completed' && test.lastScore && (
            <div style={{
              background: 'rgba(24, 144, 255, 0.2)',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
                Điểm số
              </span>
              <Text strong style={{ fontSize: '18px' }}>
                {test.lastScore}/10
              </Text>
            </div>
          )}

          {test.status === 'available' && (
            <div style={{
              background: 'rgba(82, 196, 26, 0.15)',
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              <Text style={{ fontSize: '13px' }}>
                Đã làm: {test.attempts || 0} lần • Đã nộp: {test.submittedAttempts || 0} lần{test.maxAttempts ? ` / ${test.maxAttempts} lần tối đa` : ''} • Còn {remainingAttempts >= 0 ? remainingAttempts : '∞'} lần
              </Text>
            </div>
          )}
          
          {/* Show attempt count for completed tests */}
          {test.status === 'completed' && test.attempts > 0 && (
            <div style={{
              background: 'rgba(24, 144, 255, 0.1)',
              padding: '8px 12px',
              borderRadius: '8px',
              marginTop: 8
            }}>
              <Text style={{ fontSize: '13px' }}>
                Đã làm: {test.attempts} lần • Đã nộp: {test.submittedAttempts || 0} lần
              </Text>
            </div>
          )}

          {/* Tags */}
          {test.tags && test.tags.length > 0 && (
            <Space size="small" wrap>
              {test.tags.map((tag, index) => (
                <Tag 
                  key={index}
                  style={{ borderRadius: 8 }}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          )}

          {/* Action Button */}
          <Button
            type="primary"
            size="large"
            block
            disabled={!canStart}
            onClick={() => handleStartTest(test.id)}
            style={{
              backgroundColor: canStart ? statusConfig.color : '#d9d9d9',
              borderColor: canStart ? statusConfig.color : '#d9d9d9',
              height: '44px',
              borderRadius: '12px',
              fontWeight: '600',
              marginTop: '8px'
            }}
            icon={<PlayCircleOutlined />}
          >
            {test.status === 'completed' ? 'Xem lại bài làm' :
             test.status === 'locked' ? 'Chưa thể làm bài' :
             test.status === 'missed' ? 'Đã quá hạn' :
             'Bắt đầu làm bài'}
          </Button>
        </Space>
      </Card>
    );
  };

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      
      {/* Header */}
      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ExperimentOutlined style={{ fontSize: 32, marginRight: 16 }} />
              <div>
                <Title level={2} className="chemistry-title" style={{ margin: 0 }}>
                  Danh sách Bài kiểm tra
                </Title>
                <Text className="chemistry-subtitle" style={{ fontSize: '16px' }}>
                  Chọn bài kiểm tra để bắt đầu làm bài và đánh giá kiến thức của bạn
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Button
              onClick={() => navigate('/student-dashboard')}
              size="large"
              style={{ height: 48, fontSize: '16px' }}
            >
              Quay lại Dashboard
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card className="chemistry-card" style={{ marginBottom: 32 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Search
                placeholder="Tìm kiếm bài kiểm tra..."
                allowClear
                size="large"
                prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                size="large"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="available">Có thể làm</Option>
                <Option value="completed">Đã hoàn thành</Option>
                <Option value="missed">Đã quá hạn</Option>
                <Option value="locked">Chưa mở</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                size="large"
                value={difficultyFilter}
                onChange={setDifficultyFilter}
                style={{ width: '100%' }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả độ khó</Option>
                <Option value="easy">Dễ</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="hard">Khó</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Statistics Summary */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32, padding: '0 0' }}>
          <Col xs={12} sm={6}>
            <Card className="chemistry-card" style={{ textAlign: 'center', height: '100%' }}>
              <Text strong style={{ fontSize: '12px' }}>Có thể làm</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: BRAND_COLORS.AVAILABLE }}>
                {tests.filter(t => t.status === 'available').length}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="chemistry-card" style={{ textAlign: 'center', height: '100%' }}>
              <Text strong style={{ fontSize: '12px' }}>Đã hoàn thành</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: BRAND_COLORS.COMPLETED }}>
                {tests.filter(t => t.status === 'completed').length}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="chemistry-card" style={{ textAlign: 'center', height: '100%' }}>
              <Text strong style={{ fontSize: '12px' }}>Đã quá hạn</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: BRAND_COLORS.MISSED }}>
                {tests.filter(t => t.status === 'missed').length}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="chemistry-card" style={{ textAlign: 'center', height: '100%' }}>
              <Text strong style={{ fontSize: '12px' }}>Chưa mở</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: BRAND_COLORS.LOCKED }}>
                {tests.filter(t => t.status === 'locked').length}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tests Grid */}
        <div style={{ marginTop: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ChemistryLoader size="large" text="Đang tải danh sách bài kiểm tra..." />
            </div>
          ) : filteredTests.length === 0 ? (
            <Card className="chemistry-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Empty
                description={
                  <Text style={{ fontSize: '16px' }}>
                    Không tìm thấy bài kiểm tra nào
                  </Text>
                }
              />
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {filteredTests.map((test) => (
                <Col xs={24} md={12} lg={8} key={test.id}>
                  <TestCard test={test} />
                </Col>
              ))}
            </Row>
          )}
        </div>
    </div>
  );
};

export default StudentTestListPage;
