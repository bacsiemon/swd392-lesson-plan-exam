import React, { useState } from 'react';
import { Card, Table, Typography, Row, Col, Space, Tag, Progress, Statistic, Select, Badge } from 'antd';
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

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
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('1');

  const testScores = [
    {
      key: '1',
      testName: 'Kiểm tra giữa kỳ - Hóa học vô cơ',
      subject: 'Hóa học',
      date: '2025-10-15',
      score: 8.5,
      maxScore: 10,
      status: 'completed',
      type: 'Giữa kỳ',
      semester: '1',
    },
    {
      key: '2',
      testName: 'Kiểm tra 15 phút - Phản ứng Oxi hóa',
      subject: 'Hóa học',
      date: '2025-10-10',
      score: 9.0,
      maxScore: 10,
      status: 'completed',
      type: '15 phút',
      semester: '1',
    },
    {
      key: '3',
      testName: 'Kiểm tra 45 phút - Liên kết hóa học',
      subject: 'Hóa học',
      date: '2025-09-28',
      score: 7.5,
      maxScore: 10,
      status: 'completed',
      type: '45 phút',
      semester: '1',
    },
    {
      key: '4',
      testName: 'Kiểm tra cuối kỳ - Hóa hữu cơ',
      subject: 'Hóa học',
      date: '2025-09-20',
      score: 8.0,
      maxScore: 10,
      status: 'completed',
      type: 'Cuối kỳ',
      semester: '1',
    },
  ];

  const completedTests = testScores.filter((test) => test.status === 'completed');
  const averageScore = (
    completedTests.reduce((sum, test) => sum + test.score, 0) / completedTests.length
  ).toFixed(2);
  const highestScore = Math.max(...completedTests.map((test) => test.score));
  const lowestScore = Math.min(...completedTests.map((test) => test.score));

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

  const columns = [
    {
      title: 'Tên bài kiểm tra',
      dataIndex: 'testName',
      key: 'testName',
      width: '35%',
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
      width: '20%',
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
      width: '20%',
      align: 'center',
      render: (score, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text strong style={{ fontSize: '20px', color: getScoreColor(score) }}>
            {score}/{record.maxScore}
          </Text>
          <Progress
            percent={(score / record.maxScore) * 100}
            strokeColor={getScoreColor(score)}
            showInfo={false}
            size="small"
          />
        </Space>
      ),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: 'Xếp loại',
      key: 'rating',
      width: '15%',
      align: 'center',
      render: (_, record) => {
        const tag = getScoreTag(record.score);
        return <Tag color={tag.color}>{tag.text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      align: 'center',
      render: (status) => (
        <Badge
          status={status === 'completed' ? 'success' : 'processing'}
          text={status === 'completed' ? 'Đã chấm' : 'Đang chấm'}
        />
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
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} bài kiểm tra`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default TestScoresPage;
