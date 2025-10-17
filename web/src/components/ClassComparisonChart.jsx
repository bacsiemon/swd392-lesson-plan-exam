import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const { Title } = Typography;

const ClassComparisonChart = ({ students, classes }) => {
  // Mock data for class comparison (in real app, this would come from API)
  const classComparisonData = [
    {
      class: 'Hóa học Cơ bản 10A',
      averageScore: 8.2,
      totalStudents: 25,
      activeStudents: 23,
      averageProgress: 85,
      testParticipation: 92
    },
    {
      class: 'Hóa học Nâng cao 11B',
      averageScore: 8.8,
      totalStudents: 20,
      activeStudents: 19,
      averageProgress: 91,
      testParticipation: 95
    },
    {
      class: 'Hóa học Hữu cơ 12A',
      averageScore: 9.1,
      totalStudents: 18,
      activeStudents: 17,
      averageProgress: 94,
      testParticipation: 98
    }
  ];

  // Trend data for line chart
  const trendData = [
    { month: 'Tháng 1', score: 7.8, participation: 85 },
    { month: 'Tháng 2', score: 8.1, participation: 88 },
    { month: 'Tháng 3', score: 8.3, participation: 90 },
    { month: 'Tháng 4', score: 8.5, participation: 92 },
    { month: 'Tháng 5', score: 8.7, participation: 94 },
    { month: 'Tháng 6', score: 8.9, participation: 96 }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>
              So sánh điểm trung bình các lớp
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="class" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}/10`,
                    name === 'averageScore' ? 'Điểm trung bình' : 'Số học sinh'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="averageScore" 
                  fill="#1890ff" 
                  name="Điểm trung bình"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>
              Xu hướng điểm số theo thời gian
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" domain={[0, 10]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'score' ? `${value}/10` : `${value}%`,
                    name === 'score' ? 'Điểm trung bình' : 'Tỷ lệ tham gia'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="score" 
                  stroke="#1890ff" 
                  strokeWidth={3}
                  name="Điểm trung bình"
                  dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="participation" 
                  stroke="#52c41a" 
                  strokeWidth={3}
                  name="Tỷ lệ tham gia"
                  dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>
              Tổng quan các lớp
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="totalStudents" 
                  fill="#1890ff" 
                  name="Tổng học sinh"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="activeStudents" 
                  fill="#52c41a" 
                  name="Học sinh hoạt động"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="averageProgress" 
                  fill="#faad14" 
                  name="Tiến độ TB (%)"
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

export default ClassComparisonChart;
