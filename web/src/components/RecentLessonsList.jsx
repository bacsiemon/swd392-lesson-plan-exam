import React from 'react';
import { List, Avatar, Progress, Badge, Typography } from 'antd';
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RecentLessonsList = ({ lessons }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'processing';
      case 'not-started': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang học';
      case 'not-started': return 'Chưa bắt đầu';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in-progress': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'not-started': return <BookOutlined style={{ color: '#d9d9d9' }} />;
      default: return <BookOutlined />;
    }
  };

  return (
    <List
      dataSource={lessons}
      renderItem={(lesson) => (
        <List.Item
          style={{
            background: '#fafafa',
            borderRadius: 12,
            marginBottom: 12,
            padding: '16px',
            border: '1px solid #e8e8e8',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f0f0';
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fafafa';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <List.Item.Meta
            avatar={
              <Avatar
                style={{
                  backgroundColor: lesson.status === 'completed' ? '#52c41a' : 
                                 lesson.status === 'in-progress' ? '#1890ff' : '#d9d9d9',
                  border: '2px solid #e8e8e8',
                }}
                icon={getStatusIcon(lesson.status)}
              />
            }
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#262626', fontWeight: 500 }}>
                  {lesson.title}
                </Text>
                <Badge 
                  status={getStatusColor(lesson.status)} 
                  text={getStatusText(lesson.status)}
                  style={{ fontSize: '12px' }}
                />
              </div>
            }
            description={
              <div>
                <Text style={{ color: '#595959', fontSize: '14px' }}>
                  {lesson.subject} • {new Date(lesson.date).toLocaleDateString('vi-VN')}
                </Text>
                {lesson.progress > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      percent={lesson.progress}
                      size="small"
                      strokeColor={lesson.progress === 100 ? '#52c41a' : '#1890ff'}
                      trailColor="#e8e8e8"
                    />
                  </div>
                )}
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default RecentLessonsList;
