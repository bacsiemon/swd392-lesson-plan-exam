import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Input, 
  Button, 
  Select,
  Statistic,
  Card,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  BarChartOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

// Import components
import StudentTable from '../components/StudentTable';
import ScoreDistributionChart from '../components/ScoreDistributionChart';
import TestParticipationChart from '../components/TestParticipationChart';
import ClassComparisonChart from '../components/ClassComparisonChart';

// Import utilities
import { 
  classes, 
  students, 
  calculateClassStats, 
  filterStudents 
} from '../services/classManagementUtils';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const ManageClassesPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState('CHEM101');

  const filteredStudents = filterStudents(students, searchText);
  const classStats = calculateClassStats(students);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BookOutlined style={{ fontSize: 32, color: '#1890ff', marginRight: 16 }} />
              <div>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  Quản lý Lớp học Hóa học
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Quản lý học sinh và theo dõi tiến độ học tập
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Button
              onClick={() => navigate('/dashboard')}
              size="large"
              style={{ height: 48, fontSize: '16px' }}
            >
              Quay lại Dashboard
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng học sinh"
              value={classStats.totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={classStats.averageScore}
              suffix="/10"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiến độ TB"
              value={classStats.averageProgress}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Học sinh hoạt động"
              value={classStats.activeStudents}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Lớp học:</Text>
            </div>
            <Select
              value={selectedClass}
              onChange={setSelectedClass}
              style={{ width: '100%' }}
              size="large"
            >
              {classes.map(cls => (
                <Option key={cls.value} value={cls.value}>{cls.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={16}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Tìm kiếm học sinh:</Text>
            </div>
            <Search
              placeholder="Nhập tên, mã số hoặc email học sinh..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Col>
        </Row>
      </Card>

      {/* Main Content with Tabs */}
      <Card>
        <Tabs defaultActiveKey="students" size="large">
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                Danh sách học sinh
              </span>
            } 
            key="students"
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Danh sách học sinh
              </Title>
              <Text type="secondary">
                Hiển thị {filteredStudents.length} học sinh trong lớp {classes.find(c => c.value === selectedClass)?.label}
              </Text>
            </div>
            <StudentTable students={filteredStudents} />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <PieChartOutlined />
                Thống kê điểm số
              </span>
            } 
            key="scores"
          >
            <ScoreDistributionChart students={filteredStudents} />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <CheckCircleOutlined />
                Thống kê bài kiểm tra
              </span>
            } 
            key="tests"
          >
            <TestParticipationChart students={filteredStudents} />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <LineChartOutlined />
                So sánh các lớp
              </span>
            } 
            key="comparison"
          >
            <ClassComparisonChart students={filteredStudents} classes={classes} />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ManageClassesPage;