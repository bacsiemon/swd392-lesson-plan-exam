import React from 'react';
import { Row, Col, Typography, Progress, Badge } from 'antd';
import GlassCard from './GlassCard';
import { getScoreColor } from '../services/classManagementUtils';

const { Title, Text } = Typography;

const ScoreStatsTab = ({ students }) => {
  // Mock chart data - in real app, this would come from API
  const testStatsData = {
    averageScores: [8.5, 9.1, 7.6, 9.5, 6.7],
    students: ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em'],
    testCount: 5
  };

  const scoreDistribution = {
    excellent: students.filter(s => s.averageScore >= 9).length,
    good: students.filter(s => s.averageScore >= 8 && s.averageScore < 9).length,
    average: students.filter(s => s.averageScore >= 7 && s.averageScore < 8).length,
    belowAverage: students.filter(s => s.averageScore >= 6 && s.averageScore < 7).length,
    poor: students.filter(s => s.averageScore < 6).length,
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <GlassCard>
          <Title level={4} style={{ color: 'rgba(255, 255, 255, 0.95)', textAlign: 'center' }}>
            Điểm trung bình của học sinh
          </Title>
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {testStatsData.students.map((student, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{student}</Text>
                  <Text style={{ 
                    color: getScoreColor(testStatsData.averageScores[index]), 
                    fontWeight: 600 
                  }}>
                    {testStatsData.averageScores[index]}/10
                  </Text>
                </div>
                <Progress
                  percent={testStatsData.averageScores[index] * 10}
                  strokeColor={getScoreColor(testStatsData.averageScores[index])}
                  size="small"
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </Col>
      
      <Col xs={24} lg={12}>
        <GlassCard>
          <Title level={4} style={{ color: 'rgba(255, 255, 255, 0.95)', textAlign: 'center' }}>
            Phân bố điểm số
          </Title>
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Xuất sắc (9-10 điểm)</Text>
              <Badge count={scoreDistribution.excellent} color="#52c41a" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Giỏi (8-8.9 điểm)</Text>
              <Badge count={scoreDistribution.good} color="#1890ff" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Khá (7-7.9 điểm)</Text>
              <Badge count={scoreDistribution.average} color="#faad14" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Trung bình (6-6.9 điểm)</Text>
              <Badge count={scoreDistribution.belowAverage} color="#fa8c16" />
            </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Yếu (&lt;6 điểm)</Text>
                <Badge count={scoreDistribution.poor} color="#f5222d" />
              </div>
          </div>
        </GlassCard>
      </Col>
    </Row>
  );
};

export default ScoreStatsTab;
