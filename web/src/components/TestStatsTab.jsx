import React from 'react';
import { Row, Col, Typography, Progress } from 'antd';
import GlassCard from './GlassCard';
import { getProgressColor, getScoreColor } from '../services/classManagementUtils';

const { Title, Text } = Typography;

const TestStatsTab = ({ students }) => {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <GlassCard>
          <Title level={4} style={{ color: 'rgba(255, 255, 255, 0.95)', textAlign: 'center' }}>
            Tỷ lệ hoàn thành bài kiểm tra
          </Title>
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {students.map((student) => (
              <div key={student.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{student.name}</Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {student.completedTests}/{student.totalTests}
                  </Text>
                </div>
                <Progress
                  percent={(student.completedTests / student.totalTests) * 100}
                  strokeColor={getProgressColor((student.completedTests / student.totalTests) * 100)}
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
            Xu hướng điểm số theo thời gian
          </Title>
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', marginBottom: 20 }}>
              Biểu đồ xu hướng điểm số của học sinh qua các bài kiểm tra
            </Text>
            <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'end', justifyContent: 'space-around' }}>
              {students.slice(0, 3).map((student, index) => (
                <div key={student.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    height: `${student.averageScore * 20}px`, 
                    width: 30, 
                    background: `linear-gradient(to top, ${getScoreColor(student.averageScore)}, rgba(255,255,255,0.3))`,
                    borderRadius: '4px 4px 0 0',
                    marginBottom: 8
                  }} />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', textAlign: 'center' }}>
                    {student.name.split(' ').pop()}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </Col>
    </Row>
  );
};

export default TestStatsTab;
