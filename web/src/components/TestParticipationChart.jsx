import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TestParticipationChart = ({ students }) => {
  // Calculate test participation statistics
  const totalStudents = students.length;
  const studentsWhoTookTests = students.filter(s => s.completedTests > 0).length;
  const studentsWhoCompletedAllTests = students.filter(s => s.completedTests === s.totalTests).length;
  const averageParticipation = students.reduce((sum, s) => sum + (s.completedTests / s.totalTests), 0) / totalStudents * 100;

  // Data for participation bar chart
  const participationData = students.map(student => ({
    name: student.name.split(' ').pop(),
    completed: student.completedTests,
    total: student.totalTests,
    participation: (student.completedTests / student.totalTests) * 100
  }));

  // Data for pie chart
  const pieData = [
    { name: 'Đã làm bài', value: studentsWhoTookTests, color: '#52c41a' },
    { name: 'Chưa làm bài', value: totalStudents - studentsWhoTookTests, color: '#f5222d' }
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng học sinh"
              value={totalStudents}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã làm bài kiểm tra"
              value={studentsWhoTookTests}
              suffix={`/${totalStudents}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hoàn thành tất cả"
              value={studentsWhoCompletedAllTests}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tỷ lệ tham gia TB"
              value={averageParticipation.toFixed(1)}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>
              Tỷ lệ tham gia bài kiểm tra
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>
              Số bài kiểm tra đã hoàn thành
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value,
                    name === 'completed' ? 'Đã hoàn thành' : 'Tổng số bài'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="completed" 
                  fill="#52c41a" 
                  name="Đã hoàn thành"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="total" 
                  fill="#d9d9d9" 
                  name="Tổng số bài"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TestParticipationChart;
