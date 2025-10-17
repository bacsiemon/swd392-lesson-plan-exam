import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const { Title } = Typography;

const ScoreDistributionChart = ({ students }) => {
  // Calculate score distribution
  const scoreDistribution = {
    excellent: students.filter(s => s.averageScore >= 9).length,
    good: students.filter(s => s.averageScore >= 8 && s.averageScore < 9).length,
    average: students.filter(s => s.averageScore >= 7 && s.averageScore < 8).length,
    belowAverage: students.filter(s => s.averageScore >= 6 && s.averageScore < 7).length,
    poor: students.filter(s => s.averageScore < 6).length,
  };

  const pieData = [
    { name: 'Xuất sắc (9-10)', value: scoreDistribution.excellent, color: '#52c41a' },
    { name: 'Giỏi (8-8.9)', value: scoreDistribution.good, color: '#1890ff' },
    { name: 'Khá (7-7.9)', value: scoreDistribution.average, color: '#faad14' },
    { name: 'Trung bình (6-6.9)', value: scoreDistribution.belowAverage, color: '#fa8c16' },
    { name: 'Yếu (<6)', value: scoreDistribution.poor, color: '#f5222d' },
  ];

  // Individual student scores for bar chart
  const barData = students.map(student => ({
    name: student.name.split(' ').pop(), // Last name only
    score: student.averageScore,
    completedTests: student.completedTests,
    totalTests: student.totalTests
  }));

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>
              Phân bố điểm số (Biểu đồ tròn)
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
              Điểm số học sinh (Biểu đồ cột)
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'score' ? `${value}/10` : value,
                    name === 'score' ? 'Điểm TB' : 'Bài kiểm tra'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="score" 
                  fill="#1890ff" 
                  name="Điểm trung bình"
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

export default ScoreDistributionChart;
