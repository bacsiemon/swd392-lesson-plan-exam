import React from 'react';
import { Row, Col, Typography, Progress, Badge } from 'antd';
import GlassCard from './GlassCard';
import { getProgressColor } from '../services/classManagementUtils';

const { Title, Text } = Typography;

const StudyStatsTab = ({ students }) => {
  // Mock chart data - in real app, this would come from API
  const studyStatsData = {
    lessonsCompleted: [20, 22, 19, 23, 16],
    students: ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em'],
    totalLessons: 24
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <GlassCard>
          <Title level={4} style={{ color: 'rgba(255, 255, 255, 0.95)', textAlign: 'center' }}>
            Tiến độ hoàn thành bài học
          </Title>
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {studyStatsData.students.map((student, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{student}</Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {studyStatsData.lessonsCompleted[index]}/{studyStatsData.totalLessons}
                  </Text>
                </div>
                <Progress
                  percent={(studyStatsData.lessonsCompleted[index] / studyStatsData.totalLessons) * 100}
                  strokeColor={getProgressColor((studyStatsData.lessonsCompleted[index] / studyStatsData.totalLessons) * 100)}
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
            Phân bố tiến độ học tập
          </Title>
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Xuất sắc (90-100%)</Text>
              <Badge count={students.filter(s => s.studyProgress >= 90).length} color="#52c41a" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Tốt (80-89%)</Text>
              <Badge count={students.filter(s => s.studyProgress >= 80 && s.studyProgress < 90).length} color="#1890ff" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Khá (70-79%)</Text>
              <Badge count={students.filter(s => s.studyProgress >= 70 && s.studyProgress < 80).length} color="#faad14" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Trung bình (60-69%)</Text>
              <Badge count={students.filter(s => s.studyProgress >= 60 && s.studyProgress < 70).length} color="#fa8c16" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Yếu (&lt;60%)</Text>
              <Badge count={students.filter(s => s.studyProgress < 60).length} color="#f5222d" />
            </div>
          </div>
        </GlassCard>
      </Col>
    </Row>
  );
};

export default StudyStatsTab;
